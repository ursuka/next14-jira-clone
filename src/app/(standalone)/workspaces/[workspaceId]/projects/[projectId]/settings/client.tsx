import PageError from '@/components/page-error'
import PageLoader from '@/components/page-loader'
import { useGetProject } from '@/features/projects/api/use-get-project'
import EditProjectForm from '@/features/projects/components/edit-project-form'
import { useProjectId } from '@/features/projects/hooks/use-project-id'
import { FC } from 'react'

const ProjectIdSettingsClient: FC = () => {
    const projectId = useProjectId();
    const { data: initalvalues, isLoading } = useGetProject({ projectId })

    if (isLoading) {
        return <PageLoader />
    }

    if (!initalvalues) {
        return <PageError message='Project not found.' />
    }

    return (
        <div className='w-full lg:max-w-xl'>
            <EditProjectForm initialValue={initalvalues} />
        </div>
    )
}

export default ProjectIdSettingsClient