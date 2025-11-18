import { ProjectAnalyticsResponceType } from '@/features/projects/api/use-get-project-analytics'
import { FC } from 'react'
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import AnalyticsCard from './analytics-card';
import DottedSeparator from './dotted-separator';

type AnalyticsProps = ProjectAnalyticsResponceType & {
    projectCount?: number,
    projectDifference?: number
}

const Analytics: FC<AnalyticsProps> = ({ data }) => {
    return (
        <ScrollArea className='border rounded-lg w-full whitespace-nowrap shrink-0'>
            <div className="w-full flex flex-row">
                <div className='flex items-center flex-1'>
                    <AnalyticsCard
                        title='Total Tasks'
                        value={data.taskCount}
                        variant={data.taskDifference > 0 ? 'up' : 'down'}
                        increaseValue={data.taskDifference}
                    />
                    <DottedSeparator direction='vertical' />
                </div>
                <div className='flex items-center flex-1'>
                    <AnalyticsCard
                        title='Assigned Tasks'
                        value={data.assigneeTaskCount}
                        variant={data.assigneeTaskDifference > 0 ? 'up' : 'down'}
                        increaseValue={data.assigneeTaskDifference}
                    />
                    <DottedSeparator direction='vertical' />
                </div>
                <div className='flex items-center flex-1'>
                    <AnalyticsCard
                        title='Completed Tasks'
                        value={data.completedTasksCount}
                        variant={data.completedTasksDifference > 0 ? 'up' : 'down'}
                        increaseValue={data.completedTasksDifference}
                    />
                    <DottedSeparator direction='vertical' />
                </div>
                <div className='flex items-center flex-1'>
                    <AnalyticsCard
                        title='Overdue Tasks'
                        value={data.overDueTasksCount}
                        variant={data.overDueTasksDifference > 0 ? 'up' : 'down'}
                        increaseValue={data.overDueTasksDifference}
                    />
                    <DottedSeparator direction='vertical' />
                </div>
                <div className='flex items-center flex-1'>
                    <AnalyticsCard
                        title='Incompleted Tasks'
                        value={data.incompletedTasksCount}
                        variant={data.incompletedTasksDifference > 0 ? 'up' : 'down'}
                        increaseValue={data.incompletedTasksDifference}
                    />
                </div>
            </div>
            <ScrollBar orientation='horizontal'/>
        </ScrollArea>
    )
}

export default Analytics