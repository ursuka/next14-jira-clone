'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { FC } from 'react'

const ErrorPage: FC = () => {
    return (
        <div className='h-screen flex flex-col items-center justify-center gap-y-4'>
            <AlertTriangle className='size-6'/>
            <p className='text-sm'>
                Something went wrong!
            </p>
            <Button variant={'secondary'} asChild size={'sm'}>
                <Link href={'/'}>
                    back to home
                </Link>
            </Button>
        </div>
    )
}

export default ErrorPage