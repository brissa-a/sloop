import { ActionIcon, Box, Button, Checkbox, Group, JsonInput, Pill, Select, SelectProps, Space, Stack, Text, TextInput } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { TrpcOut, trpcReact } from '@sloop-vite/misc/trpc';
import { IconPlus } from '@tabler/icons-react';
import { zodResolver } from 'mantine-form-zod-resolver';
import ms from 'ms';
import { useMemo, useRef, useState } from 'react';
import { CreateVotingSchema } from 'sloop-common/sloop_zod/meeting/voting';

import slugify from 'slugify';

import z from 'zod';

export type CreateVotingModel = z.infer<typeof CreateVotingSchema>

type Form = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>

type CreateVotingFormProps = Form & {
    onCreate: (voting: CreateVotingModel) => void
    startingValues: Partial<CreateVotingModel>
}

const votingMethodValues = ["SINGLE_NAME", "APPROVAL", "JUGEMENT_MAJORITAIRE"]//Object.values(VotingMethod);

const empty: TrpcOut['group']['list'] = []

export const CreateVotingForm = (props: CreateVotingFormProps) => {
    const initialValues = Object.assign({
        votingMethodParams: "{}",
        scheduledStartAt: new Date(),
        scheduledEndAt: new Date(Date.now() + ms('1h')),
        startImmediately: false,
        autoStartEnd: false,
        meetingId: null,
        agendaPointId: null,
    }, props.startingValues);
    const form = useForm({
        initialValues,
        transformValues: (values) => {
            return {
                ...values,
                proposalId: values.proposalId || null,
            }
        },
        validate: zodResolver(CreateVotingSchema),
    });
    const [choice, setChoice] = useState<string>('')
    const choiceInputRef = useRef<HTMLInputElement | null>(null);

    const allGroups = trpcReact.group.list.useQuery().data || empty;
    const inputs: Record<keyof CreateVotingModel, JSX.Element> = useMemo(() => ({
        actualStartAt: <></>,
        actualEndAt: <></>,
        proposalId: form.values.groupId ? <ProposalInput groupId={form.values.groupId} {...form.getInputProps('proposalId')} /> : <Text>Veuillez d'abord choisir un groupe</Text>,
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
        autoStartEnd: <Checkbox {...form.getInputProps('autoStartEnd')} label="Démarrer et terminer automatiquement" />,
        scheduledStartAt: <DateTimePicker
            withAsterisk
            label={form.values.autoStartEnd ? "Démarre automatiquement à" : "Début prévu"}
            placeholder={form.values.autoStartEnd ? "Démarre automatiquement à" : "Début prévu"}
            disabled={form.values.startImmediately}
            {...form.getInputProps('scheduledStartAt')}
            value={
                form.values.startImmediately ? new Date() : form.values.scheduledStartAt
            }
        />,
        scheduledEndAt: <DateTimePicker
            withAsterisk
            label={form.values.autoStartEnd ? "Termine automatiquement à" : "Fin prévue"}
            placeholder={form.values.autoStartEnd ? "Termine automatiquement à" : "Fin prévue"}
            {...form.getInputProps('scheduledEndAt')}
        />,
        groupId: <Select
            w="30ch"
            label="Groupe"
            searchable
            data={allGroups.map(({ id, name }) => ({ label: name, value: id }))}
            placeholder="Chercher le groupe auquel vous souhaitez ajouter un membre"
            {...form.getInputProps('groupId')}
        />,
        meetingId: form.values.groupId ? <MeetingInput groupId={form.values.groupId} {...form.getInputProps('meetingId')} /> : <Text>Veuillez d'abord choisir un groupe</Text>,
        agendaPointId: form.values.meetingId ? <AgendaPointInput meetingId={form.values.meetingId} {...form.getInputProps('agendaPointId')} /> : <Text>Veuillez d'abord choisir une réunion</Text>,
        description: <TextInput
            label="Description"
            placeholder="Description"
            {...form.getInputProps('description')}
        />,
        votingMethodParams: <JsonInput
            withAsterisk
            label="Paramètres de la méthode de vote"
            placeholder="Paramètres de la méthode de vote"
            {...form.getInputProps('votingMethodParams')}
        />,
        votingMethod: <Select
            label="Méthode de vote"
            placeholder="Méthode de vote"
            data={votingMethodValues.map((x) => ({ value: x, label: x }))}
            {...form.getInputProps('votingMethod')}
        />,
        choices: <Stack>
            <Group w="100%">
                <TextInput
                    error={form.getInputProps('choices').error}
                    ref={choiceInputRef}
                    w={"calc(100% - 90px)"} placeholder="Ajouter un choix" value={choice} onChange={(e) => setChoice(e.currentTarget.value)} />
                <ActionIcon
                    w={25}
                    onClick={() => {
                        form.setFieldValue('choices', [...(form.values.choices || []), choice])
                        choiceInputRef.current?.focus()
                        choiceInputRef.current?.select()
                    }}
                >
                    <IconPlus style={{ width: '70%', height: '70%' }} />
                </ActionIcon>
            </Group>
            <Box mih={75}>
                <Pill.Group>
                    {(form.values.choices || []).map((choice) => {
                        return <Pill
                            withRemoveButton
                            key={choice}
                            onRemove={() => {
                                form.setFieldValue('choices', (form.values.choices || []).filter((x) => x !== choice))
                            }}
                        >
                            {choice}
                        </Pill>
                    })}
                </Pill.Group>
            </Box>
        </Stack>,
        startImmediately: <Checkbox {...form.getInputProps('startImmediately')} label="Démarrer le vote immédiatement" />,
    }), [form, allGroups, choice])
    Object.keys(form.errors).length && console.log(form.errors)
    return <div>
        < Box mx="auto" >
            <form onSubmit={e => {
                form.onSubmit((values) => {
                    const validated = CreateVotingSchema.parse(values);
                    props.onCreate(validated);
                })(e)
            }}>
                <Box mt={15}>{inputs.name}</Box>
                <Box mt={15}>{inputs.slug}</Box>
                <Box mt={15}>{inputs.description}</Box>
                <Box mt={15}>{inputs.votingMethod}</Box>
                {/* <Box mt={15}>{inputs.votingMethodParams}</Box> */}
                <Group grow mt={15}>{inputs.scheduledStartAt}{inputs.scheduledEndAt}</Group>
                <Group mt={15}>{inputs.startImmediately}{inputs.autoStartEnd}</Group>
                <Box mt={15}>{inputs.groupId}</Box>
                <Box mt={15}>{inputs.meetingId}</Box>
                <Box mt={15}>{inputs.agendaPointId}</Box>
                <Box mt={15}>{inputs.choices}</Box>
                <Box mt={15}>{inputs.proposalId}</Box>
                <Button type="submit" fullWidth mt={15} >Créer la vote</Button>
                <Space h={15} />
            </form>
        </Box >
    </div >;
};

function ProposalInput({ groupId, ...selectProps }: { groupId: string } & SelectProps) {
    const proposals = trpcReact.proposal.list.useQuery({
        groupId
    }).data || [];

    return <Select
        w="30ch"
        searchable
        label="Proposition"
        data={proposals.map(({ id, name }) => ({ label: name, value: id }))}
        placeholder="Chercher la proposition à laquelle vous souhaitez ajouter un vote"
        {...selectProps}
    />
}

function MeetingInput({ groupId, ...selectProps }: { groupId: string } & SelectProps) {
    const meetings = trpcReact.meeting.list.useQuery({
        groupId
    }).data || [];

    return <Select
        w="30ch"
        searchable
        label="Réunion"
        data={meetings.map(({ id, title }) => ({ label: title, value: id }))}
        placeholder="Chercher la réunion à laquelle vous souhaitez ajouter un vote"
        {...selectProps}
    />
}

function AgendaPointInput({ meetingId, ...selectProps }: { meetingId: string } & SelectProps) {
    const agendaPoints = trpcReact.meeting.agenda.list.useQuery({
        meetingId
    }).data || [];

    return <Select
        w="30ch"
        searchable
        label="Point d'agenda"
        nothingFoundMessage={"Aucun point d'agenda trouvé"}
        data={agendaPoints.map(({ id, name }) => ({ label: name, value: id }))}
        placeholder="Chercher le point d'agenda auquel vous souhaitez ajouter un vote"
        {...selectProps}
    />
}