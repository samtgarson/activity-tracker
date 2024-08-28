import { Account, User } from "prisma/client"
import { HonoContext } from "src/routes/util"
import { Config } from "src/types/config"

export class ServiceContext {
  static fromContext(ctx: Exclude<ServiceInput, ServiceContext>) {
    return new ServiceContext(
      ctx.env,
      new URL(ctx.req.url),
      ctx.var.ctx?.user,
      ctx.var.ctx?.accounts,
    )
  }

  constructor(
    public env: Config,
    public url: URL,
    public user: User,
    public accounts: Account[],
  ) {}

  get activeAccount() {
    return this.accounts.find((a) => a.active)
  }

  findAccount(id: string) {
    if (id === "active") return this.activeAccount
    return this.accounts.find((a) => a.id === id)
  }
}

export type ServiceInput =
  | (Pick<HonoContext, "env" | "var"> & {
      req: Pick<Request, "url">
    })
  | ServiceContext

export class HasRequestContext {
  protected ctx: ServiceContext
  constructor(ctx: ServiceInput) {
    if (ctx instanceof ServiceContext) {
      this.ctx = ctx
    } else {
      this.ctx = ServiceContext.fromContext(ctx)
    }
  }
}
