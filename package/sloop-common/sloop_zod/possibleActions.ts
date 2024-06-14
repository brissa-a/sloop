import { AddInviteeSchema, CreateMeetingSchema, EndMeetingSchema, LowerHandSchema, RaiseHandSchema, StartMeetingSchema, UpdateMeetingSchema } from "@sloop-common/sloop_zod/meeting";
import { AddAgendaPointSchema, DeleteAgendaPointSchema, EditAgendaPointSchema, StartPointAgendaSchema } from "@sloop-common/sloop_zod/meeting/agenda";
import { AddMessageSchema, DeleteMessageSchema, EditMessageSchema } from "@sloop-common/sloop_zod/meeting/message";
import { CreateVotingSchema, DoVoteSchema, EndVotingSchema, StartVotingSchema } from "@sloop-common/sloop_zod/meeting/voting";
import { AddMembershipSchema, JoinGroupSchema, LeaveGroupSchema, RevokeMembershipSchema } from "@sloop-common/sloop_zod/user/membership";

import { z } from "zod";
import { AddCopySchema, CreateGroupSchema, DelCopySchema } from "./group";
import { ArchiveProposalSchema, CreateProposalSchema, PublishProposalSchema } from "./proposal";
import { LoginSchema } from "./user";


export const PossibleActions = {
    StartMeetingSchema,
    EndMeetingSchema,
    CreateMeetingSchema,
    UpdateMeetingSchema,

    UserJoinMeetingSchema: z.object({
        meetingId: z.string(),
        userId: z.string(),
    }),
    UserLeftMeetingSchema: z.object({
        meetingId: z.string(),
        userId: z.string(),
    }),

    AddInviteeSchema,

    StartPointAgendaSchema,
    AddAgendaPointSchema,
    EditAgendaPointSchema,
    DeleteAgendaPointSchema,

    AddMessageSchema,
    EditMessageSchema,
    DeleteMessageSchema,

    LowerHandSchema,
    RaiseHandSchema,

    CreateVotingSchema,
    StartVotingSchema,
    EndVotingSchema,
    DoVoteSchema,

    AddCopySchema,
    DelCopySchema,
    CreateGroupSchema,

    RevokeMembershipSchema,
    AddMembershipSchema,
    JoinGroupSchema,
    LeaveGroupSchema,
    LoginSchema,

    CreateProposalSchema,
    PublishProposalSchema,
    ArchiveProposalSchema
}