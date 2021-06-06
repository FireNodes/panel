import { z } from "zod";
import { nanoid } from "nanoid";

export const userSchema = z.object({
    id: z.string().default(() => nanoid(30)),
    username: z.string().min(3),
    password: z.string().min(5),
    roles: z
        .array(
            z.union([
                z.literal("guest"),
                z.literal("client"),
                z.literal("admin"),
            ])
        )
        .default([]),
});

export type IUser = z.infer<typeof userSchema>;
export type UserInput = z.input<typeof userSchema>;
