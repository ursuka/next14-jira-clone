'use client';

import { FC } from 'react'
import ResponsiveModal from '@/components/responsive-modal'
import useCreateTaskModal from '../hooks/use-create-task-modal'
import CreateTaskFormWrapper from './create-task-form-wrapper';

const CreateTaskModal: FC = () => {
    const { isOpen, setIsOpen, close } = useCreateTaskModal();

    return (
        <ResponsiveModal onOpenChange={setIsOpen} open={isOpen}>
            <CreateTaskFormWrapper onCancel={close} />
        </ResponsiveModal>
    )
}

export default CreateTaskModal