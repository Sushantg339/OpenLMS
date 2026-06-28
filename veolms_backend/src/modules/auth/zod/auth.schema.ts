import {z} from "zod"

export const signupSchema = z.object({
    name: z.string().trim().min(3, "Name must be of atleast 3 characters"),
    email: z.email("Invalid email format"),
    password: z.string().min(6, "Password must be atleast 8 characters"),
})

export const loginSchema = z.object({
    email: z.email("Invalid email format"),
    password: z.string().min(8, "Password must be atleast 8 characters"),
})