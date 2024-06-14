import { MainLayout } from '@sloop-vite/MainLayout'
import { GroupPage } from '@sloop-vite/component/group/page/GroupPage'
import { GroupHome } from '@sloop-vite/component/group/page/groupPageTabs/GroupHome'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/group/$id/$slug/home')({
  component: () => <GroupRoute />
})

const GroupRoute = () => {
  const params = Route.useParams()

  return (
    <MainLayout>
      <GroupPage group={params} activeTab={"home"}>
        <GroupHome group={params} />
      </GroupPage>
    </MainLayout>
  )
}