import { verify } from "hono/jwt"
import { Prisma, User } from "prisma/client"
import type { oAuthCallbackParamsSchema } from "src/gateways/contracts/oauth"
import { OAuthToken, oAuthStateSchema } from "src/gateways/contracts/oauth"
import { OAuthGateway } from "src/gateways/oauth-gateway"
import { ProfileAttributes, Provider } from "src/models/types"
import { z } from "zod"
import { Service, ServiceInput } from "../base"
import { FetchProfile } from "./fetch-profile"
import { generateAccessToken, generateRefreshToken } from "./utils/tokens"

export type HandleCallbackDependencies = {
  oauth: Pick<OAuthGateway, "exchangeCode">
  fetchProfile: Pick<FetchProfile, "call">
  verifyJwt: typeof verify
  generateAccessToken: typeof generateAccessToken
  generateRefreshToken: typeof generateRefreshToken
}

type AuthHandleCallbackErrorMap = {
  new_account: null
  existing_account: null
  code_exchange_failed: null
  fetch_profile_failed: null
}

export class AuthHandleCallback extends Service<AuthHandleCallbackErrorMap> {
  constructor(
    ctx: ServiceInput,
    private provider: Provider,
    private deps: HandleCallbackDependencies = {
      oauth: new OAuthGateway(ctx, provider),
      fetchProfile: new FetchProfile(ctx),
      verifyJwt: verify,
      generateAccessToken,
      generateRefreshToken,
    },
  ) {
    super(ctx)
  }

  async call({ state, code }: z.infer<typeof oAuthCallbackParamsSchema>) {
    const { redirect, userId } = await this.validateState(state)
    const auth = await this.exchangeCode(code)
    if (!auth.success) return this.failure("code_exchange_failed", null)

    const profile = await this.fetchProfile(auth.data.accessToken)
    if (!profile.success) return this.failure("fetch_profile_failed", null)

    const user = await this.saveUser(userId, auth.data, profile.data)
    if (typeof user === "string") return this.failure(user, null)

    const { accessToken, refreshToken } = await this.generateTokens(user)
    return this.success({ redirect, accessToken, refreshToken })
  }

  private async validateState(state: string) {
    const decoded = await this.deps.verifyJwt(state, this.ctx.env.JWT_SECRET)
    return oAuthStateSchema.parse(decoded)
  }

  private async exchangeCode(code: string) {
    return this.deps.oauth.exchangeCode(code)
  }

  private async fetchProfile(accessToken: string) {
    return this.deps.fetchProfile.call(this.provider, accessToken)
  }

  private async saveUser(
    userId: string | undefined,
    auth: OAuthToken,
    profile: ProfileAttributes,
  ) {
    const account = await this.db.account.findUnique({
      where: { email: profile.email },
      include: { user: true },
    })
    if (!account) {
      if (userId) return this.addNewAccount(userId, profile, auth)
      return this.createNewUser(profile, auth)
    }
    if ((account.provider as Provider) !== this.provider) return "new_account"
    if (userId && account.user.id !== userId) return "existing_account"

    return this.updateUser(account.user.id, account.id, profile, auth)
  }

  private async createNewUser(profile: ProfileAttributes, auth: OAuthToken) {
    return this.db.user.create({
      data: {
        ...this.userAttributes(profile),
        id: crypto.randomUUID(),
        accounts: {
          create: {
            ...this.accountAttributes(auth, profile),
            id: crypto.randomUUID(),
            active: true,
          },
        },
      },
      include: { accounts: true },
    })
  }

  private async updateUser(
    id: string,
    accountId: string,
    profile: ProfileAttributes,
    auth: OAuthToken,
  ) {
    return this.db.user.update({
      where: { id },
      data: {
        ...this.userAttributes(profile),
        accounts: {
          update: {
            where: { id: accountId },
            data: this.accountAttributes(auth, profile),
          },
        },
      },
      include: { accounts: true },
    })
  }

  private async addNewAccount(
    id: string,
    profile: ProfileAttributes,
    auth: OAuthToken,
  ) {
    return this.db.user.update({
      where: { id },
      data: {
        ...this.userAttributes(profile),
        accounts: {
          create: {
            id: crypto.randomUUID(),
            ...this.accountAttributes(auth, profile),
          },
        },
      },
      include: { accounts: true },
    })
  }

  private userAttributes(profile: ProfileAttributes) {
    return {
      displayName: profile.displayName,
      familyName: profile.familyName,
      givenName: profile.givenName,
      picture: profile.picture,
    } satisfies Prisma.UserUpdateInput
  }

  private accountAttributes(auth: OAuthToken, profile: ProfileAttributes) {
    return {
      provider: this.provider,
      remoteId: profile.id,
      email: profile.email,
      ...auth,
    } satisfies Prisma.AccountUpdateInput
  }

  private async generateTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.deps.generateAccessToken(user, this.ctx.env.JWT_SECRET),
      this.deps.generateRefreshToken(),
    ])

    await this.db.refreshToken.create({
      data: {
        ...refreshToken,
        user: { connect: { id: user.id } },
      },
    })
    await this.db.refreshToken.deleteMany({
      where: { userId: user.id, token: { not: refreshToken.token } },
    })

    return { accessToken, refreshToken }
  }
}
