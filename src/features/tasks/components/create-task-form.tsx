'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DottedSeparator from '@/components/dotted-separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id'
import { createTaskSchema } from '../schemas'
import { useCreateTask } from '../api/use-create-task'
import DatePicker from '@/components/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import MemberAvatar from '@/features/members/components/member-avatar'
import { TaskStatus } from '../types'
import ProjectAvatar from '@/features/projects/components/project-avatar'

interface CreateTaskFormProps {
    onCancel?: () => void,
    projectOptions: { id: string, name: string, imageUrl: string }[];
    memberOptions: { id: string, name: string }[];
}

const CreateTaskForm: FC<CreateTaskFormProps> = ({ onCancel, memberOptions, projectOptions }) => {
    const workspaceId = useWorkspaceId();
    const { mutate, isPending } = useCreateTask();

    type CreateTaskFormValues = Omit<z.infer<typeof createTaskSchema>, 'dueDate'> & { dueDate: unknown };

    const form = useForm<CreateTaskFormValues>({
        resolver: zodResolver(createTaskSchema),
        defaultValues: {
            workspaceId,
        }
    })

    const onSubmit = (value: CreateTaskFormValues) => {
        mutate({ json: { ...value, workspaceId } }, {
            onSuccess: () => {
                onCancel?.()
            }
        })
    }

    return (
        <Card className='w-full h-full border-none shadow-none'>
            <CardHeader className='flex p-7'>
                <CardTitle className='text-xl font-bold'>
                    Create a new task
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
                                            Task Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter the project name"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={'dueDate'}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Due date
                                        </FormLabel>
                                        <FormControl>
                                            <DatePicker {...field} value={field.value as Date | undefined} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={'assigneeId'}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Assignee
                                        </FormLabel>
                                        <Select
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select assignee' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <FormMessage />
                                            <SelectContent >
                                                {memberOptions.map(member => (
                                                    <SelectItem
                                                        key={member.id}
                                                        value={member.id}
                                                        className='cursor-pointer'
                                                    >
                                                        <div className='flex items-center gap-x-2'>
                                                            <MemberAvatar
                                                                className='size-6'
                                                                name={member.name}
                                                            />
                                                            {member.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={'status'}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Status
                                        </FormLabel>
                                        <Select
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select status' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <FormMessage />
                                            <SelectContent >
                                                {Object.values(TaskStatus).map(status => (
                                                    <SelectItem key={status} value={status} className='cursor-pointer'>{status}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={'projectId'}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Project
                                        </FormLabel>
                                        <Select
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select project' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <FormMessage />
                                            <SelectContent >
                                                {projectOptions.map(project => (
                                                    <SelectItem
                                                        key={project.id}
                                                        value={project.id}
                                                        className='cursor-pointer'
                                                    >
                                                        <div className='flex items-center gap-x-2'>
                                                            <ProjectAvatar
                                                                className='size-6'
                                                                name={project.name}
                                                                image={project.imageUrl}
                                                            />
                                                            {project.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
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
                                Create Task
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export default CreateTaskForm