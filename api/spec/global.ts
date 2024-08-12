import { asyncExec } from "utils"

export default async function setup() {
  console.debug("Running global setup")
  await asyncExec("prisma/scripts/test-reset.sh")
}
