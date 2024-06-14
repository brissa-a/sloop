/* eslint-disable @typescript-eslint/no-explicit-any */
import { CodeHighlight } from '@mantine/code-highlight';
import { ActionIcon, Center, Modal, Overlay } from "@mantine/core";
import { useDisclosure, useHotkeys } from "@mantine/hooks";
import { IconBraces } from "@tabler/icons-react";
import { useEffect, useState } from "react";



// eslint-disable-next-line @typescript-eslint/no-unused-vars
export let showJson = (_json: string | number | object) => { };


export const JsonDisplayer = () => {
    const [json, setJson] = useState<string | number | object | null>(null);
    useEffect(() => {
        showJson = (json: string | number | object) => setJson(json);
        (window as any).showJson = showJson;
        return () => {
            showJson = () => { };
            (window as any).showJson = showJson;
        };
    });
    return <Modal opened={!!json} onClose={() => setJson(null)} title="Json Display">
        <CodeHighlight code={JSON.stringify(json, null, 2)} language="json" />
    </Modal>;
};

export const KeyOverlay = ({ json }: { json: string | number | object }) => {
    const [opened, { toggle }] = useDisclosure();
    useHotkeys([
        ['mod+j', toggle],
    ]);
    return opened ? <Overlay backgroundOpacity={0.5}>
        <Center w='100%' h='100%'>
            <ActionIcon variant="filled" aria-label="Settings" onClick={() => showJson(json)}>
                <IconBraces />
            </ActionIcon>
        </Center>
    </Overlay > : null;
};
