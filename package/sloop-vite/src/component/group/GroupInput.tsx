import { Select, SelectProps } from "@mantine/core";
import { trpcReact } from "@sloop-vite/misc/trpc";

type GroupInputProps = SelectProps


export const GroupInput = (props: GroupInputProps) => {
    const allGroups = trpcReact.group.list.useQuery().data || [];

    return <Select
        {...props}
        w="30ch"
        searchable
        data={allGroups.map(({ id, name }) => ({ label: name, value: id }))}
        placeholder="Chercher le groupe auquel vous souhaitez ajouter un membre"
    />
}