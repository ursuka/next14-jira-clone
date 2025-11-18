'use client'

import { FC } from 'react'
import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import DottedSeparator from '@/components/dotted-separator'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from '@/components/ui/form'
import { signUpFormSchema } from '../schemas'
import { useRegister } from '../api/use-register'
import { signUpWithGithub, signUpWithGoogle } from '@/lib/oauth'


const SignUpCard: FC = () => {
    const { mutate, isPending } = useRegister();

    const form = useForm<z.infer<typeof signUpFormSchema>>({
        defaultValues: {
            email: '',
            password: '',
            name: '',
        },
        resolver: zodResolver(signUpFormSchema)
    })

    const onSubmit = (value: z.infer<typeof signUpFormSchema>) => {
        mutate(value);
    }

    return (
        <Card className='w-full h-full md:w-[487px] border-none shadow-none'>
            <CardHeader className='flex justify-center items-center p-7 text-center'>
                <CardTitle className='text-2xl'>Sign Up!</CardTitle>
                <CardDescription>
                    By signing up, you agree to our {' '}
                    <Link href={'/privacy'}>
                        <span className='text-blue-700'>Privacy Policy</span>
                    </Link> and {' '}
                    <Link href={'/terms'}>
                        <span className='text-blue-700'>Terms of Service</span>
                    </Link>{' '}
                </CardDescription>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className='p-7'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                        <FormField name={'name'} control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        type={'text'}
                                        placeholder={'Enter your name'}
                                        disabled={isPending}
                                        {...field}
                                    >
                                    </Input>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField name={'email'} control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        type={'email'}
                                        placeholder={'Enter email adress'}
                                        disabled={isPending}
                                        {...field}
                                    >
                                    </Input>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField name={'password'} control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        type={'password'}
                                        placeholder={'Enter password'}
                                        disabled={isPending}
                                        {...field}
                                    >
                                    </Input>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <Button
                            disabled={isPending}
                            size={'lg'}
                            className={'w-full'}
                        >
                            Register
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7 flex flex-col gap-y-4">
                <Button
                    disabled={isPending}
                    variant={'secondary'}
                    size={'lg'}
                    className={'w-full'}
                    onClick={() => signUpWithGoogle()}
                >
                    <FcGoogle className='mr-2 size-6' />
                    Register with Google
                </Button>
                <Button
                    disabled={isPending}
                    variant={'secondary'}
                    size={'lg'}
                    className={'w-full'}
                    onClick={() => signUpWithGithub()}
                >
                    <FaGithub className='mr-2 size-6' />
                    Register with Github
                </Button>
            </CardContent>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className={'p-7 flex items-center justify-center'}>
                <p>
                    Already have an account ?
                    <Link href={'/sign-in'} className={'text-blue-700'}>&nbsp;Sign in!</Link>
                </p>
            </CardContent>
        </Card>
    )
}

export default SignUpCard