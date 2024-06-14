import { Button, Center, Group, Input, NumberInput, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { TrpcOut } from '@sloop-vite/misc/trpc';
import { zodResolver } from 'mantine-form-zod-resolver';
import { AddCopySchema } from 'sloop-common/sloop_zod/group';


import { VOTE_BASE_POWER } from '@sloop-express/misc/voting';
import { useSloop } from '@sloop-vite/hooks/sloop';
import z from 'zod';
import { UserInput } from '../user/UserInput';

export type AddCopyModel = z.infer<typeof AddCopySchema>

type Form = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>

type AddCopyFormProps = Form & {
    onAddCopy: (meeting: AddCopyModel) => void,
    group: TrpcOut['group']['byId'],
    startingValues: Partial<AddCopyModel> & { groupId: string }
}

export const AddCopyForm = (props: AddCopyFormProps) => {
    const group = props.group;
    const { user } = useSloop();

    const initialValues = Object.assign({}, props.startingValues);
    const form = useForm({
        initialValues,
        validate: zodResolver(AddCopySchema),
    });
    if (!user) return <div>Vous devez être connecté pour copier</div>;

    const totalPowerGiven = group.copies.filter(x => x.copierId === user.id).reduce((acc, x) => acc + x.power, 0);

    const inputs: Record<keyof AddCopyModel, JSX.Element> = {
        groupId: <Input type="hidden" {...form.getInputProps('groupId')} />,
        power: <NumberInput w="12ch" {...form.getInputProps('power')} error={form.errors.power ? true : false} />,
        receiverId: <UserInput data={group.members} {...form.getInputProps('receiverId')} />,
    };

    Object.keys(form.errors).length && console.log(form.errors)
    if (!group) return <div>Chargement...</div>;
    return <Stack mx="auto">
        <Center>Il vous reste {VOTE_BASE_POWER - totalPowerGiven}% de pouvoir de vote a utiliser</Center>
        <form onSubmit={e => {
            form.onSubmit((values) => {
                const validated = AddCopySchema.parse(values);
                if (validated.power + totalPowerGiven > VOTE_BASE_POWER) {
                    form.setFieldError('power', 'Vous ne pouvez pas copier pour plus 100% de votre pouvoir de vote');
                    return;
                }
                props.onAddCopy(validated);
            })(e)
        }}>
            <Center>
                <Group>
                    {inputs.groupId}
                    <Text>Copier</Text>
                    {inputs.receiverId}
                    <Text>avec</Text>
                    {inputs.power}
                    <Text>% de pouvoir de mes pouvoirs de vote</Text>

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
