import * as z from "zod";
import json5 from "json5";
import { readFile } from "fs/promises";

const configSchema = z.object({
    database: z.object({
        debug: z.boolean().optional(),
        uri: z.string().url(),
    }),
    jwtSecret: z.string().min(5).default("12345"),
});

export type Config = z.infer<typeof configSchema>;

export const loadConfig = async (path = `${process.cwd()}/config.json5`) => {
    const config = await readFile(path, "utf-8");
    const parsedConfig = json5.parse(config);
    const validatedConfig: Config = await configSchema.parseAsync(parsedConfig);

    return validatedConfig;
};
