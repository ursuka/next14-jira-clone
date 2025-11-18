'use client'

import { FC } from 'react'
import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DottedSeparator from '@/components/dotted-separator'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import Link from 'next/link'
import { loginFormSchema } from '../schemas'
import { useLogin } from '../api/use-login'
import { signUpWithGithub, signUpWithGoogle } from '@/lib/oauth'

const SignInCard: FC = () => {
    const { mutate, isPending } = useLogin();

    const form = useForm<z.infer<typeof loginFormSchema>>({
        defaultValues: {
            email: '',
            password: '',
        },
        resolver: zodResolver(loginFormSchema)
    })

    const onSubmit = (value: z.infer<typeof loginFormSchema>) => {
        mutate(value);
    }

    return (
        <Card className='w-full h-full md:w-[487px] border-none shadow-none'>
            <CardHeader className='flex justify-center items-center text-center p-7'>
                <CardTitle className='text-2xl'>Welcome Back!</CardTitle>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className='p-7'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
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
                                        disabled={isPending}
                                        placeholder={'Enter password'}
                                        {...field}
                                    >
                                    </Input>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <Button
                            type='submit'
                            size={'lg'}
                            disabled={isPending}
                            className={'w-full'}
                        >
                            Login
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7 flex flex-col gap-y-4">
                <Button
                    variant={'secondary'}
                    size={'lg'}
                    disabled={isPending}
                    className={'w-full'}
                    onClick={() => signUpWithGoogle()}
                >
                    <FcGoogle className='mr-2 size-6' />
                    Login with Google
                </Button>
                <Button
                    variant={'secondary'}
                    size={'lg'}
                    disabled={isPending}
                    className={'w-full'}
                    onClick={() => signUpWithGithub()}
                >
                    <FaGithub className='mr-2 size-6' />
                    Login with Github
                </Button>
            </CardContent>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className={'p-7 flex items-center justify-center'}>
                <p>
                    Don&apos;t have an account ?
                    <Link href={'/sign-up'} className={'text-blue-700'}>&nbsp;Sign up!</Link>
                </p>
            </CardContent>
        </Card>
    )
}

export default SignInCard