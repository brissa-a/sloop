import { z } from 'zod';

export const AddAgendaPointSchema = z.object({ meetingId: z.string(), parentId: z.string().nullish(), name: z.string() })
export const EditAgendaPointSchema = z.object({ meetingId: z.string(), pointId: z.string(), name: z.string() })
export const DeleteAgendaPointSchema = z.object({ meetingId: z.string(), pointId: z.string() })
export const StartPointAgendaSchema = z.object({ meetingId: z.string(), pointId: z.string() })