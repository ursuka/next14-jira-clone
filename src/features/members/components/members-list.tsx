'use client';

import { FC, Fragment } from 'react'
import { useWorkspaceId } from '../../workspaces/hooks/use-workspace-id';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, MoreVerticalIcon } from 'lucide-react';
import Link from 'next/link';
import DottedSeparator from '@/components/dotted-separator';
import { useGetMembers } from '@/features/members/api/use-get-members';
import MemberAvatar from './member-avatar';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useUpdateMember } from '../api/use-update-member';
import { useDeleteMember } from '../api/use-delete-member';
import { MemberRole } from '../types';
import { useConfirm } from '@/hooks/use-confirm';


const MemberList: FC = () => {
    const workspaceId = useWorkspaceId();
    const { data } = useGetMembers({ workspaceId });
    const [ConfirmDialog, confirm] = useConfirm(
        "Remove member",
        "This member will be removed from the workspace",
        'destructive'
    );
    const { mutate: updateMember, isPending: isDeletingMember } = useUpdateMember();
    const { mutate: deleteMember, isPending: isUpdatingMember } = useDeleteMember();

    const handleUpdateMember = (memberId: string, role: MemberRole) => {
        updateMember({
            param: { memberId },
            json: { role }
        })
    }

    const handleDeleteMember = async (memberId: string) => {
        const ok = await confirm();

        if (!ok) return;

        deleteMember({
            param: { memberId }
        })
    }


    return (
        <Card className='w-full h-full border-none shadow-none'>
            <ConfirmDialog />
            <CardHeader className='flex flex-row items-center gap-x-4 p-7 space-y-0'>
                <Button asChild variant={'secondary'} size={'sm'}>
                    <Link href={`/workspaces/${workspaceId}`}>
                        <ArrowLeftIcon className='size-4 mr-2' />
                        Back
                    </Link>
                </Button>
                <CardTitle className='text-xl font-bold'>
                    Members list
                </CardTitle>
            </CardHeader>
            <div className='px-7'>
                <DottedSeparator />
                <CardContent className='px-0 py-6'>
                    {data?.documents.map((member, index) => (
                        <Fragment key={member.$id}>
                            <div className='flex items-center gap-2'>
                                <MemberAvatar
                                    className='size-10'
                                    fallBackClassName='text-lg'
                                    name={member.name}
                                />
                                <div className='flex flex-col'>
                                    <p className='text-sm font-medium'>{member.name}</p>
                                    <p className='text-xs text-muted-foreground'>{member.email}</p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            className='ml-auto'
                                            size='icon'
                                            variant={'secondary'}
                                        >
                                            <MoreVerticalIcon className='size-4 text-muted-foreground' />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="bottom" align="end">
                                        <DropdownMenuItem
                                            className='font-medium'
                                            onClick={() => handleUpdateMember(member.$id, MemberRole.MEMEBER)}
                                            disabled={isUpdatingMember || isDeletingMember}
                                        >
                                            Set as Member
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className='font-medium'
                                            onClick={() => handleUpdateMember(member.$id, MemberRole.MEMEBER)}
                                            disabled={isUpdatingMember || isDeletingMember}
                                        >
                                            Set as Administrator
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className='font-medium text-amber-700'
                                            onClick={() => handleDeleteMember(member.$id)}
                                            disabled={isUpdatingMember || isDeletingMember}
                                        >
                                            Remove {member.name}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            {index < data.documents.length - 1 && <Separator className='my-2.5' />}
                        </Fragment>
                    ))}
                </CardContent>
            </div>
        </Card>
    )
}

export default MemberList