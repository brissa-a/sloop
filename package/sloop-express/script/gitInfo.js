const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

const execSyncWrapper = (command) => {
  let stdout = null
  try {
    stdout = execSync(command).toString().trim()
  } catch (error) {
    console.error(error)
  }
  return stdout
}

const main = () => {
  let branch = execSyncWrapper("git rev-parse --abbrev-ref HEAD")
  let hash = execSyncWrapper("git rev-parse --short=7 HEAD")
  let fullHash = execSyncWrapper("git rev-parse HEAD")
  let uncommitedFiles = execSyncWrapper("git status --porcelain")
  let tags = execSyncWrapper("git tag --points-at HEAD").split("\n")
  if (tags.length === 1 && tags[0] === "") tags = []

  const obj = {
    comment: "generated by scripts/git_info.js",
    branch,
    hash,
    fullHash,
    tags,
    uncommitedFile: uncommitedFiles.trim().length > 0,
  }

  const filePath = path.resolve("src", "generatedGitInfo.json")
  const fileContents = JSON.stringify(obj, null, 2)

  fs.writeFileSync(filePath, fileContents)
  console.log(`Wrote the following contents to ${filePath}\n${fileContents}`)
}

main()
