import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono'
import { createWorkspaceSchema, updateWorkspaceSchema } from '../schemas';
import { sessionMiddleWare } from '@/lib/session-middleware';
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, TASKS_ID, WORKSPACES_NAME } from '@/config';
import { ID, Query } from 'node-appwrite';
import { MemberRole } from '@/features/members/types';
import { generateInviteCode } from '@/lib/utils';
import { getMember } from '@/features/members/utils';
import z from 'zod';
import { Workspace } from '../types';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { TaskStatus } from '@/features/tasks/types';

const app = new Hono()
    .get(
        '/:workspaceId/info',
        sessionMiddleWare,
        async (c) => {
            const databases = c.get('databases');
            const { workspaceId } = c.req.param();

            const workspace = await databases.getDocument<Workspace>(
                DATABASE_ID,
                WORKSPACES_NAME,
                workspaceId
            )

            return c.json({
                data: {
                    $id: workspace.$id,
                    name: workspace.name,
                    imageUrl: workspace.imageURL
                }
            });
        }
    )
    .get(
        '/:workspaceId',
        sessionMiddleWare,
        async (c) => {
            const user = c.get('user');
            const databases = c.get('databases');
            const { workspaceId } = c.req.param();

            const member = await getMember({
                databases,
                userId: user.$id,
                workspaceId
            })

            if (!member) {
                return c.json({ error: 'Unauthorized' }, 401)
            }

            const workspace = await databases.getDocument<Workspace>(
                DATABASE_ID,
                WORKSPACES_NAME,
                workspaceId
            )

            return c.json({ data: workspace });

        }
    )
    .get(
        '/',
        sessionMiddleWare,
        async (c) => {
            const user = c.get('user');
            const databases = c.get('databases');

            const members = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [Query.equal('userId', user.$id)]
            )

            if (members.total === 0) {
                return c.json({ data: { documents: [], total: 0 } })
            }

            const workspaceIds = members.documents.map((member) => member.workspaceId);

            const workspace = await databases.listDocuments(
                DATABASE_ID,
                WORKSPACES_NAME,
                [
                    Query.orderDesc('$createdAt'),
                    Query.contains('$id', workspaceIds)
                ]
            )
            return c.json({ data: workspace });
        }
    )
    .post(
        '/',
        zValidator('form', createWorkspaceSchema),
        sessionMiddleWare,
        async (c) => {
            const database = c.get('databases');
            const storage = c.get('storage');
            const user = c.get('user');

            const { name, image } = c.req.valid('form');

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

            const workspace = await database.createDocument(
                DATABASE_ID,
                WORKSPACES_NAME,
                ID.unique(),
                {
                    name,
                    userId: user.$id,
                    imageURL: uploadedImageUrl,
                    inviteCode: generateInviteCode(8)
                }
            )

            await database.createDocument(
                DATABASE_ID,
                MEMBERS_ID,
                ID.unique(),
                {
                    userId: user.$id,
                    workspaceId: workspace.$id,
                    role: MemberRole.ADMIN
                }
            )

            return c.json({ data: workspace })
        }
    )
    .patch(
        '/:workspaceId',
        sessionMiddleWare,
        zValidator("form", updateWorkspaceSchema),
        async (c) => {
            const databases = c.get('databases');
            const storage = c.get('storage');
            const user = c.get('user');

            const { workspaceId } = c.req.param();
            const { name, image } = c.req.valid('form');

            const member = await getMember({ databases, userId: user.$id, workspaceId });

            if (!member || member.role !== MemberRole.ADMIN) {
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

            const workspace = await databases.updateDocument(
                DATABASE_ID,
                WORKSPACES_NAME,
                workspaceId,
                {
                    name,
                    imageURL: uploadedImageUrl,
                }
            )

            return c.json({ data: workspace })
        }
    )
    .delete(
        '/:workspaceId',
        sessionMiddleWare,
        async (c) => {
            const databases = c.get('databases');
            const user = c.get('user');
            const { workspaceId } = c.req.param();

            const memeber = await getMember({
                databases,
                userId: user.$id,
                workspaceId
            })

            if (!memeber || memeber.role !== MemberRole.ADMIN) {
                return c.json({ error: 'Unauthorized' }, 401);
            }

            await databases.deleteDocument(
                DATABASE_ID,
                WORKSPACES_NAME,
                workspaceId,
            )

            return c.json({ data: { $id: workspaceId } })
        }
    )
    .post(
        '/:workspaceId/reset-invite-code',
        sessionMiddleWare,
        async (c) => {
            const databases = c.get('databases');
            const user = c.get('user');
            const { workspaceId } = c.req.param();

            const memeber = await getMember({
                databases,
                userId: user.$id,
                workspaceId
            })

            if (!memeber || memeber.role !== MemberRole.ADMIN) {
                return c.json({ error: 'Unauthorized' }, 401);
            }

            const workspace = await databases.updateDocument(
                DATABASE_ID,
                WORKSPACES_NAME,
                workspaceId,
                {
                    inviteCode: generateInviteCode(8),

                }
            )

            return c.json({ workspace })
        }
    )
    .post(
        '/:workspaceId/join',
        sessionMiddleWare,
        zValidator('json', z.object({ code: z.string() })),
        async (c) => {
            const { workspaceId } = c.req.param();
            const { code } = c.req.valid('json');

            const databases = c.get('databases');
            const user = c.get('user');

            const member = await getMember({
                databases,
                userId: user.$id,
                workspaceId
            });

            if (member) {
                return c.json({ error: 'Already a member!' }, 400)
            };

            const workspace = await databases.getDocument<Workspace>(
                DATABASE_ID,
                WORKSPACES_NAME,
                workspaceId,
            );

            if (workspace.inviteCode !== code) {
                return c.json({ error: 'Invalid invite code' }, 400);
            }

            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_ID,
                ID.unique(),
                {
                    workspaceId,
                    userId: user.$id,
                    role: MemberRole.MEMEBER
                }
            )
            return c.json({ data: workspace })
        }
    )
    .get(
        '/:workspaceId/analytics',
        sessionMiddleWare,
        async (c) => {
            const user = c.get('user');
            const databases = c.get('databases')
            const { workspaceId } = c.req.param()

            const member = await getMember({
                databases,
                userId: user.$id,
                workspaceId: workspaceId
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
                    Query.equal('workspaceId', workspaceId),
                    Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
                    Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString())
                ]
            );

            const lastMonthTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal('workspaceId', workspaceId),
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
                    Query.equal('workspaceId', workspaceId),
                    Query.equal('assigneeId', member.$id),
                    Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
                    Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
                ]
            );


            const lastMonthAssignedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal('workspaceId', workspaceId),
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
                    Query.equal('workspaceId', workspaceId),
                    Query.notEqual('status', TaskStatus.DONE),
                    Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
                    Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
                ]
            );


            const lastMonthIncompletedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal('workspaceId', workspaceId),
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
                    Query.equal('workspaceId', workspaceId),
                    Query.equal('status', TaskStatus.DONE),
                    Query.greaterThanEqual('$createdAt', thisMonthStart.toISOString()),
                    Query.lessThanEqual('$createdAt', thisMonthEnd.toISOString()),
                ]
            );


            const lastMonthCompletedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal('workspaceId', workspaceId),
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
                    Query.equal('workspaceId', workspaceId),
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
                    Query.equal('workspaceId', workspaceId),
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