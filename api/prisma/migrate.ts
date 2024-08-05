/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
// https://gist.github.com/alexanderson1993/0852a8162ebac591b62a79883a81e1a8
import {
  intro,
  isCancel,
  log,
  outro,
  select,
  spinner,
  text,
} from "@clack/prompts"
import { exec } from "node:child_process"
import fs from "node:fs/promises"
import path from "node:path"
import { snake } from "radash"
import parseArgv from "tiny-parse-argv"
import toml from "toml"

const args = parseArgv(process.argv.slice(2))
const command = args._[0]
const projectRoot = path.resolve()
const asyncExec = (command: string) =>
  new Promise<string>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr))
      } else {
        resolve(stdout)
      }
    })
  })
intro("D1 Prisma Migrate CLI")
if (args.help || !command) {
  switch (command) {
    case "create":
      log.message(`migrate create
  Create a new migration
  Options:
    -n, --name - The name of the migration
    -d, --database - The name of the D1 database
    --create-only - Only create the migration file, do not apply it
    --schema - Custom path to the Prisma schema
    -h, --help - Show this help message`)
      break
    case "apply":
      log.message(`migrate apply
  Apply pending migrations
  Options:
    -d, --database - The name of the D1 database
    --remote - Apply migrations to your remote database
    --schema - Custom path to the Prisma schema
    -h, --help - Show this help message`)
      break
    default:
      log.message(`migrate <command>
  Commands:
    create - Create a new migration
    apply - Apply pending migrations
  Options:
    -h, --help - Show this help message`)
      break
  }
  process.exit(0)
}
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
let wranglerConfig: any
// Check wrangler.toml to see what D1 namespaces are used
try {
  const wranglerToml = await fs.readFile("wrangler.toml", "utf-8")
  wranglerConfig = toml.parse(wranglerToml)
} catch {
  log.error("Could not read wrangler.toml")
  process.exit(1)
}
const databases: { value: string; label: string }[] =
  wranglerConfig.d1_databases?.map((db: { database_name: string }) => ({
    value: db.database_name,
    label: db.database_name,
  })) || []
let database = args.d || args.database || databases[0]?.value
if (command === "create") {
  const database = await getDatabase()
  const migrationName =
    args.name ||
    args.n ||
    (await text({
      message: "What is the name of the migration?",
      validate: (input) => {
        if (input.length === 0) {
          return "Migration name cannot be empty"
        }
      },
    }))
  if (isCancel(migrationName)) {
    process.exit(1)
  }
  const s = spinner()
  s.start("Creating migration")
  const result = await asyncExec(
    `npx wrangler d1 migrations create ${database} ${snake(`${migrationName}`)}`,
  )
  s.stop("Creating migration")
  const resultLines = result.trim().split("\n")
  let pathIndex = resultLines.findIndex((line) => line.endsWith(".sql"))
  if (pathIndex === -1) {
    log.error("Could not find migration path")
    process.exit(1)
  }

  let migrationPath = ""

  while (pathIndex >= 0 && !migrationPath.startsWith("/")) {
    migrationPath = resultLines[pathIndex--] + migrationPath
  }
  s.start("Generating migration diff from Prisma schema")
  await asyncExec(
    `npx prisma migrate diff --script --from-local-d1 --to-schema-datamodel ${
      args.schema || "./prisma/schema.prisma"
    } >> ${migrationPath}`,
  )
  s.stop("Generating migration diff from Prisma schema")
  if (args["create-only"]) {
    outro(`Migration created at ${migrationPath.replace(projectRoot, ".")}`)
    process.exit()
  }
}
if (command === "apply" || command === "create") {
  const database = await getDatabase()
  const s = spinner()
  s.start("Applying migrations")
  await asyncExec(
    `npx wrangler d1 migrations apply ${database} ${
      args.remote ? "--remote" : "--local"
    }`,
  )
  s.stop("Applying migrations")
  s.start("Generating Prisma client")
  await asyncExec(
    `npx prisma generate ${args.schema ? `--schema ${args.schema}` : ""}`,
  )
  s.stop("Generating Prisma client")
  outro("Migrations applied")
}
async function getDatabase() {
  if (databases.length === 0) {
    log.error("No D1 databases found in wrangler.toml")
    process.exit(1)
  }
  database =
    database ||
    (await select({
      message: "Select a database",
      options: databases,
      initialValue: databases[0].value,
    }))
  if (isCancel(database)) {
    process.exit(1)
  }
  return database
}
