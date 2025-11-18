import { getCurrent } from '@/features/auth/queries'
import MemberList from '@/features/members/components/members-list';
import { redirect } from 'next/navigation';
import React, { FC } from 'react'

const WorkSpaceIdMembersPage: FC = async () => {
    const user = await getCurrent();
    if (!user) redirect('/sign-in')

    return (
        <div className='w-full lg:max-w-xl'>
            <MemberList />
        </div>
    )
}

export default WorkSpaceIdMembersPage