import { verify } from "hono/jwt"
import { Prisma } from "prisma/client"
import type { oAuthCallbackParamsSchema } from "src/gateways/contracts/oauth"
import { OAuthToken, oAuthStateSchema } from "src/gateways/contracts/oauth"
import { OAuthGateway } from "src/gateways/oauth-gateway"
import { ProfileAttributes, Provider } from "src/models/types"
import { z } from "zod"
import { Service, ServiceInput } from "../base"
import { FetchProfile } from "./fetch-profile"

export type HandleCallbackDependencies = {
  oauth: Pick<OAuthGateway, "exchangeCode">
  fetchProfile: Pick<FetchProfile, "call">
  verifyJwt: typeof verify
}

type AuthHandleCallbackErrorMap = {
  new_account: null
  code_exchange_failed: null
  fetch_profile_failed: null
}

export class AuthHandleCallback extends Service<AuthHandleCallbackErrorMap> {
  constructor(
    ctx: ServiceInput,
    private provider: Provider,
    protected deps: HandleCallbackDependencies = {
      oauth: new OAuthGateway(ctx, provider),
      fetchProfile: new FetchProfile(ctx),
      verifyJwt: verify,
    },
  ) {
    super(ctx)
  }

  async call({ state, code }: z.infer<typeof oAuthCallbackParamsSchema>) {
    const { redirect } = await this.validateState(state)

    const auth = await this.exchangeCode(code)
    if (!auth.success) return this.failure("code_exchange_failed", null)

    const profile = await this.fetchProfile(auth.data.accessToken)
    if (!profile.success) return this.failure("fetch_profile_failed", null)

    const user = await this.saveUser(auth.data, profile.data)
    if (!user) return this.failure("new_account", null)
    return this.success({ redirect, user })
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

  private async saveUser(auth: OAuthToken, profile: ProfileAttributes) {
    const user = await this.db.user.findUnique({
      where: { email: profile.email },
    })
    if (!user) return this.createNewUser(auth, profile)
    const matchingAccount = await user.accountFor(this.provider)
    if (!matchingAccount) return null

    return this.updateUser(user.id, matchingAccount.id, profile, auth)
  }

  private async createNewUser(auth: OAuthToken, profile: ProfileAttributes) {
    return this.db.user.create({
      data: {
        ...this.userAttributes(profile),
        id: crypto.randomUUID(),
        accounts: {
          create: {
            ...this.accountAttributes(auth, profile.id),
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
            data: this.accountAttributes(auth, profile.id),
          },
        },
      },
      include: { accounts: true },
    })
  }

  private userAttributes(profile: ProfileAttributes) {
    return {
      email: profile.email,
      displayName: profile.displayName,
      familyName: profile.familyName,
      givenName: profile.givenName,
      picture: profile.picture,
    } satisfies Prisma.UserUpdateInput
  }

  private accountAttributes(auth: OAuthToken, remoteId: string) {
    return {
      provider: this.provider,
      remoteId,
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      scope: auth.scope,
      tokenType: auth.tokenType,
      expiresAt: new Date(Date.now() + auth.expiresIn * 1000),
    } satisfies Prisma.AccountUpdateInput
  }
}
