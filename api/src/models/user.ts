import { PrismaClient } from "@prisma/client"
import { Provider } from "./types"

export function userExtension(client: PrismaClient) {
  return client.$extends({
    name: "User Extension",
    result: {
      user: {
        activeAccount: {
          needs: { id: true },
          async compute({ id }) {
            return await client.account.findFirst({
              where: { userId: id, active: true },
            })
          },
        },
        accountFor: {
          needs: { id: true },
          compute({ id }) {
            return (provider: Provider) =>
              client.account.findFirst({
                where: { userId: id, provider },
              })
          },
        },
      },
    },
  })
}
