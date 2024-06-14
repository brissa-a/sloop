import { faker } from "@faker-js/faker";
import { hash as argon2Hash } from 'argon2';
import { nanoid } from "nanoid";
import slugify from "slugify";
import { prisma } from "../src/misc/prisma";
import { dbWarning } from "./utils";

//pnpm script script/createUser.ts
async function main() {
    await dbWarning()
    const user = await prisma.user.create({
        data: {
            id: nanoid(),
            username: "yesy",
            slug: slugify("test", { lower: true, strict: true }),
            isAdmin: false,
            confidential: {
                create: {
                    id: nanoid(),
                    email: "osef@osef.fr",
                    passwordHash: await argon2Hash("admin")
                }
            },
            avatarUrl: faker.image.avatar(),
        }
    });
    console.log('User created')
    return user
}

main().finally(() => prisma.$disconnect())
