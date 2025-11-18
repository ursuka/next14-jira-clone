import { AlertTriangle } from 'lucide-react'
import React, { FC } from 'react'

interface PageErrorProps {
    message?: string
}

const PageError: FC<PageErrorProps> = ({ message = 'Something went wrong' }) => {
    return (
        <div className='flex flex-col items-center justify-center h-full'>
            <AlertTriangle />
            <p className='text-sm font-medium text-muted-foreground'>
                {message}
            </p>
        </div>
    )
}

export default PageError