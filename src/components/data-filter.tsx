import { FC } from 'react'

import { useGetMembers } from '@/features/members/api/use-get-members';
import { useGetProjects } from '@/features/projects/api/use-get-projects';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { FolderIcon, ListChecksIcon, UserIcon } from 'lucide-react';
import { TaskStatus } from '@/features/tasks/types';
import { useTaskFilters } from '@/features/tasks/hooks/use-task-filters';
import DatePicker from './date-picker';

interface DataFilterProps {
    hideProjectFilter?: boolean;
}

const DataFilter: FC<DataFilterProps> = ({ hideProjectFilter }) => {
    const workspaceId = useWorkspaceId();
    const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });

    const isLoading = isLoadingMembers || isLoadingProjects;

    const projectOptions = projects?.documents.map((project) => ({
        value: project.$id,
        label: project.name,
    }))

    const membersOptions = members?.documents.map((member) => ({
        value: member.$id,
        label: member.name,
    }))

    const statusLabel = Object.values(TaskStatus);

    const [{
        status,
        assigneeId,
        projectId,
        dueDate,
    }, setFilters] = useTaskFilters();

    const handleStatusChange = (value: string) => {
        setFilters({ status: value === 'all' ? null : value as TaskStatus })
    }

    const handleAssaigneeChange = (value: string) => {
        setFilters({ assigneeId: value === 'all' ? null : value as string })
    }

    const handleProjectChange = (value: string) => {
        setFilters({ projectId: value === 'all' ? null : value as string })
    }


    if (isLoading) return null;

    return (
        <div className='flex flex-col lg:flex-row gap-2'>
            <Select
                defaultValue={status ?? undefined}
                onValueChange={handleStatusChange}
            >
                <SelectTrigger className='w-full lg:w-auto h-8'>
                    <div className='flex items-center pr-2'>
                        <ListChecksIcon className='size-4  mr-2' />
                        <SelectValue placeholder='All Statuses' />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value='all'>All Statuses</SelectItem>
                    <SelectSeparator />
                    {statusLabel.map((status) => (
                        <SelectItem value={status} key={status}>{status}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select
                defaultValue={assigneeId ?? undefined}
                onValueChange={handleAssaigneeChange}
            >
                <SelectTrigger className='w-full lg:w-auto h-8'>
                    <div className='flex items-center pr-2'>
                        <UserIcon className='size-4  mr-2' />
                        <SelectValue placeholder='All Assaignees' />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value='all'>All Assaignees</SelectItem>
                    <SelectSeparator />
                    {membersOptions?.map((member) => (
                        <SelectItem value={member.value} key={member.value}>{member.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {!hideProjectFilter && (<Select
                defaultValue={projectId ?? undefined}
                onValueChange={handleProjectChange}
            >
                <SelectTrigger className='w-full lg:w-auto h-8'>
                    <div className='flex items-center pr-2'>
                        <FolderIcon className='size-4  mr-2' />
                        <SelectValue placeholder='All Projects' />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value='all'>All Projects</SelectItem>
                    <SelectSeparator />
                    {projectOptions?.map((project) => (
                        <SelectItem value={project.value} key={project.value}>{project.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>)}
            <DatePicker
                placeholder='Due date'
                className='h-8 w-full lg:w-auto'
                value={dueDate ? new Date(dueDate) : undefined}
                onChange={(date) => setFilters({ dueDate: date ? date.toISOString() : null })}
            >

            </DatePicker>
        </div>
    )
}

export default DataFilter