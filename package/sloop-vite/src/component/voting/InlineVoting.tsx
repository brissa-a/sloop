// import { Avatar, Group, HoverCard, AvatarProps as MantineAvatarProps, Stack, Text, useMantineColorScheme } from "@mantine/core";
// import { trpcReact } from "@sloop-vite/misc/trpc";
// import { Link } from "@tanstack/react-router";
// import { VotingHoverCard } from "./VotingHoverCard";
// import { IconCalendarEvent } from "@tabler/icons-react";

// export const InlineVoting = ({ userId, ...remain }: { userId: string } & MantineAvatarProps) => {
//     const voting = trpcReact.meeting.voting.byId.useQuery({ id: userId }).data;
//     const { colorScheme } = useMantineColorScheme();
//     if (!voting) return null

//     return <HoverCard position="bottom" withArrow shadow="md" openDelay={200} closeDelay={100}>
//         <HoverCard.Target>
//             <Group gap="xs">
//                 <IconCalendarEvent size='2rem' />
//                 <Stack gap={0} w={"calc(100% - 100px)"}>
//                     <Text fw={500} c={colorScheme === 'dark' ? 'pirate.3' : 'pirate.6'}
//                         onClick={() => close()}
//                         renderRoot={(props) => {
//                             return <Link to='/meeting/$id/$slug' params={{ id: mee.id, slug: user.slug || "unknown" }} {...props} />
//                         }}
//                     >{user.username}</Text>
//                     <Text size="xs" c="dimmed">@{user.slug}</Text>
//                 </Stack>
//             </Group>
//         </HoverCard.Target>
//         <HoverCard.Dropdown w={400} >
//             <VotingHoverCard voting={voting} />
//         </HoverCard.Dropdown>
//     </HoverCard >;
// };
