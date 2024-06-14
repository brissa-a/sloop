
import yesno from "yesno"
import { exit, env } from "process"

const regex = /:(?!\/\/)(.*?)@/

export async function dbWarning() {
  const { DATABASE_URL } = env

  console.log(
    `You are about to run script on database ${DATABASE_URL?.replace(
      regex,
      "@"
    )}.`
  )
  const ok = await yesno({
    question: `Are you sure? (y/n)`,
  })
  if (!ok) {
    console.log("Aborting...")
    process.exit(1)
  }
}

export async function areYouSure() {
  const ok = await yesno({
    question: `Are you sure? (y/n)`,
  })
  if (!ok) {
    console.log("Aborting...")
    exit(1)
  }
}
