import { HoverCard, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { trpcReact } from "@sloop-vite/misc/trpc";
import { ReactNode } from "@tanstack/react-router";
import { useCallback } from "react";
import { AddCopyForm, AddCopyModel } from "./AddCopyForm";
import { useSloop } from "@sloop-vite/hooks/sloop";

type DelegateActionProps = {
    startingValues: Partial<AddCopyModel> & { groupId: string },
    button: (props: { onClick: () => void, disabled: boolean }) => ReactNode
}

export const AddCopyAction = ({ startingValues, button }: DelegateActionProps) => {
    const groupId = startingValues.groupId;
    const [opened, { open, close }] = useDisclosure(false);
    const addCopyvote = trpcReact.group.copyvote.add.useMutation()
    const group = trpcReact.group.byId.useQuery({ id: groupId }).data;
    const utils = trpcReact.useUtils();
    const { user } = useSloop();

    const onAddCopy = useCallback((m: AddCopyModel) => {
        close();
        if (!group) return;
        addCopyvote.mutate(m, {
            onSuccess: async () => {
                await utils.group.byId.refetch({ id: groupId });
                notifications.show({
                    title: 'Copivote',
                    message: 'Nous avons bien enregistré votre copivote',
                });
            }
        })
    }, [close, addCopyvote, utils.group.byId, groupId])

    if (!group) return null;

    const disabled = !(user && group.members.map(x => x.userId).includes(user.id));
    return <>
        <Modal opened={opened} onClose={close} title="Copier" closeOnClickOutside={false} size={'auto'} centered>
            <AddCopyForm onAddCopy={onAddCopy} startingValues={startingValues} group={group} />
        </Modal>
        <HoverCard disabled={!disabled}>
            <HoverCard.Target>
                {button({
                    onClick: open,
                    disabled,
                })}
            </HoverCard.Target>
            <HoverCard.Dropdown>
                {user ? "Vous devez être membre du groupe de vote pour copier" : "Vous devez être connecté pour copier"}
            </HoverCard.Dropdown>
        </HoverCard>
    </>;
};

