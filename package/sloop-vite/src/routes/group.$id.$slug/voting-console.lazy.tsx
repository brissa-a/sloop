import { MainLayout } from '@sloop-vite/MainLayout'
import { GroupPage } from '@sloop-vite/component/group/page/GroupPage'
import { GroupVotingConsole } from '@sloop-vite/component/group/page/groupPageTabs/GroupVotingConsole'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/group/$id/$slug/voting-console')({
    component: () => <GroupRoute />
})

const GroupRoute = () => {
    const params = Route.useParams()

    return (
        <MainLayout>
            <GroupPage group={params} activeTab='voting-console'>
                <GroupVotingConsole group={params} />
            </GroupPage>
        </MainLayout>
    )
}