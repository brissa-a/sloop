import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { trpcReact } from "@sloop-vite/misc/trpc";
import { useCallback } from "react";
import { CreateProposalForm, CreateProposalModel } from "./CreateProposalForm";

type CreateProposalActionProps = {
    startingValues: Partial<CreateProposalModel>
    usedDisclosure: ReturnType<typeof useDisclosure>
}

export const CreateProposalModal = ({ startingValues, usedDisclosure }: CreateProposalActionProps) => {
    const [opened, { close }] = usedDisclosure
    const create = trpcReact.proposal.create.useMutation()
    const utils = trpcReact.useUtils()

    const onCreate = useCallback((m: CreateProposalModel) => {
        close();
        create.mutate(m, {
            onSuccess: async () => {
                utils.proposal.list.invalidate({ groupId: m.groupId })
                notifications.show({
                    title: 'Proposition créé',
                    message: 'La proposition a été créé avec succés'
                });
            }
        })
    }, [close, create, utils.proposal.list])


    return <Modal opened={opened} onClose={close} title="Créer une proposition" closeOnClickOutside={false} size={600} centered>
        <CreateProposalForm onCreate={onCreate} startingValues={startingValues} />
    </Modal >
};

