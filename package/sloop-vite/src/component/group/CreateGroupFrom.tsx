import { Box, Button, Space, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useMemo } from 'react';
import { CreateGroupSchema } from 'sloop-common/sloop_zod/group';

import slugify from 'slugify';

import z from 'zod';
import { UserInput } from '../user/UserInput';
import { TrpcOut, trpcReact } from '@sloop-vite/misc/trpc';

export type CreateGroupModel = z.infer<typeof CreateGroupSchema>

type Form = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>

type CreateGroupFormProps = Form & {
    onCreate: (voting: CreateGroupModel) => void
    startingValues: Partial<CreateGroupModel>
}

const empty: TrpcOut['user']['list'] = []

export const CreateGroupForm = (props: CreateGroupFormProps) => {
    const initialValues = Object.assign({

    }, props.startingValues);

    const users = (trpcReact.user.list.useQuery().data ?? empty)
        .flatMap(({ username, avatarUrl, ...remain }) => username && avatarUrl ? [{ username, avatarUrl, ...remain }] : [])
        .map(({ id, avatarUrl, username }) => ({ userId: id, avatarUrl, username }))

    const form = useForm({
        initialValues,
        transformValues: (values) => {
            //Transform undefined to null for the backend
            return {
                ...values,
            }
        },
        validate: zodResolver(CreateGroupSchema),
    });
    const inputs: Record<keyof CreateGroupModel, JSX.Element> = useMemo(() => ({
        name: <TextInput
            withAsterisk
            label="Titre"
            placeholder="Nom"
            {...form.getInputProps('name')}
            onChange={(e) => {
                form.setFieldValue('slug', slugify(e.target.value, { lower: true, strict: true }))
                form.getInputProps('name').onChange(e)
            }}
        />,
        slug: <TextInput
            withAsterisk
            label="Slug"
            placeholder="Slug"
            {...form.getInputProps('slug')}
        />,
        initialCaptainId: <UserInput data={users} {...form.getInputProps('initialCaptainId')} />,
    }), [form, users])
    Object.keys(form.errors).length && console.log(form.errors)
    return <div>
        < Box mx="auto" >
            <form onSubmit={e => {
                form.onSubmit((values) => {
                    const validated = CreateGroupSchema.parse(values);
                    props.onCreate(validated);
                })(e)
            }}>
                <Box mt={15}>{inputs.name}</Box>
                <Box mt={15}>{inputs.slug}</Box>
                <Box mt={15}>{inputs.initialCaptainId}</Box>
                <Button type="submit" fullWidth mt={15} >Créer la groupe</Button>
                <Space h={15} />
            </form>
        </Box >
    </div >;
};
