import { ActionIcon, Button, HoverCard, Popover, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { TrpcOut, trpcReact } from "@sloop-vite/misc/trpc";
import { IconDoorEnter, IconDoorExit } from "@tabler/icons-react";
import { useSloop } from "../../hooks/sloop";

type JoinLeaveButtonProps = {
    group: TrpcOut['group']['byId'],
    showButtonLabels: boolean | undefined
}

export const JoinLeaveButton = ({ group, showButtonLabels }: JoinLeaveButtonProps) => {
    const { user } = useSloop();

    const joined = group?.members.some(m => m.userId === user?.id);
    const utils = trpcReact.useUtils()
    const join = trpcReact.user.membership.join.useMutation({
        onSuccess: () => {
            utils.group.byId.invalidate({ id: group?.id })
            utils.user.byId.invalidate({ id: user?.id })
            notifications.show({
                title: 'Équipage rejoint',
                message: 'Vous avez rejoint l\'équipage ' + group?.name,
            });
        }
    }).mutate
    const leave = trpcReact.user.membership.leave.useMutation({
        onSuccess: () => {
            utils.group.byId.invalidate({ id: group?.id })
            utils.user.byId.invalidate({ id: user?.id })
            notifications.show({
                title: 'Équipage quitté',
                message: 'Vous avez quitté l\'équipage ' + group?.name,
            });
        }
    }).mutate


    const status = !user ? 'not-logged-in'
        : joined ? 'joined'
            : 'not-joined';

    const joinAndNotify = () => {
        if (!user || !group) return;
        join({
            groupId: group.id
        })
    };
    const leaveAndNotify = () => {
        if (!user || !group) return;
        leave({
            groupId: group.id
        })
    };

    return status === 'joined' ? <LeaveButton onClick={leaveAndNotify} showButtonLabels={showButtonLabels} />
        : status === 'not-joined' ? <JoinButton onClick={joinAndNotify} showButtonLabels={showButtonLabels} />
            : <JoinButtonNotLogged />;
};

const LeaveButton = ({ onClick, showButtonLabels }: { onClick: () => void, showButtonLabels: boolean | undefined }) => {
    const [opened, { open, close }] = useDisclosure(false);
    const closeAndLeave = () => {
        close();
        onClick();
    };
    return <>
        <Popover width={300} position="bottom" withArrow shadow="md" opened={opened} closeOnClickOutside={true}>
            <Popover.Target>
                {showButtonLabels ?
                    <Button onClick={open} rightSection={<IconDoorExit />} variant="subtle">Quitter</Button>
                    : <ActionIcon onClick={open} variant="subtle" aria-label="Quitter"><IconDoorExit /></ActionIcon>
                }
            </Popover.Target>
            <Popover.Dropdown>
                <Stack>
                    <Text size="xs">Êtes vous sûr de vouloir quitter cet équipage ?</Text>
                    <Button onClick={closeAndLeave}>Je suis sur</Button>
                    <Text size="xs" c='dimmed'>Vous ne pourrez plus participer aux prises de décisions de cet équipage, et ne receverez plus de notifications pour les nouveaux votes/réuions/motions</Text>
                </Stack>
            </Popover.Dropdown>
        </Popover>
    </>;
};

const JoinButton = ({ onClick, showButtonLabels }: { onClick: () => void, showButtonLabels: boolean | undefined }) => {
    return <HoverCard width={200} position="bottom" withArrow shadow="md">
        <HoverCard.Target>
            {showButtonLabels ?
                <Button onClick={onClick} variant="light" rightSection={<IconDoorEnter />}>Rejoindre</Button>
                : <ActionIcon onClick={onClick} variant="light" aria-label="Rejoindre"><IconDoorEnter /></ActionIcon>
            }
        </HoverCard.Target>
        <HoverCard.Dropdown>
            <Text size="xs">L'inscription a cette équipage n'est pas libre ! Pour le rejoindre merci de...</Text>
        </HoverCard.Dropdown>
    </HoverCard>;
};

const JoinButtonNotLogged = () => {
    const [opened, { open, close }] = useDisclosure(false);

    return <Popover width={200} position="bottom" withArrow shadow="md" opened={opened} closeOnClickOutside onClose={close}>
        <Popover.Target>
            <Button variant="light" onClick={open} rightSection={<IconDoorEnter />}>Rejoindre</Button>
        </Popover.Target>
        <Popover.Dropdown>
            <Text size="xs">Il faut vous identifier avant de pouvoir rejoindre un équipage</Text>
        </Popover.Dropdown>
    </Popover>;
};