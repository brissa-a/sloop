import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { trpcReact } from "@sloop-vite/misc/trpc";
import { useCallback } from "react";
import { CreateGroupForm, CreateGroupModel } from "./CreateGroupFrom";

type CreateGroupActionProps = {
    startingValues: Partial<CreateGroupModel>,
    usedDisclosure: ReturnType<typeof useDisclosure>
}

export const CreateGroupModal = ({ startingValues, usedDisclosure }: CreateGroupActionProps) => {
    const [opened, { close }] = usedDisclosure
    const create = trpcReact.group.create.useMutation()

    const utils = trpcReact.useUtils()
    const onCreate = useCallback((m: CreateGroupModel) => {
        create.mutate(m, {
            onSuccess: async () => {
                utils.group.list.invalidate();
                notifications.show({
                    title: 'Group créé',
                    message: 'Le groupe a été créé avec succès',
                });
                close();
            }
        })
    }, [close, create, utils.group.list])

    return <Modal opened={opened} onClose={close} title="Créer un vote" closeOnClickOutside={false} size={600} centered>
        <CreateGroupForm onCreate={onCreate} startingValues={startingValues} />
    </Modal >;
};


