import { getCurrent } from '@/features/auth/queries'
import { redirect } from 'next/navigation';
import React, { FC } from 'react'
import WorkspaceIdJoinClient from './client';

const WorkspaceIdJoinPage: FC = async () => {
    const user = await getCurrent();
    if (!user) redirect('/sign-in')

    return (
        <WorkspaceIdJoinClient />
    )
}

export default WorkspaceIdJoinPage