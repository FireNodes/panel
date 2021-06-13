import { nanoid } from "nanoid";
import { z } from "zod";

export const portSchema = z.object({
    privatePort: z.number(),
    publicPort: z.number(),
});
export const deploymentSchema = z.object({
    id: z
        .string()
        .nonempty()
        .default(() => nanoid(32)),
    image: z.string().nonempty(),
    name: z.string().nonempty(),
    labels: z.record(z.string().nonempty()).default({}),
    // TODO: make a container schema and make deployments part of database
    status: z.boolean().default(false),
    ports: z.array(portSchema).default([]),
});

export type IDeployment = z.infer<typeof deploymentSchema>;
export type IPort = z.infer<typeof portSchema>;
export type IDeploymentInput = z.input<typeof deploymentSchema>;
