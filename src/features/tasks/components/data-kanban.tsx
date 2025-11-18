import { FC, useCallback, useEffect, useState } from 'react'
import { TaskCorrect, TaskStatus } from '../types';

import {
    DragDropContext,
    Draggable,
    Droppable,
    DropResult
} from '@hello-pangea/dnd'
import KanbanColumnHeader from './kanban-column-header';
import KanbanCard from './kanban-card';

const boards: TaskStatus[] = [
    TaskStatus.BACKLOG,
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.DONE,
]

type TasksState = {
    [key in TaskStatus]: TaskCorrect[];
}


interface DataKanbanProps {
    data: TaskCorrect[];
    onChange: (tasks: { $id: string; status: TaskStatus; position: number }[]) => void;
}

const DataKanban: FC<DataKanbanProps> = ({ data, onChange }) => {
    const [tasks, setTasks] = useState<TasksState>(() => {
        const initialTasks: TasksState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: [],
        }
        data.forEach((task) => {
            initialTasks[task.status].push(task);
        })

        Object.keys(initialTasks).forEach((status) => {
            initialTasks[status as TaskStatus].sort((a, b) => a.position - b.position)
        });

        return initialTasks;
    })

    useEffect(() => {
        const newTasks: TasksState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: [],
        }

        data.forEach((task) => {
            newTasks[task.status].push(task);
        })

        Object.keys(newTasks).forEach((status) => {
            newTasks[status as TaskStatus].sort((a, b) => a.position - b.position)
        });

        setTasks(newTasks);
    }, [data])

    const calcNewPosition = (position: number) => {
        return Math.min((position + 1) * 1000, 1_000_000)
    }

    const handleDragEnd = useCallback((result: DropResult) => {
        if (!result.destination) return;
        const { source, destination } = result;
        const sourceStatus = source.droppableId as TaskStatus;
        const destinationStatus = destination.droppableId as TaskStatus;

        let updatePayload: { $id: string; status: TaskStatus; position: number }[] = [];

        setTasks((prevTasks) => {
            const newTask = { ...prevTasks };

            const sourceColumn = [...newTask[sourceStatus]];
            const [movedTask] = sourceColumn.splice(source.index, 1);

            if (!movedTask) {
                console.error('No task found at the source index.');
                return prevTasks
            }

            const updatedMovedTask = sourceStatus !== destinationStatus
                ? { ...movedTask, status: destinationStatus }
                : movedTask;

            newTask[sourceStatus] = sourceColumn;

            const destinationColumn = [...newTask[destinationStatus]];
            destinationColumn.splice(destination.index, 0, updatedMovedTask)
            newTask[destinationStatus] = destinationColumn;

            updatePayload = [];

            updatePayload.push({
                $id: updatedMovedTask.$id,
                status: destinationStatus,
                position: calcNewPosition(destination.index)
            })

            newTask[destinationStatus].forEach((task, index) => {
                if (task && task.$id !== updatedMovedTask.$id) {
                    const newPosition = calcNewPosition(index);
                    if (task.position !== newPosition) {
                        updatePayload.push({
                            $id: task.$id,
                            status: destinationStatus,
                            position: newPosition
                        })
                    }
                }
            })

            if (sourceStatus !== destinationStatus) {
                newTask[sourceStatus].forEach((task, index) => {
                    if (task) {
                        const newPosition = calcNewPosition(index);
                        if (task.position !== newPosition) {
                            updatePayload.push({
                                $id: task.$id,
                                status: sourceStatus,
                                position: newPosition
                            })
                        }
                    }
                })
            }
            return newTask;
        })

        onChange(updatePayload);
    }, [onChange])

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className='flex overflow-x-auto'>
                {boards.map((board) => {
                    return (
                        <div key={board} className='flex-1 mx-2 bg-muted p-1.5 roudned-md min-w-[200px]'>
                            <KanbanColumnHeader
                                board={board}
                                taskCount={tasks[board].length}
                            />
                            <Droppable droppableId={board}>
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className='min-h-[200px]'
                                    >
                                        {tasks[board].map((task, index) => (
                                            <Draggable
                                                key={task.$id}
                                                draggableId={task.$id}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <div
                                                        {...provided.dragHandleProps}
                                                        {...provided.draggableProps}
                                                        ref={provided.innerRef}
                                                    >
                                                        <KanbanCard task={task} />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    )
                })}
            </div>
        </DragDropContext>
    )
}

export default DataKanban