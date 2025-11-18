'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FC, ReactNode } from 'react'

interface AuthLayoutProps {
    children: ReactNode
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
    const pathName = usePathname();
    const isSignIn = pathName === '/sign-in';

    return (
        <main className='bg-neutral-100 min-h-screen'>
            <div className='mx-auto max-2-screen-2xl p-4'>
                <nav className='flex justify-between items-center'>
                    <Image src={'/logo.svg'} alt='Logo' height={56} width={152} />
                    <Button asChild variant={'secondary'}>
                        <Link href={isSignIn ? '/sign-up' : '/sign-in'}>
                            {isSignIn ? 'Sign Up' : 'Login'}
                        </Link>
                    </Button>
                </nav>
                <div className='flex flex-col items-center justify-center pt-4 md:pt-14'>
                    {children}
                </div>
            </div>
        </main>
    )
}

export default AuthLayout