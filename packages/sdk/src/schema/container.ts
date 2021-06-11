import { z } from "zod";

export const portSchema = z.object({
    privatePort: z.number(),
    publicPort: z.number(),
    type: z.literal("tcp").default("tcp"),
});
export const containerSchema = z.object({
    id: z.string().nonempty(),
    imageID: z.string().nonempty().optional(),
    names: z.array(z.string().nonempty()).default([]),
    labels: z.record(z.string().nonempty()).default({}),
    status: z.union([
        z.literal("running"),
        z.literal("restarting"),
        z.literal("created"),
        z.literal("removing"),
        z.literal("paused"),
        z.literal("exited"),
        z.literal("dead"),
    ]),
    ports: z.array(portSchema),
});

export type IContainer = z.infer<typeof containerSchema>;
export type IPort = z.infer<typeof portSchema>;
export type ContainerInput = z.input<typeof containerSchema>;
