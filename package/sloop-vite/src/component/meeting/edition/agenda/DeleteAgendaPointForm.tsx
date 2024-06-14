import { ActionIcon, Box, Button, Input, Popover, Text } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { DeleteAgendaPointSchema } from "@sloop-common/sloop_zod/meeting/agenda";
import { TrpcOut, trpcReact } from "@sloop-vite/misc/trpc";
import { IconTrash } from "@tabler/icons-react";
import React, { useState } from "react";
import { z } from "zod";

type DeleteAgendaPointModel = z.infer<typeof DeleteAgendaPointSchema>

export function DeleteAgendaPointForm({ meeting, agendaPointId }: { meeting: Exclude<TrpcOut['meeting']['byId'], null>, agendaPointId?: string }) {
    const deletePoint = trpcReact.meeting.agenda.deletePoint.useMutation()
    const [opened, setOpened] = useState(false);
    const fieldToFocusRef = React.useRef<HTMLInputElement>(null);

    const form = useForm({
        initialValues: {
            meetingId: meeting.id,
            name: '',
            pointId: agendaPointId
        },
        validate: zodResolver(DeleteAgendaPointSchema),
    });

    const inputs: Record<keyof DeleteAgendaPointModel, JSX.Element> = {
        meetingId: <Input
            type="hidden"
            {...form.getInputProps('meetingId')}
        />,
        pointId: <Input
            type="hidden"
            {...form.getInputProps('pointId')}
        />
    };

    Object.keys(form.errors).length && console.log(form.errors)
    return <Popover closeOnClickOutside={true} opened={opened} onClose={() => setOpened(false)} onOpen={() => {
        fieldToFocusRef.current?.focus()
    }}>
        <Popover.Target>
            <ActionIcon variant="subtle" aria-label="Edit" onClick={() => setOpened(true)}>
                <IconTrash />
            </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown>
            <Box maw={340} mx="auto">
                <form onSubmit={e => {
                    console.log('submitting')
                    form.onSubmit((values) => {
                        const validated = DeleteAgendaPointSchema.parse(values);
                        deletePoint.mutate(validated)
                        setOpened(false)
                    })(e)
                }}>
                    <Text>Êtes vous sur de vouloir supprimer ce point et tous ses sous points ?</Text>
                    {inputs.meetingId}
                    {inputs.pointId}
                    <Button type="submit" fullWidth mt={15} >Oui je suis sure</Button>
                </form>
            </Box>
        </Popover.Dropdown>
    </Popover>
}