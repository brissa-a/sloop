import { MeetingSchema } from '@sloop-common/prisma_zod';
import { z } from 'zod';
import slugify from 'slugify';
import { commonlyFilledByBackend } from './misc';

//
//Meeting
//

export const CreateMeetingSchema = MeetingSchema
    .omit({
        ...commonlyFilledByBackend,
        actualEndAt: true, actualStartAt: true, currentAgendaPointId: true,
        description: true, location: true
    })
    .refine(({ scheduledStartAt, scheduledEndAt }) => scheduledStartAt < scheduledEndAt, {
        message: 'La date de fin doit être après la date de début'
    })
    .refine(({ slug }) => slug === slugify(slug, { lower: true, strict: true }), { message: 'Slug invalide' })

export const UpdateMeetingSchema = z.object({
    id: z.string(),
    update: MeetingSchema.omit({
        ...commonlyFilledByBackend,
        actualEndAt: true,
        actualStartAt: true,
        currentAgendaPointId: true,
        groupId: true,
    })
        .partial()
        // .refine(({ scheduledStartAt, scheduledEndAt }) => scheduledStartAt < scheduledEndAt, {
        //     message: 'La date de fin doit être après la date de début'
        // })
        .refine(({ slug }) => slug === undefined || slug === slugify(slug, { lower: true, strict: true }), { message: 'Slug invalide' })
})

export const AddInviteeSchema = z.object({ meetingId: z.string(), userId: z.string() })

export const StartMeetingSchema = z.object({ id: z.string() })
export const EndMeetingSchema = z.object({ id: z.string() })

export const LowerHandSchema = z.object({ id: z.string() })
export const RaiseHandSchema = z.object({ id: z.string() })

