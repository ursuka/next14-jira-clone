import { Models } from "node-appwrite";
import { Project } from "../projects/types";

export enum TaskStatus {
    BACKLOG = 'BACKLOG',
    IN_PROGRESS = 'IN_PROGRESS',
    IN_REVIEW = 'IN_REVIEW',
    TODO = 'TODO',
    DONE = 'DONE'
}

export type Task = Models.Document & {
    name: string;
    status: TaskStatus;
    workspaceId: string;
    assigneeId: string;
    projectId: string;
    position: number;
    dueDate: string;
    description?: string;
}

export type TaskCorrect = Models.Document & {
    project: Project;
    assignee: Models.Document & {
        name: string;
        email: string;
    };
    name: string;
    status: TaskStatus;
    workspaceId: string;
    assigneeId: string;
    projectId: string;
    position: number;
    dueDate: string;
    description?: string;
}