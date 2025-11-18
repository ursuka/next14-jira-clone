'use client'

import Analytics from '@/components/analytics';
import PageError from '@/components/page-error';
import PageLoader from '@/components/page-loader';
import ProjectList from '@/components/project-list';
import TaskList from '@/components/task-list';
import { useGetMembers } from '@/features/members/api/use-get-members';
import MemberList from '@/components/member-list';
import { useGetProjects } from '@/features/projects/api/use-get-projects';
import { useGetTasks } from '@/features/tasks/api/use-get-tasks';
import { TaskCorrect } from '@/features/tasks/types';
import { useGetWorkspaceAnalytics } from '@/features/workspaces/api/use-get-workspace-analytics';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id'
import { FC } from 'react'

const WorkSpaceIdClient: FC = () => {
    const workspaceId = useWorkspaceId();

    const { data: analytics, isLoading: isLoadingAnalytics } = useGetWorkspaceAnalytics({ workspaceId });
    const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({ workspaceId });
    const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });

    const isLoading = isLoadingAnalytics
        || isLoadingMembers
        || isLoadingProjects
        || isLoadingTasks

    if (isLoading) {
        return <PageLoader />
    }

    if (!analytics || !tasks || !projects || !members) {
        return <PageError message='Failed to load workspace data' />
    }

    return (
        <div className='h-full flex flex-col space-y-4'>
            <Analytics data={analytics} />
            <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
                <TaskList data={tasks.documents as TaskCorrect[]} total={tasks.total} workspaceId={workspaceId} />
                <ProjectList data={projects.documents} total={projects.total} workspaceId={workspaceId} />
                <MemberList data={members.documents} total={members.total} workspaceId={workspaceId} />
            </div>
        </div>
    )
}

export default WorkSpaceIdClient