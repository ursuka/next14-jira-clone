'use client'

import { useGetProjects } from '@/features/projects/api/use-get-projects';
import ProjectAvatar from '@/features/projects/components/project-avatar';
import useCreateProjectModal from '@/features/projects/hooks/use-create-project-modal';
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react'
import { RiAddCircleFill } from 'react-icons/ri';


const Projects: FC = () => {
    const pathname = usePathname();
    const workspaceId = useWorkspaceId();
    const { data } = useGetProjects({ workspaceId });
    const { open } = useCreateProjectModal();

    return (
        <div className='flex flex-col gap-y-5'>
            <div className='flex items-center justify-between'>
                <p className='text-xs uppercase text-neutral-500'>Projects</p>
                <RiAddCircleFill onClick={open} className='size-5 text-neutral-500 cursor-pointer hover:opasity-75 transition' />
            </div>
            <div className='flex flex-col gap-y-1'>
                {data?.documents.map((project) => {
                    const href = `/workspaces/${workspaceId}/projects/${project.$id}`
                    const isActive = pathname === href
                    return <Link href={href} key={project.$id}>
                        <div
                            className={cn(
                                'flex items-center gap-2.5 px-2.5 py-1 rounded-md hover:opacity-75 transition cursor-pointer text-neutral-500',
                                isActive && 'bg-white shadow-sm hover:opacity-100 text-primary'
                            )}
                        >
                            <ProjectAvatar image={project.imageURL} name={project.name} />
                            <span className='truncate'>{project.name}</span>
                        </div>
                    </Link>
                })}
            </div>
        </div>
    )
}

export default Projects