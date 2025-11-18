import { FC, MouseEvent } from 'react'
import { TaskStatus } from '../types'
import { Project } from '@/features/projects/types'
import { Models } from 'node-appwrite'
import { cn } from '@/lib/utils'
import MemberAvatar from '@/features/members/components/member-avatar'
import ProjectAvatar from '@/features/projects/components/project-avatar'
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id'
import { useRouter } from 'next/navigation'

interface EventCardProps {
    id: string,
    assaignee: Models.Document & { name: string, email: string },
    title: string,
    status: TaskStatus,
    project: Project
}

const statusColorMap: Record<TaskStatus, string> = {
    [TaskStatus.BACKLOG]: 'border-l-pink-500',
    [TaskStatus.DONE]: 'border-l-emerald-500',
    [TaskStatus.IN_PROGRESS]: 'border-l-yellow-500',
    [TaskStatus.IN_REVIEW]: 'border-l-blue-500',
    [TaskStatus.TODO]: 'border-l-red-500',
}

const EventCard: FC<EventCardProps> = ({ id, assaignee, project, status, title }) => {
    const workspaceId = useWorkspaceId();
    const router = useRouter();

    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        router.push(`/workspaces/${workspaceId}/tasks/${id}`)
    }

    return (
        <div className='px-2'>
            <div
                onClick={handleClick}
                className={cn(
                    'p-1.5 text-xs bg-white text-primary border rounded-md border-l-4 flex flex-col gap-y-1.5 cursor-pointer hover:opacity-75 transition',
                    statusColorMap[status]
                )}>
                <p>{title}</p>
                <div className='flex items-center gap-x-1'>
                    <MemberAvatar
                        name={assaignee?.name}
                    />
                    <div className='size-1 rounded-full bg-neutral-300' />
                    <ProjectAvatar
                        name={project?.name}
                        image={project?.imageURL}
                    />
                </div>
            </div>
        </div>
    )
}

export default EventCard