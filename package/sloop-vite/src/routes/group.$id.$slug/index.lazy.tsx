import { MainLayout } from '@sloop-vite/MainLayout'
import { GroupPage } from '@sloop-vite/component/group/page/GroupPage'
import { GroupAgenda } from '@sloop-vite/component/group/page/groupPageTabs/GroupAgenda'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/group/$id/$slug/')({
  component: () => <GroupRoute />
})

const GroupRoute = () => {
  const params = Route.useParams()

  return (
    <MainLayout>
      <GroupPage group={params} activeTab={"agenda"}>
        <GroupAgenda group={params} />
      </GroupPage>
    </MainLayout>
  )
}