import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { trpcReact } from "@sloop-vite/misc/trpc";
import { useCallback } from "react";
import { CreateVotingForm, CreateVotingModel } from "./CreateVotingForm";

type CreateVotingActionProps = {
    startingValues: Partial<CreateVotingModel> & { groupId: string },
    usedDisclosure: ReturnType<typeof useDisclosure>
}

export const CreateVotingModal = ({ startingValues, usedDisclosure }: CreateVotingActionProps) => {
    const [opened, { close }] = usedDisclosure
    const create = trpcReact.meeting.voting.create.useMutation()
    const utils = trpcReact.useUtils()
    const onCreate = useCallback((m: CreateVotingModel) => {
        close();
        create.mutate(m, {
            onSuccess: async () => {
                m.meetingId && utils.meeting.byId.invalidate({ id: m.meetingId });
                utils.group.byId.invalidate({ id: m.groupId });
                notifications.show({
                    title: 'Vote créé',
                    message: 'Le vote a été créé avec succès',
                });
            }
        })
    }, [close, create, utils.group.byId, utils.meeting.byId])


    return <Modal opened={opened} onClose={close} title="Créer un vote" closeOnClickOutside={false} size={600} centered>
        <CreateVotingForm onCreate={onCreate} startingValues={startingValues} />
    </Modal >;
};


