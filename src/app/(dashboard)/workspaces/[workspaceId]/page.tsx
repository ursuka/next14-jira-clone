import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { FC } from "react"
import WorkSpaceIdClient from "./client";

const WorkspaceIdPage: FC = async () => {
    const user = await getCurrent();
    if (!user) redirect('/sign-in');

    return (
        <WorkSpaceIdClient />
    )
}

export default WorkspaceIdPage