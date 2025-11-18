'use client';

import { useGetWorkspaces } from '@/features/workspaces/api/use-get-workspaces';
import { FC } from 'react'
import { RiAddCircleFill } from 'react-icons/ri';
import { Select, SelectValue, SelectContent, SelectTrigger, SelectItem } from './ui/select';
import WorkspaceAvatar from '../features/workspaces/components/workspace-avatar';
import { useRouter } from 'next/navigation';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useCreateQueryWorkspaceModal } from '@/features/workspaces/hooks/use-create-workspace-model';

const WorkspaceSwitcher: FC = () => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const { data: workspaces } = useGetWorkspaces();
    const { open } = useCreateQueryWorkspaceModal();

    const handleSelect = (id: string) => {
        router.push(`/workspaces/${id}`)
    }

    return (
        <div className='flex flex-col gap-y-5'>
            <div className='flex items-center justify-between'>
                <p className='text-xs uppercase text-neutral-500'>Workspaces</p>
                <RiAddCircleFill onClick={open} className='size-5 text-neutral-500 cursor-pointer hover:opasity-75 transition' />
            </div>
            <Select onValueChange={handleSelect} value={workspaceId}>
                <SelectTrigger className='w-full bg-neutral-200 font-medium p-1'>
                    <SelectValue placeholder='no work space selected' />
                </SelectTrigger>
                <SelectContent>
                    {workspaces?.documents.map((workspace) => {
                        return <SelectItem key={workspace.$id} value={workspace.$id} className='hover:bg-neutral-200'>
                            <div className='flex justify-center items-center gap-3 font-medium cursor-pointer'>
                                <WorkspaceAvatar name={workspace.name} image={workspace.imageURL} />
                                <span className='truncate'>{workspace.name}</span>
                            </div>
                        </SelectItem>
                    })}
                </SelectContent>
            </Select>
        </div>
    )
}

export default WorkspaceSwitcher