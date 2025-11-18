'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChangeEvent, FC, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { createWorkspaceSchema } from '../schemas'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DottedSeparator from '@/components/dotted-separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCreateWorkspace } from '../api/use-create-workspace'
import Image from 'next/image'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreateWorkspaceFormProps {
    onCancel?: () => void
}

const CreateWorkspaceForm: FC<CreateWorkspaceFormProps> = ({ onCancel }) => {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const { mutate, isPending } = useCreateWorkspace();

    const form = useForm<z.infer<typeof createWorkspaceSchema>>({
        resolver: zodResolver(createWorkspaceSchema),
        defaultValues: {
            name: ''
        }
    })

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            form.setValue('image', file)
        }
    }

    const onSubmit = (value: z.infer<typeof createWorkspaceSchema>) => {
        const finalValue = {
            ...value,
            image: value.image instanceof File ? value.image : '',
        };

        mutate({ form: finalValue }, {
            onSuccess: () => {
                form.reset();
            }
        })
    }

    return (
        <Card className='w-full h-full border-none shadow-none'>
            <CardHeader className='flex p-7'>
                <CardTitle className='text-xl font-bold'>
                    Create a new workspace
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
                                Create workspace
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export default CreateWorkspaceForm