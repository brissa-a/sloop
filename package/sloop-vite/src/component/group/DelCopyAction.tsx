import { Button, Popover, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useSloop } from "@sloop-vite/hooks/sloop";
import { TrpcIn, trpcReact } from "@sloop-vite/misc/trpc";
import { ReactNode } from "@tanstack/react-router";
import { useCallback } from "react";


export type DelCopyProps = {
    params: TrpcIn['group']['copyvote']['delete'],
    button: (props: { onClick: () => void, disabled: boolean }) => ReactNode
}

export const DelCopyAction = ({ params, button }: DelCopyProps) => {

    const groupId = params.groupId;
    const del = trpcReact.group.copyvote.delete.useMutation()
    const group = trpcReact.group.byId.useQuery({ id: groupId }).data;
    const utils = trpcReact.useUtils();
    const { user } = useSloop();
    const [opened, { open, close }] = useDisclosure(false);

    const onDelCopy = useCallback(() => {
        close();
        if (!group) return;
        del.mutate(params, {
            onSuccess: async () => {
                await utils.group.byId.refetch({ id: groupId });
                notifications.show({
                    title: 'Copivote',
                    message: 'Nous avons bien enregistré la suppresion de votre copivote',
                });
            }
        })
    }, [close, group, del, params, utils.group.byId, groupId])

    if (!group) return null;
    const disabled = !(user && group.members.map(x => x.userId).includes(user.id));

    const closeAndLeave = () => {
        close();
        onDelCopy();
    };

    return <Popover width={300} position="bottom" withArrow shadow="md" opened={opened} closeOnClickOutside={true}>
        <Popover.Target>
            {button({
                onClick: open,
                disabled,
            })}
        </Popover.Target>
        <Popover.Dropdown>
            <Stack>
                <Text size="xs">Êtes vous sûr de vouloir supprimer cette copie ?</Text>
                <Button onClick={closeAndLeave}>Je suis sur</Button>
            </Stack>
        </Popover.Dropdown>
    </Popover>
};

