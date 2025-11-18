import React, { FC } from 'react'
import { Project } from '../../projects/types'
import { Task } from '@/features/tasks/types'
import ProjectAvatar from '../../projects/components/project-avatar'
import Link from 'next/link'
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id'
import { ChevronRightIcon, TrashIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/hooks/use-confirm'
import { useDeleteTask } from '@/features/tasks/api/use-delete-task'
import { useRouter } from 'next/navigation'

interface TaskBreadCrumbsProps {
    project: Project,
    task: Task
}

const TaskBreadCrumbs: FC<TaskBreadCrumbsProps> = ({ project, task }) => {
    const workspaceId = useWorkspaceId();
    const router = useRouter();
    const { mutate: deleteTask, isPending } = useDeleteTask();
    const [ConfirmDialog, confirm] = useConfirm(
        'Delete task?',
        'This action cannot be undone.',
        'destructive'
    );

    const handleDeleteTask = async () => {
        const ok = await confirm();
        if (!ok) return;

        deleteTask({ param: { taskId: task.$id } }, {
            onSuccess: () => {
                router.push(`/workspaces/${workspaceId}/tasks`);
            }
        })
    }

    return (
        <div className='flex items-center gap-x-2'>
            <ConfirmDialog />
            <ProjectAvatar
                name={project.name}
                image={project.imageURL}
                className='size-6 lg:size-8'
            />
            <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
                <p className='text-sm lg:text-lg font-semibold text-muted-foreground hover:opacity-75 transition'>
                    {project.name}
                </p>
            </Link>
            <ChevronRightIcon className='size-4 lg:size-5 text-muted-foreground' />
            <p className='text-sm lg:text-lg font-semibold'>
                {task.name}
            </p>
            <Button
                className="ml-auto"
                variant={'destructive'}
                size={'sm'}
                onClick={handleDeleteTask}
                disabled={isPending}
            >
                <TrashIcon className='size-4 lg:mr-2' />
                <span className='hidden lg:block'>Delete Task</span>
            </Button>
        </div>
    )
}

export default TaskBreadCrumbs