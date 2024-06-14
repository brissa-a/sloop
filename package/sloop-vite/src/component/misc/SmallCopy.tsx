import { ActionIcon, CopyButton, Tooltip } from "@mantine/core"
import { IconCheck, IconCopy } from "@tabler/icons-react"

export function SmallCopyButton({ text }: { text: string }) {
    return <CopyButton value={text}>
        {({ copied, copy }) => (
            <Tooltip label={copied ? "Copié" : "Copier"}>
                <ActionIcon variant='subtle' size={'xs'} aria-label="Copier" onClick={copy}>
                    {copied ? <IconCheck /> : <IconCopy />}
                </ActionIcon>
            </Tooltip>
        )}
    </CopyButton>
}