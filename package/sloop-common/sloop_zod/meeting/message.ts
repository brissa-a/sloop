import { z } from 'zod';

export const AddMessageSchema = z.object({ meetingId: z.string(), agendaPointId: z.string().nullish(), userId: z.string(), message: z.string() })
export const EditMessageSchema = z.object({ meetingId: z.string(), messageId: z.string(), userId: z.string(), message: z.string() })
export const DeleteMessageSchema = z.object({ meetingId: z.string(), messageId: z.string() })