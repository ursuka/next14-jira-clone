'use client'

import PageError from '@/components/page-error'
import PageLoader from '@/components/page-loader'
import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace'
import EditWorkspaceForm from '@/features/workspaces/components/edit-workspace-form'
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id'
import { FC } from 'react'

const WorkspaceSettingsClient: FC = () => {
    const workspaceId = useWorkspaceId();
    const { data: initialValue, isLoading } = useGetWorkspace({ workspaceId });

    if (isLoading) {
        return <PageLoader />
    }

    if (!initialValue) {
        return <PageError />
    }

    return (
        <div className='w-full lg:max-w-xl'>
            <EditWorkspaceForm initialValue={initialValue} />
        </div>
    )
}

export default WorkspaceSettingsClient