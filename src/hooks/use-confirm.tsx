import { useState } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import ResposiveModal from '@/components/responsive-modal';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'


export const useConfirm = (
    title: string,
    message: string,
    variant: ButtonProps['variant'] = 'primary'
): [() => JSX.Element, () => Promise<unknown>] => {
    const [promise, setPromise] = useState<null | { resolve: (value: boolean) => void }>(null)

    const confirm = () => {
        return new Promise((resolve) => {
            setPromise({ resolve })
        })
    }

    const handleClose = () => {
        setPromise(null);
    }

    const handleConfim = () => {
        promise?.resolve(true);
        handleClose();
    }

    const handleCancel = () => {
        promise?.resolve(false);
        handleClose();
    }

    const ConfirmationDialog = () => (
        <ResposiveModal open={promise !== null} onOpenChange={handleCancel}>
            <Card className='w-full h-full border-none shadow-none'>
                <CardContent>
                    <CardHeader className='pt-2 py-5 px-0'>
                        <CardTitle className='p-0'>
                            {title}
                        </CardTitle>
                        <CardDescription>
                            {message}
                        </CardDescription>
                    </CardHeader>
                    <div className='pt-4 w-full flex flex-col gap-y-2 lg:flex-row gap-2 items-center justify-end'>
                        <Button onClick={handleCancel} variant='outline' className='w-full lg:w-auto'>
                            Cancel
                        </Button>
                        <Button onClick={handleConfim} variant={variant} className='w-full lg:w-auto'>
                            Confirm
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </ResposiveModal>
    )

    return [ConfirmationDialog, confirm]
}