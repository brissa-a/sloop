import { GroupMembershipSchema } from "@sloop-common/prisma_zod";
import { z } from "zod";
import { commonlyFilledByBackend } from "../misc";

export const RevokeMembershipSchema = z.object({
    membershipId: z.string(),
})

export const AddMembershipSchema = GroupMembershipSchema.omit(commonlyFilledByBackend)

export const JoinGroupSchema = z.object({
    groupId: z.string(),
})

export const LeaveGroupSchema = z.object({
    groupId: z.string(),
})