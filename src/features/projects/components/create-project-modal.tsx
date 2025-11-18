'use client'

import ResposiveModal from '@/components/responsive-modal';
import CreateProjectForm from './create-project-form';

import { FC } from 'react'
import useCreateProjectModal from '../hooks/use-create-project-modal';

const CreateProjectModal: FC = () => {
    const { setIsOpen, isOpen, close } = useCreateProjectModal();

    return (
        <ResposiveModal onOpenChange={setIsOpen} open={isOpen} >
            <CreateProjectForm onCancel={close} />
        </ResposiveModal >
    )
}

export default CreateProjectModal