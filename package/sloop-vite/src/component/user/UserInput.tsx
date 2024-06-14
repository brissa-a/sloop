import { Group, Select, SelectProps } from "@mantine/core";
import { AutocompleteMiniature } from "./AutocompleteMiniature";
import { SloopAvatar } from "./Avatar";


type UserInputProps = {
    data: {
        userId: string;
        username: string;
        avatarUrl: string;
    }[],
} & Omit<SelectProps, "data">

export function UserInput(props: UserInputProps) {
    const { data, ...form } = props;
    const possibleUsers = data.map(({ userId, username }) => ({ label: username, value: userId }))
    const selectedUserId = form.value
    return <Group gap='sm'>
        <SloopAvatar userId={selectedUserId ?? null} />
        <Select
            {...form}
            w="30ch"
            searchable
            data={possibleUsers}
            placeholder="Chercher qui vous souhaitez copier"
            renderOption={opt =>
                <AutocompleteMiniature userId={opt.option.value} />
            } />
    </Group>
}