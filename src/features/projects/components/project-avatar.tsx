import React, { FC } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ProjectAvatarProps {
    image?: string,
    name: string,
    className?: string,
    fallbackClassName?: string,
}

const ProjectAvatar: FC<ProjectAvatarProps> = ({ name, className, image, fallbackClassName }) => {

    if (image) {
        return (
            <div className={cn(
                'size-5 relative rounded-md overflow-hidden',
                className
            )}>
                <Image src={image} alt={name} className={'object-cover'} fill />
            </div>
        )
    }

    return (
        <Avatar className={cn(
            'size-5 rounded-md',
            className
        )}>
            <AvatarFallback className={cn(
                'text-white bg-blue-600 font-semibold text-sm uppercase rounded-md',
                fallbackClassName
            )}>
                {name[0]}
            </AvatarFallback>
        </Avatar>
    )
}
export default ProjectAvatar;