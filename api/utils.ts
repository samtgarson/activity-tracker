import { exec } from "node:child_process"

export function asyncExec(command: string) {
  return new Promise<string>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr))
      } else {
        resolve(stdout)
      }
    })
  })
}
