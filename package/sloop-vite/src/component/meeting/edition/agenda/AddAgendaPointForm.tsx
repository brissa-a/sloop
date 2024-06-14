import { ActionIcon, Box, Button, Input, Popover, Text, TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { AddAgendaPointSchema } from "@sloop-common/sloop_zod/meeting/agenda";
import { TrpcOut, trpcReact } from "@sloop-vite/misc/trpc";
import { IconPlus } from "@tabler/icons-react";
import React, { useState } from "react";
import { z } from "zod";

type AddAgendaPointModel = z.infer<typeof AddAgendaPointSchema>

export function AddAgendaPointForm({ meeting, parentAgendaPointId }: { meeting: Exclude<TrpcOut['meeting']['byId'], null>, parentAgendaPointId?: string }) {
    const addPoint = trpcReact.meeting.agenda.addPoint.useMutation()
    const [opened, setOpened] = useState(false);
    const fieldToFocusRef = React.useRef<HTMLInputElement>(null);

    const form = useForm({
        initialValues: {
            meetingId: meeting.id,
            parentId: parentAgendaPointId,
            name: ''
        },
        validate: zodResolver(AddAgendaPointSchema),
    });

    const inputs: Record<keyof AddAgendaPointModel, JSX.Element> = {
        meetingId: <Input
            type="hidden"
            {...form.getInputProps('meetingId')}
        />,
        parentId: <Input
            type="hidden"
            {...form.getInputProps('parentId')}
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
                <IconPlus />
            </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown>
            <Box maw={340} mx="auto">
                <form onSubmit={e => {
                    console.log('submitting')
                    form.onSubmit((values) => {
                        const validated = AddAgendaPointSchema.parse(values);
                        addPoint.mutate(validated)
                        setOpened(false)
                    })(e)
                }}>
                    <Text>Ajouter un sous-point d'agenda</Text>
                    {inputs.meetingId}
                    {inputs.parentId}
                    <Box mt={15}>{inputs.name}</Box>
                    <Button type="submit" fullWidth mt={15} >Enregistrer</Button>
                </form>
            </Box>
        </Popover.Dropdown>
    </Popover>
}