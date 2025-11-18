import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { sessionMiddleWare } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import z from "zod";
import { createProjectSchema, updateProjectSchema } from "../schemas";
import { Project } from "../types";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { TaskStatus } from "@/features/tasks/types";

const app = new Hono()
    .get(
        '/',
        sessionMiddleWare,
        zValidator('query', z.object({ workspaceId: z.string() })),
        async (c) => {
            const user = c.get('user');
            const databases = c.get('databases');

            const { workspaceId } = c.req.valid('query');

            if (!workspaceId) return c.json({ error: 'Missing workspace' }, 400);

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (!member) return c.json({ error: 'Unauthorized' }, 401);

            const projects = await databases.listDocuments<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                [
                    Query.equal('workspaceId', workspaceId),
                    Query.orderDesc('$createdAt'),
                ],
            )

            return c.json({ data: projects });
        }
    )
    .get(
        '/:projectId',
        sessionMiddleWare,
        async (c) => {
            const user = c.get('user');
            const databases = c.get('databases');
            const { projectId } = c.req.param();

            const project = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectId
            )

            const member = await getMember({
                databases,
                workspaceId: project.workspaceId,
                userId: user.$id,
            })

            if (!member) {
                return c.json({ error: 'Unauthrized' }, 401)
            }

            return c.json({ data: project })

        }
    )
    .post(
        '/',
        sessionMiddleWare,
        zValidator('form', createProjectSchema),
        async (c) => {
            const databases = c.get('databases');
            const storage = c.get('storage');
            const user = c.get('user');

            const { name, image, workspaceId } = c.req.valid('form');

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if (!member) return c.json({ error: 'Anauthorized' }, 401)

            let uploadedImageUrl: string | undefined;

            if (image instanceof File) {
                const file = await storage.createFile(
                    IMAGES_BUCKET_ID,
                    ID.unique(),
                    image
                )

                const arrayBuffer = await storage.getFileDownload(
                    IMAGES_BUCKET_ID,
                    file.$id,
                )

                uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`
            }

            const project = await databases.createDocument(
                DATABASE_ID,
                PROJECTS_ID,
                ID.unique(),
                {
                    name,
                    imageURL: uploadedImageUrl,
                    workspaceId
                }
            )

            return c.json({ data: project })
        }
    )
    .patch(
        '/:projectId',
        sessionMiddleWare,
        zValidator("form", updateProjectSchema),
        async (c) => {
            const databases = c.get('databases');
            const storage = c.get('storage');
            const user = c.get('user');

            const { projectId } = c.req.param();
            const { name, image } = c.req.valid('form');

            const existingProject = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectId
            )

            const member = await getMember({
                databases,
                userId: user.$id,
                workspaceId: existingProject.workspaceId
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401)
            }

            let uploadedImageUrl: string | undefined;

            if (image instanceof File) {
                const file = await storage.createFile(
                    IMAGES_BUCKET_ID,
                    ID.unique(),
                    image
                )

                const arrayBuffer = await storage.getFileDownload(
                    IMAGES_BUCKET_ID,
                    file.$id,
                )

                uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`
            } else {
                uploadedImageUrl = image;
            }

            const project = await databases.updateDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectId,
                {
                    name,
                    imageURL: uploadedImageUrl,
                }
            )

            return c.json({ data: project })
        }
    )
    .delete(
        '/:projectId',
        sessionMiddleWare,
        async (c) => {
            const databases = c.get('databases');
            const user = c.get('user');
            const { projectId } = c.req.param();

            const existingProject = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectId
            )

            const memeber = await getMember({
                databases,
                userId: user.$id,
                workspaceId: existingProject.workspaceId
            })

            if (!memeber) {
                return c.json({ error: 'Unauthorized' }, 401);
            }


            await databases.deleteDocument(
                DATABASE_ID,
                PROJECTS_ID,
                projectId,
            )

            return c.json({ data: { $id: projectId } })
        }
    )
    .get(
        '/:projectId/analytics',
        sessionMiddleWare,
        async (c) => {
            const user = c.get('user');
            const databases = c.get('databases')
            const { projectId } = c.req.param()

            const project = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectId
            )

            const member = await getMember({
                databases,
                userId: user.$id,
                workspaceId: project.workspaceId
            })

            if (!member) {
                return c.json({ error: 'Unauthrized' }, 401);
            }

            const today = new Date();
            const thisMonthStart = startOfMonth(today);
            const thisMonthEnd = endOfMonth(today);
            const lastMonthStart = startOfMonth(subMonths(today, 1));
            const lastMonthEnd = endOfMonth(subMonths(today, 1));


            const thisMonthTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal('projectId', projectId),
                    Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
                    Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString())
                ]
            );

            const lastMonthTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal('projectId', projectId),
                    Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
                    Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString())
                ]
            );


            const taskCount = thisMonthTasks.total;
            const taskDifference = taskCount - lastMonthTasks.total;

            const thisMonthAssignedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal('projectId', projectId),
                    Query.equal('assigneeId', member.$id),
                    Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
                    Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
                ]
            );


            const lastMonthAssignedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal('projectId', projectId),
                    Query.equal('assigneeId', member.$id),
                    Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
                    Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
                ]
            );

            const assigneeTaskCount = thisMonthAssignedTasks.total;
            const assigneeTaskDifference = assigneeTaskCount - lastMonthAssignedTasks.total;

            const thisMonthIncompletedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal('projectId', projectId),
                    Query.notEqual('status', TaskStatus.DONE),
                    Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
                    Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
                ]
            );


            const lastMonthIncompletedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal('projectId', projectId),
                    Query.notEqual('status', TaskStatus.DONE),
                    Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
                    Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
                ]
            );

            const incompletedTasksCount = thisMonthIncompletedTasks.total;
            const incompletedTasksDifference = lastMonthIncompletedTasks.total - incompletedTasksCount;


            const thisMonthCompletedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal('projectId', projectId),
                    Query.equal('status', TaskStatus.DONE),
                    Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
                    Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
                ]
            );


            const lastMonthCompletedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal('projectId', projectId),
                    Query.equal('status', TaskStatus.DONE),
                    Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
                    Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
                ]
            );

            const completedTasksCount = thisMonthCompletedTasks.total;
            const completedTasksDifference = lastMonthCompletedTasks.total - completedTasksCount;


            const thisMonthOverDueTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal('projectId', projectId),
                    Query.notEqual('status', TaskStatus.DONE),
                    Query.lessThan('dueDate', today.toISOString()),
                    Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
                    Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
                ]
            );


            const lastMonthOverDueTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal('projectId', projectId),
                    Query.notEqual('status', TaskStatus.DONE),
                    Query.lessThan('dueDate', today.toISOString()),
                    Query.greaterThanEqual('$createdAt', lastMonthStart.toISOString()),
                    Query.lessThanEqual('$createdAt', lastMonthEnd.toISOString()),
                ]
            );

            const overDueTasksCount = thisMonthOverDueTasks.total;
            const overDueTasksDifference = lastMonthOverDueTasks.total - overDueTasksCount;

            return c.json({
                data: {
                    taskCount,
                    taskDifference,
                    assigneeTaskCount,
                    assigneeTaskDifference,
                    incompletedTasksCount,
                    incompletedTasksDifference,
                    completedTasksCount,
                    completedTasksDifference,
                    overDueTasksCount,
                    overDueTasksDifference
                }
            })
        }
    )

export default app;