import { Button, Center, Group, Select, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { trpcReact } from '@sloop-vite/misc/trpc';
import { zodResolver } from 'mantine-form-zod-resolver';
import { AddMembershipSchema } from 'sloop-common/sloop_zod/user/membership';


import { DateInput } from '@mantine/dates';
import { useSloop } from '@sloop-vite/hooks/sloop';
import z from 'zod';
import { UserInput } from '../UserInput';

export type AddMembershipModel = z.infer<typeof AddMembershipSchema>

type Form = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>

type AddMembershipFormProps = Form & {
    onAddMembership: (membership: AddMembershipModel) => void,
    startingValues: Partial<AddMembershipModel>
}

export const AddMembershipForm = (props: AddMembershipFormProps) => {
    const { user } = useSloop();

    const initialValues = Object.assign({}, props.startingValues);
    const form = useForm({
        initialValues,
        validate: zodResolver(AddMembershipSchema),
    });

    const allGroups = trpcReact.group.list.useQuery().data || [];
    const allUsers = trpcReact.user.list.useQuery().data || [];
    const usersData = allUsers
        .flatMap(({ username, avatarUrl, ...remain }) => username && avatarUrl ? [{ username, avatarUrl, ...remain }] : [])
        .map(({ id, avatarUrl, username }) => ({ userId: id, avatarUrl, username }))
    if (!user) return <div>Vous devez être connecté pour copier</div>;


    const inputs: Record<keyof AddMembershipModel, JSX.Element> = {
        groupId: <Select
            {...form.getInputProps('groupId')}
            w="30ch"
            searchable
            data={allGroups.map(({ id, name }) => ({ label: name, value: id }))}
            placeholder="Chercher le groupe auquel vous souhaitez ajouter un membre"
        />,
        userId: <UserInput data={usersData} {...form.getInputProps('userId')} />,
        expirationDate: <DateInput {...form.getInputProps('expirationDate')} />,
        startDate: <DateInput {...form.getInputProps('startDate')} />,
        role: <Select
            {...form.getInputProps('role')}
            w="30ch"
            data={[
                { label: 'Membre', value: "MEMBER" },
                { label: 'Capitaine', value: "CAPTAIN" },
            ] as const}
            placeholder="Chercher le groupe auquel vous souhaitez ajouter un membre"
        />,
    };

    Object.keys(form.errors).length && console.log(form.errors)

    return <Stack mx="auto">
        <form onSubmit={e => {
            form.onSubmit((values) => {
                const validated = AddMembershipSchema.parse(values);
                props.onAddMembership(validated);
            })(e)
        }}>
            <Center>
                <Group>
                    {inputs.userId}
                    {inputs.role}
                    {inputs.groupId}
                    {inputs.startDate}
                    {inputs.expirationDate}
                </Group>
            </Center>
            <Stack h={'50'} justify='center'>
                <Center>
                    {Object.values(form.errors).map((error, i) => <Text key={i} c="red">{error}</Text>)}
                </Center>
            </Stack>
            <Group justify='center'><Button type="submit" mt={15} >Enregistrer</Button></Group>
        </form>
    </Stack>
};
