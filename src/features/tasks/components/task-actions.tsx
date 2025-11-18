import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ExternalLinkIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { FC, ReactNode } from 'react'
import { useDeleteTask } from '../api/use-delete-task';
import { useConfirm } from '@/hooks/use-confirm';
import { useRouter } from 'next/navigation';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import useEditTaskModal from '../hooks/use-edit-task-modal';

interface TaskActionsProps {
    id: string;
    projectId: string;
    children: ReactNode;
}

const TaskActions: FC<TaskActionsProps> = ({ children, id, projectId }) => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const taskDetailsHref = `/workspaces/${workspaceId}/tasks/${id}`
    const projectDetailsHref = `/workspaces/${workspaceId}/projects/${projectId}`
    const { open } = useEditTaskModal();

    const { mutate: deleteTask, isPending: isDeletingTask } = useDeleteTask();
    const [DeleteDialog, confirmDelete] = useConfirm(
        'Delete Task',
        "This action can't be undone.",
        'destructive'
    );

    const handleOpenTask = () => {
        router.push(taskDetailsHref)
    }

    const handleOpenProject = () => {
        router.push(projectDetailsHref)
    }

    const isLoading = isDeletingTask

    const handleDeleteTask = async () => {
        const ok = await confirmDelete();

        if (!ok) return null;

        deleteTask({ param: { taskId: id } });
    }

    return (
        <div className='flex justify-end'>
            <DeleteDialog />
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    {children}
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48'>
                    <DropdownMenuItem
                        onClick={handleOpenTask}
                        disabled={isLoading}
                        className='font-medium p-[10px]'
                    >
                        <ExternalLinkIcon className='size-4 mr-2 stroke-2' />
                        Task details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={handleOpenProject}
                        disabled={isLoading}
                        className='font-medium p-[10px]'
                    >
                        <ExternalLinkIcon className='size-4 mr-2 stroke-2' />
                        Open project
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => open(id)}
                        disabled={isLoading}
                        className='font-medium p-[10px]'
                    >
                        <PencilIcon className='size-4 mr-2 stroke-2' />
                        Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={handleDeleteTask}
                        disabled={isLoading}
                        className='font-medium text-amber-700 p-[10px]'
                    >
                        <TrashIcon className='size-4 mr-2 stroke-2' />
                        Delete Task
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export default TaskActions