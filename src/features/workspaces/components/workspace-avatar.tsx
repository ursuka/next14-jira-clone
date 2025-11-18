import React, { FC } from 'react'
import { Avatar, AvatarFallback } from '../../../components/ui/avatar'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface WorkspaceAvatarProps {
    image?: string,
    name: string,
    className?: string
}

const WorkspaceAvatar: FC<WorkspaceAvatarProps> = ({ name, className, image }) => {

    if (image) {
        return (
            <div className={cn(
                'size-10 relative rounded-md overflow-hidden',
                className
            )}>
                <Image src={image} alt={name} className={'object-cover'} fill />
            </div>
        )
    }

    return (
        <Avatar className={cn(
            'size-10 rounded-md',
            className
        )}>
            <AvatarFallback className={'text-white bg-blue-600 font-semibold text-lg uppercase rounded-md'}>
                {name[0]}
            </AvatarFallback>
        </Avatar>
    )
}
export default WorkspaceAvatar;