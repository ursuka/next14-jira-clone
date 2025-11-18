'use client'

import ResposiveModal from '@/components/responsive-modal';
import CreateWorkspaceForm from './create-workspace-form';

import { FC } from 'react'
import { useCreateQueryWorkspaceModal } from '../hooks/use-create-workspace-model';

const CreateWorkspaceModal: FC = () => {
    const { setIsOpen, isOpen, close } = useCreateQueryWorkspaceModal();

    return (
        <ResposiveModal onOpenChange={setIsOpen} open={isOpen} >
            <CreateWorkspaceForm onCancel={close} />
        </ResposiveModal >
    )
}

export default CreateWorkspaceModal