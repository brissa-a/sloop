import { Text } from "@mantine/core";

export const Id = ({ link }: { id: string, link: string }) => {
    //const clipboard = useClipboard();
    return <div>
        <Text>{link}</Text>
    </div>;
};