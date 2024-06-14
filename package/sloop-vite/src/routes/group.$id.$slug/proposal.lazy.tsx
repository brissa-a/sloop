import { MainLayout } from '@sloop-vite/MainLayout'
import { GroupPage } from '@sloop-vite/component/group/page/GroupPage'
import { GroupProposal } from '@sloop-vite/component/group/page/groupPageTabs/GroupProposal'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/group/$id/$slug/proposal')({
  component: () => <GroupRoute />
})

const GroupRoute = () => {
  const params = Route.useParams()

  return (
    <MainLayout>
      <GroupPage group={params} activeTab={"proposal"}>
        <GroupProposal group={params} />
      </GroupPage>
    </MainLayout>
  )
}