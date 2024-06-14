import { prisma } from "../src/misc/prisma"
import { dbWarning } from "./utils"

//pnpm script script/aBasicScript.ts
async function main() {
    await dbWarning()
}

await main().finally(() => prisma.$disconnect())

