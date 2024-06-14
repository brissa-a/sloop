import { ActionIcon, Box, Button, Popover, TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { UpdateMeetingSchema } from "@sloop-common/sloop_zod/meeting";
import { TrpcOut, trpcReact } from "@sloop-vite/misc/trpc";
import { IconEdit } from "@tabler/icons-react";
import React, { useState } from "react";
import slugify from 'slugify';
import { z } from "zod";

type UpdateMeetingModel = z.infer<typeof UpdateMeetingSchema>

const EditTitleFormSchema = z.object({
    title: z.string(),
    slug: z.string(),
})

export function EditTitleForm({ meeting }: { meeting: TrpcOut['meeting']['byId'] }) {
    const updateMeeting = trpcReact.meeting.update.useMutation()
    const [opened, setOpened] = useState(false);
    const fieldToFocusRef = React.useRef<HTMLInputElement>(null);

    const form = useForm({
        initialValues: EditTitleFormSchema.parse(meeting),
        validate: zodResolver(UpdateMeetingSchema.shape.update),
    });

    const inputs: Record<keyof UpdateMeetingModel['update'], JSX.Element> = {
        title: <TextInput
            required
            placeholder="Titre"
            {...form.getInputProps('title')}
            onChange={(e) => {
                form.setFieldValue('slug', slugify(e.target.value, { lower: true, strict: true }))
                form.getInputProps('title').onChange(e)
            }}
        />,
        slug: <TextInput
            required
            placeholder="Slug"
            {...form.getInputProps('slug')}
        />,
        description: <></>,
        scheduledStartAt: <></>,
        scheduledEndAt: <></>,
        location: <></>,
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
                        const validated = UpdateMeetingSchema.parse({
                            id: meeting.id,
                            update: values,
                        });
                        updateMeeting.mutate(validated)
                        setOpened(false)
                    })(e)
                }}>
                    <Box mt={15}>{inputs.title}</Box>
                    <Box mt={15}>{inputs.slug}</Box>
                    <Button type="submit" fullWidth mt={15} >Enregistrer</Button>
                </form>
            </Box>
        </Popover.Dropdown>
    </Popover>
}