'use client'

import { FC } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import DottedSeparator from './dotted-separator'
import { Button } from './ui/button'
import Link from 'next/link'
import { useJoinWorkspace } from '@/features/workspaces/api/use-join-workspace'
import { useInviteCode } from '@/features/workspaces/hooks/use-invite-code'
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id'

interface JoinWorkspaceFormProps {
    initialValues: {
        name: string,

    }
}

const JoinWorkspaceForm: FC<JoinWorkspaceFormProps> = ({ initialValues }) => {
    const workspaceId = useWorkspaceId();
    const inviteCode = useInviteCode();
    const { mutate: joinWorkspace, isPending } = useJoinWorkspace();

    const handleSubmit = () => {
        joinWorkspace({
            param: { workspaceId },
            json: {
                code: inviteCode
            }
        })
    }

    return (
        <Card className='w-full h-full border-none shadow-none'>
            <CardHeader className='p-7'>
                <CardTitle className='text-xl font-bold'>
                    Join workspace
                </CardTitle>
                <CardDescription>
                    You&#700;ve been invited to join <strong>{initialValues.name}</strong>
                </CardDescription>
            </CardHeader>
            <DottedSeparator className='px-7' />
            <CardContent className='p-7'>
                <div className='flex flex-col lg:flex-row gap-2 items-center justify-between'>
                    <Button
                        variant={'secondary'}
                        type='button'
                        size={'lg'}
                        asChild
                        className='w-full lg:w-fit'
                        disabled={isPending}
                    >
                        <Link href={'/'}>
                            Cancel
                        </Link>
                    </Button>
                    <Button
                        type='button'
                        size={'lg'}
                        className='w-full lg:w-fit'
                        onClick={handleSubmit}
                        disabled={isPending}
                    >
                        Join Workspace
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default JoinWorkspaceForm