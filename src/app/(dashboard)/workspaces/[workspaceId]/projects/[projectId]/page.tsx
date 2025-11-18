import { getCurrent } from '@/features/auth/queries';
import { redirect } from 'next/navigation'
import { FC } from 'react'
import ProjectIdClient from './client';

const ProjectIdPage: FC = async () => {
    const user = getCurrent()
    if (!user) redirect('/sign-in');
    return <ProjectIdClient />
}

export default ProjectIdPage