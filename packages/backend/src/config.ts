import * as z from "zod";
import { readFile } from "@theoparis/config";

const configSchema = z.object({
    database: z.object({
        debug: z.boolean().optional(),
        uri: z.string().url(),
    }),
    jwtSecret: z.string().min(5).default("12345"),
});

export type Config = z.infer<typeof configSchema>;

export const loadConfig = (path = `${process.cwd()}/config.yml`) =>
    readFile<Config>(path, { type: "yaml", schema: configSchema }).validate(
        true
    );
