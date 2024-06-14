import { GroupSchema } from '@sloop-common/prisma_zod';
import slugify from 'slugify';
import { z } from 'zod';

export const AddCopySchema = z.object({
    groupId: z.string(),
    power: z.number(),
    receiverId: z.string()
})

export const DelCopySchema = z.object({
    groupId: z.string(),
    receiverId: z.string()
})

export const CreateGroupSchema = GroupSchema.pick({
    name: true,
    slug: true,
}).merge(z.object({
    initialCaptainId: z.string().nullish(),
    slug: z.string().refine((slug) => slug === slugify(slug, { lower: true, strict: true }), { message: 'Slug invalide' })
}))