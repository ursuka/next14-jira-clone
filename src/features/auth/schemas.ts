import z from "zod";

export const loginFormSchema = z.object({
    email: z.email(),
    password: z.string().min(1, 'Required')
})

export const signUpFormSchema = z.object({
    name: z.string().trim().min(1, 'Required'),
    email: z.email(),
    password: z.string().min(8, 'Minimum of 8 characters required')
})