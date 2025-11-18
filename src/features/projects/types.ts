import { Models } from "node-appwrite";

export type Project = Models.Document & {
    name: string,
    imageURL: string,
    workspaceId: string,
}