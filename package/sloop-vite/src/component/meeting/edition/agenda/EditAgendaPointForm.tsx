import { ActionIcon, Box, Button, Input, Popover, Text, TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { EditAgendaPointSchema } from "@sloop-common/sloop_zod/meeting/agenda";
import { TrpcOut, trpcReact } from "@sloop-vite/misc/trpc";
import { IconEdit } from "@tabler/icons-react";
import React, { useState } from "react";
import { z } from "zod";

type EditAgendaPointModel = z.infer<typeof EditAgendaPointSchema>

export function EditAgendaPointForm({ meeting, agendaPointId }: { meeting: Exclude<TrpcOut['meeting']['byId'], null>, agendaPointId?: string }) {
    const editPoint = trpcReact.meeting.agenda.editPoint.useMutation()
    const [opened, setOpened] = useState(false);
    const fieldToFocusRef = React.useRef<HTMLInputElement>(null);

    const form = useForm({
        initialValues: {
            meetingId: meeting.id,
            name: '',
            pointId: agendaPointId
        },
        validate: zodResolver(EditAgendaPointSchema),
    });

    const inputs: Record<keyof EditAgendaPointModel, JSX.Element> = {
        meetingId: <Input
            type="hidden"
            {...form.getInputProps('meetingId')}
        />,
        pointId: <Input
            type="hidden"
            {...form.getInputProps('pointId')}
        />,
        name: <TextInput
            required
            placeholder="Nom"
            {...form.getInputProps('name')}
        />,
    };

    Object.keys(form.errors).length && console.log(form.errors)
    return <Popover closeOnClickOutside={true} opened={opened} onClose={() => setOpened(false)} onOpen={() => {
        fieldToFocusRef.current?.focus()
    }}>
        <Popover.Target>
            <ActionIcon variant="subtle" aria-label="Edit" onClick={() => setOpened(true)}>
                <IconEdit />
            </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown>
            <Box maw={340} mx="auto">
                <form onSubmit={e => {
                    console.log('submitting')
                    form.onSubmit((values) => {
                        const validated = EditAgendaPointSchema.parse(values);
                        editPoint.mutate(validated)
                        setOpened(false)
                    })(e)
                }}>
                    <Text>Changer le nom du point</Text>
                    {inputs.meetingId}
                    {inputs.pointId}
                    <Box mt={15}>{inputs.name}</Box>
                    <Button type="submit" fullWidth mt={15} >Enregistrer</Button>
                </form>
            </Box>
        </Popover.Dropdown>
    </Popover>
}