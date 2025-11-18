"use server";

import { redirect } from "next/navigation";
import { OAuthProvider } from "node-appwrite";
import { createAdminClient } from "./appwrite";

export async function signUpWithGithub() {

    const { account } = await createAdminClient();

    const redirectUrl = await account.createOAuth2Token({
        provider: OAuthProvider.Github,
        success: `${process.env.NEXT_PUBLIC_APP_URL}/oauth`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
    });

    return redirect(redirectUrl);
};

export async function signUpWithGoogle() {

    const { account } = await createAdminClient();

    const redirectUrl = await account.createOAuth2Token({
        provider: OAuthProvider.Google,
        success: `${process.env.NEXT_PUBLIC_APP_URL}/oauth`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
    });

    return redirect(redirectUrl);
};

