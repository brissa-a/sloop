import { Box, Button, Select, Space, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { trpcReact } from '@sloop-vite/misc/trpc';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useMemo } from 'react';
import { CreateProposalSchema } from 'sloop-common/sloop_zod/proposal';

import slugify from 'slugify';

import z from 'zod';

export type CreateProposalModel = z.infer<typeof CreateProposalSchema>

type Form = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>

type CreateProposalFormProps = Form & {
    onCreate: (proposal: CreateProposalModel) => void
    startingValues: Partial<CreateProposalModel>
}

export const CreateProposalForm = (props: CreateProposalFormProps) => {
    const initialValues = Object.assign({
    }, props.startingValues);
    const form = useForm({
        initialValues,
        validate: zodResolver(CreateProposalSchema),
    });
    const allGroups = trpcReact.group.list.useQuery().data;

    const inputs: Record<keyof CreateProposalModel, JSX.Element> = useMemo(() => ({
        groupId: <Select
            {...form.getInputProps('groupId')}
            w="30ch"
            searchable
            data={(allGroups || []).map(({ id, name }) => ({ label: name, value: id }))}
            placeholder="Chercher le groupe auquel vous souhaitez ajouter un membre"
        />,
        name: <TextInput
            {...form.getInputProps('name')}
            placeholder="Intitulé de la proposition"
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
    }), [allGroups, form])
    Object.keys(form.errors).length && console.log(form.errors)
    return <div>
        < Box mx="auto" >
            <form onSubmit={e => {
                form.onSubmit((values) => {
                    const validated = CreateProposalSchema.parse(values);
                    props.onCreate(validated);
                })(e)
            }}>
                <Box mt={15}>{inputs.groupId}</Box>
                <Box mt={15}>{inputs.name}</Box>
                <Box mt={15}>{inputs.slug}</Box>
                <Button type="submit" fullWidth mt={15} >Créer la proposition</Button>
                <Space h={15} />
            </form>
        </Box >
    </div >;
};
