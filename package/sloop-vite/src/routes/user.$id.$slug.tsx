import { Button, Flex } from '@mantine/core';
import { MainLayout } from '@sloop-vite/MainLayout';
import { trpcReact } from '@sloop-vite/misc/trpc';
import { Link, createFileRoute } from '@tanstack/react-router';
import ms from 'ms';


export const Route = createFileRoute('/user/$id/$slug')({
    component: () => <MainLayout> <User /> </MainLayout>,
})

function User() {
    const { id } = Route.useParams();
    const user = trpcReact.user.byId.useQuery({ id }, { staleTime: ms('5m') }).data;

    if (!user) return <></>//TODO handle loading

    return (
        <>
            <h1>{user?.username}</h1>
            <h2>Equipage</h2>
            <Flex w={300} wrap={'wrap'} justify={'center'}>
                {
                    user.groupMembership.map(x => x.group).map(
                        ({ slug, id }) =>
                            <Button key={slug}
                                renderRoot={(props) => {
                                    return <Link to='/group/$id/$slug' params={{ id, slug }} {...props} />
                                }}
                                onClick={e => e.stopPropagation()}
                                opacity={0.50} variant="transparent" size="compact-xs" ml={10}>#{slug}
                            </Button>
                    )
                }
            </Flex>

        </>)
}
