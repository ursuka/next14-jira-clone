import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono'
import { createWorkspaceSchema, updateWorkspaceSchema } from '../schemas';
import { sessionMiddleWare } from '@/lib/session-middleware';
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, WORKSPACES_NAME } from '@/config';
import { ID, Query } from 'node-appwrite';
import { MemberRole } from '@/features/members/types';
import { generateInviteCode } from '@/lib/utils';
import { getMember } from '@/features/members/utils';
import z from 'zod';
import { Workspace } from '../types';

const app = new Hono()
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

            const workspace = await databases.getDocument(
                DATABASE_ID,
                WORKSPACES_NAME,
                workspaceId
            )

            return c.json({ data: workspace });

        }
    )
    .get('/',
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

export default app;