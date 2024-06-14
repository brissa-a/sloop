import { Box, Button, Group, LoadingOverlay, Select, Space, TextInput } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { trpcReact } from '@sloop-vite/misc/trpc';
import { zodResolver } from 'mantine-form-zod-resolver';
import ms from 'ms';
import { CreateMeetingSchema } from 'sloop-common/sloop_zod/meeting';

import slugify from 'slugify';

import z from 'zod';

export type CreateMeetingModel = z.infer<typeof CreateMeetingSchema>

type Form = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>

type CreateMeetingFormProps = Form & {
    onCreateMeeting: (meeting: CreateMeetingModel) => void
    startingValues?: Partial<CreateMeetingModel>
}

export const CreateMeetingForm = (props: CreateMeetingFormProps) => {
    const groups = trpcReact.group.list.useQuery().data ?? [];
    const initialValues = Object.assign({
        scheduledStartAt: new Date(),
        scheduledEndAt: new Date(Date.now() + ms('1h')),
    }, props.startingValues);
    const form = useForm({
        initialValues,
        validate: zodResolver(CreateMeetingSchema),
    });
    const inputs: Record<keyof CreateMeetingModel, JSX.Element> = {
        // description: <TextInput label="Description" placeholder="Description" {...form.getInputProps('description')} />,
        // location: <TextInput label="Lieu" placeholder="Lieu" {...form.getInputProps('location')} />,
        title: <TextInput
            required
            label="Titre"
            placeholder="Titre"
            {...form.getInputProps('title')}
            onChange={(e) => {
                form.setFieldValue('slug', slugify(e.target.value, { lower: true, strict: true }))
                form.getInputProps('title').onChange(e)
            }}
        />,
        slug: <TextInput
            required
            label="Slug"
            placeholder="Slug"
            {...form.getInputProps('slug')}
        />,
        scheduledStartAt: <DateTimePicker
            required
            label="Début"
            placeholder="Date de début"
            {...form.getInputProps('scheduledStartAt')}
        />,
        scheduledEndAt: <DateTimePicker
            required
            label="Fin"
            placeholder="Date de fin"
            {...form.getInputProps('scheduledEndAt')}
        />,
        groupId: <Box>
            <LoadingOverlay visible={groups.length === 0} />
            <Select
                placeholder="Équipages a convoquer"
                searchable
                nothingFoundMessage="=("

                data={groups.map(x => ({ value: x.id, label: '#' + x.slug }))}
                {...form.getInputProps('groupId')}
            /></Box>
    };
    Object.keys(form.errors).length && console.log(form.errors)
    return <div>
        <Box maw={340} mx="auto">
            <form onSubmit={e => {
                form.onSubmit((values) => {
                    const validated = CreateMeetingSchema.parse(values);
                    props.onCreateMeeting(validated);
                })(e)
            }}>
                <Box mt={15}>{inputs.title}</Box>
                <Box mt={15}>{inputs.slug}</Box>
                <Group grow mt={15}>{inputs.scheduledStartAt}{inputs.scheduledEndAt}</Group>
                <Box mt={15}>{inputs.groupId}</Box>
                <Button type="submit" fullWidth mt={15} >Créer la réunion</Button>
                <Space h={15} />
            </form>
        </Box>
    </div >;
};
