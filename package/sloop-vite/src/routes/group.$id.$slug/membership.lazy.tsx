import { MainLayout } from '@sloop-vite/MainLayout'
import { GroupPage } from '@sloop-vite/component/group/page/GroupPage'
import { GroupMemberships } from '@sloop-vite/component/group/page/groupPageTabs/GroupMemberships'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/group/$id/$slug/membership')({
  component: () => <GroupRoute />
})

const GroupRoute = () => {
  const params = Route.useParams()

  return (
    <MainLayout>
      <GroupPage group={params} activeTab='membership'>
        <GroupMemberships group={params} />
      </GroupPage>
    </MainLayout>
  )
}