import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { trpcReact } from "@sloop-vite/misc/trpc";
import { useNavigate } from "@tanstack/react-router";
import { CreateMeetingForm, CreateMeetingModel } from "./CreateMeetingForm";

type CreateMeetingModalProps = {
    startingValues: Partial<CreateMeetingModel>
    usedDisclosure: ReturnType<typeof useDisclosure>
}

export const CreateMeetingModal = ({ startingValues, usedDisclosure }: CreateMeetingModalProps) => {
    const [opened, { close }] = usedDisclosure;
    const navigate = useNavigate();
    const createMeeting = trpcReact.meeting.create.useMutation()
    function onCreateMeeting(m: CreateMeetingModel) {
        close();
        createMeeting.mutate(m, {
            onSuccess: (newMeeting) => {
                notifications.show({
                    title: 'Réunion créée',
                    message: 'La réunion ' + m.title + ' a été créée',
                });
                navigate({
                    to: '/meeting/$id/$slug',
                    params: { id: newMeeting.id, slug: newMeeting.slug }
                })
            }
        })

    }

    return <>
        <Modal opened={opened} onClose={close} title="Créer une réunion" closeOnClickOutside={false}>
            <CreateMeetingForm onCreateMeeting={onCreateMeeting} startingValues={startingValues} />
        </Modal>

    </>;
};

