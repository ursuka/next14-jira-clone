'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChangeEvent, FC, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { updateWorkspaceSchema } from '../schemas'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DottedSeparator from '@/components/dotted-separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeftIcon, CopyIcon, ImageIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Workspace } from '../types'
import { useUpdateWorkspace } from '../api/use-update-workspace'
import { useConfirm } from '@/hooks/use-confirm'
import { useDeleteWorkspace } from '../api/use-delete-workspace'
import { toast } from 'sonner'
import { useResetInviteCode } from '../api/use-reset-inviteCode'

interface EditWorkspaceFormProps {
    onCancel?: () => void;
    initialValue: Workspace
}

const EditWorkspaceForm: FC<EditWorkspaceFormProps> = ({ onCancel, initialValue }) => {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement | null>(null)
    const { mutate, isPending } = useUpdateWorkspace();
    const [DeleteDialog, confirmDelete] = useConfirm(
        'Delete Workspace',
        "This action can't be undone.",
        'destructive'
    );
    const [ResetInviteCodeDialog, confirmResetInviteCode] = useConfirm(
        'Reset Invite code',
        "This action will reset reset invite code.",
        'destructive'
    );
    const { mutate: deleteWorkspace, isPending: isDeletingWorkspace } = useDeleteWorkspace();
    const { mutate: resetInviteCode, isPending: isResetingInviteCode } = useResetInviteCode();

    const form = useForm<z.infer<typeof updateWorkspaceSchema>>({
        resolver: zodResolver(updateWorkspaceSchema),
        defaultValues: {
            ...initialValue,
            image: initialValue.imageURL ?? ''
        }
    })

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            form.setValue('image', file)
        }
    }

    const handleDelete = async () => {
        const ok = await confirmDelete();

        if (!ok) return;

        deleteWorkspace({
            param: { workspaceId: initialValue.$id }
        })
    }

    const onSubmit = (value: z.infer<typeof updateWorkspaceSchema>) => {
        const finalValue = {
            ...value,
            image: value.image instanceof File ? value.image : '',
        };
        mutate({ form: finalValue, param: { workspaceId: initialValue.$id } })
    }

    const fullInviteLink = `${window.location.origin}/workspaces/${initialValue.$id}/join/${initialValue.inviteCode}`;

    const handleCopyInviteLink = () => {
        navigator.clipboard.writeText(fullInviteLink)
            .then(() => {
                toast.success('Invite link coppied to clipboard.')
            })
    }

    const handleResetInviteCode = async () => {
        const ok = await confirmResetInviteCode();

        if (!ok) return;

        resetInviteCode({ param: { workspaceId: initialValue.$id } });
    }

    return (
        <div className='flex flex-col gap-y-4'>
            <DeleteDialog />
            <ResetInviteCodeDialog />
            <Card className='w-full h-full border-none shadow-none'>
                <CardHeader className='flex flex-row items-center gap-x-4 p-7 space-y-0'>
                    <Button size={'sm'} variant={'secondary'} onClick={onCancel ? onCancel : () => router.push(`/workspaces/${initialValue.$id}`)}>
                        <ArrowLeftIcon className='size-4 mr-1' />
                        Back
                    </Button>
                    <CardTitle className='text-xl font-bold'>
                        {initialValue.name}
                    </CardTitle>
                </CardHeader>
                <div className="px-7">
                    <DottedSeparator />
                </div>
                <CardContent className='p-7'>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className='flex flex-col gap-y-4'>
                                <FormField
                                    control={form.control}
                                    name={'name'}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Workspace Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter the workspace name"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={'image'}
                                    render={({ field }) => (
                                        <div className='flex flex-row gap-x-5'>
                                            <div className="flex items-center justify-start gap-x-5">
                                                {field.value
                                                    ? (<div className='size-[72px] relative rounded-md overflow-hidden'>
                                                        <Image
                                                            alt='Logo'
                                                            fill
                                                            className='object-cover'
                                                            src={field.value instanceof File
                                                                ? URL.createObjectURL(field.value)
                                                                : field.value
                                                            }
                                                        />
                                                    </div>)
                                                    : <Avatar className='size-[72px]'>
                                                        <AvatarFallback>
                                                            <ImageIcon className='size-[36px] text-neutral-400' />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                }
                                            </div>
                                            <div className='flex flex-col'>
                                                <p className='text-sm'>Workspace Icon</p>
                                                <p className='text-sm text-muted-foreground'>
                                                    JPG, PNG, SVG or JPEG, max 1 mb
                                                </p>
                                                <input
                                                    className='hidden'
                                                    type="file"
                                                    accept='.jpeg, .jpg, .png, .svg'
                                                    ref={inputRef}
                                                    disabled={isPending}
                                                    onChange={handleImageChange}
                                                />
                                                {field.value
                                                    ? (
                                                        <Button
                                                            type='button'
                                                            disabled={isPending}
                                                            variant='destructive'
                                                            size={'xs'}
                                                            className='w-fit mt-2'
                                                            onClick={() => {
                                                                field.onChange(null);
                                                                if (inputRef.current) {
                                                                    inputRef.current.value = ''
                                                                }
                                                            }}
                                                        >
                                                            Remove Image
                                                        </Button>
                                                    )
                                                    : (
                                                        <Button
                                                            type='button'
                                                            disabled={isPending}
                                                            variant='teritary'
                                                            size={'xs'}
                                                            className='w-fit mt-2'
                                                            onClick={() => {
                                                                inputRef.current?.click()
                                                            }}
                                                        >
                                                            Upload Image
                                                        </Button>
                                                    )}

                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                            <DottedSeparator className='py-7' />
                            <div className='flex items-center justify-between'>
                                <Button
                                    type='button'
                                    size={'lg'}
                                    variant={'secondary'}
                                    onClick={onCancel}
                                    disabled={isPending}
                                    className={cn(!onCancel && 'invisible')}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type='submit'
                                    size={'lg'}
                                    disabled={isPending}
                                >
                                    Save changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <Card className='w-full h-full border-none shadow-none'>
                <CardContent className='p-7'>
                    <div className='flex flex-col'>
                        <h3 className='font-bold'>Invite Members</h3>
                        <p className="text-sm text-muted-foreground">
                            Use the invite link to add members to your workspace.
                        </p>
                        <div className='mt-4'>
                            <div className='flex items-center gap-x-2'>
                                <Input disabled value={fullInviteLink} />
                                <Button
                                    onClick={handleCopyInviteLink}
                                    variant={'secondary'}
                                    className='size-12'
                                >
                                    <CopyIcon className='size-5' />
                                </Button>
                            </div>
                        </div>
                        <DottedSeparator className='py-7' />
                        <Button
                            className='mt-2 w-fit ml-auto'
                            size='sm'
                            variant='destructive'
                            type='button'
                            disabled={isPending || isResetingInviteCode}
                            onClick={handleResetInviteCode}
                        >
                            Reset invite link
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card className='w-full h-full border-none shadow-none'>
                <CardContent className='p-7'>
                    <div className='flex flex-col'>
                        <h3 className='font-bold'>Danger Zone</h3>
                        <p className="text-sm text-muted-foreground">
                            Deleting a workspace is irreversible and will remove all associated data.
                        </p>
                        <DottedSeparator className='py-7' />
                        <Button
                            className='mt-2 w-fit ml-auto'
                            size='sm'
                            variant='destructive'
                            type='button'
                            disabled={isPending || isDeletingWorkspace}
                            onClick={handleDelete}
                        >
                            Delete Workspace
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default EditWorkspaceForm