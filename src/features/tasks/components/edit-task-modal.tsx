'use client';

import { FC } from 'react'
import ResponsiveModal from '@/components/responsive-modal'
import EditTaskFormWrapper from './edit-task-form-wrapper';
import useEditTaskModal from '../hooks/use-edit-task-modal';

const EditTaskModal: FC = () => {
    const { taskId, close } = useEditTaskModal();

    return (
        <ResponsiveModal onOpenChange={close} open={!!taskId}>
            {taskId && (<EditTaskFormWrapper onCancel={close} id={taskId} />)}
        </ResponsiveModal>
    )
}

export default EditTaskModal