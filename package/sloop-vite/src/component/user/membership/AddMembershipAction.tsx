import { HoverCard, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useSloop } from "@sloop-vite/hooks/sloop";
import { trpcReact } from "@sloop-vite/misc/trpc";
import { ReactNode } from "@tanstack/react-router";
import { useCallback } from "react";

import { AddMembershipForm, AddMembershipModel } from "./AddMembershipForm";

type DelegateActionProps = {
    startingValues: Partial<AddMembershipModel>,
    button: (props: { onClick: () => void, disabled: boolean }) => ReactNode
}

export const AddMembershipAction = ({ startingValues, button }: DelegateActionProps) => {
    const [opened, { open, close }] = useDisclosure(false);
    const addMembership = trpcReact.user.membership.add.useMutation();
    const utils = trpcReact.useUtils();
    const { user } = useSloop();

    const onAddMembership = useCallback((m: AddMembershipModel) => {
        close();
        addMembership.mutate(m, {
            onSuccess: async (e) => {
                await utils.group.byId.refetch({ id: e.groupId });
                await utils.user.byId.refetch({ id: e.userId });
                notifications.show({
                    title: 'Adhésion créé',
                    message: 'Nous avons bien enregistré la nouvelle adhésion',
                });
            }
        })
    }, [close, addMembership, utils])

    const disabled = false
    return <>
        <Modal opened={opened} onClose={close} title="Copier" closeOnClickOutside={false} size={'auto'} centered>
            <AddMembershipForm onAddMembership={onAddMembership} startingValues={startingValues} />
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

