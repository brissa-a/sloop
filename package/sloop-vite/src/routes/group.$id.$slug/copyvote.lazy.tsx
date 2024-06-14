import { MainLayout } from '@sloop-vite/MainLayout'
import { GroupPage } from '@sloop-vite/component/group/page/GroupPage'
import { GroupCopyvote } from '@sloop-vite/component/group/page/groupPageTabs/GroupCopyvote'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/group/$id/$slug/copyvote')({
  component: () => <GroupRoute />
})

const GroupRoute = () => {
  const params = Route.useParams()

  return (
    <MainLayout>
      <GroupPage group={params} activeTab={"copyvote"}>
        <GroupCopyvote group={params} />
      </GroupPage>
    </MainLayout>
  )
}