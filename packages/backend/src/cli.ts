import yargs from "yargs";
import { loadConfig } from "./config.js";
import { User, connectToDatabase } from "./database/index.js";
import { UserInput, userSchema } from "@flowtr/panel-sdk";
import { hash } from "bcrypt";
import { startBackend } from "./index.js";

const setup = async () => {
    const config = loadConfig();
    const db = await connectToDatabase(config.toObject());

    return { config, db };
};

yargs(process.argv.slice(2))
    .scriptName("fdpla")
    .completion()
    .help()
    .alias("h", "help")
    .command(
        "run",
        "Run the backend",
        (yargs) => yargs,
        () =>
            startBackend().catch((err) => {
                console.error(err);
                process.exit(1);
            })
    )
    .command("user", "User subcommand", (yargs) =>
        yargs.command(
            "add",
            "Adds a user to the database",
            (yargs) =>
                yargs
                    .option("username", {
                        alias: "u",
                        demandOption: true,
                        type: "string",
                    })
                    .option("password", {
                        alias: "p",
                        demandOption: true,
                        type: "string",
                    })
                    .option("super", {
                        alias: "s",
                        type: "boolean",
                        default: false,
                    }),
            async (args) => {
                await setup();
                const hashedPassword = await hash(args.password, 12);
                const raw: UserInput = {
                    username: args.username,
                    password: hashedPassword,
                    roles: [args.super ? "admin" : "guest"],
                };
                const parsedUser = await userSchema.parseAsync(raw);
                await User.insert(parsedUser);
                return await User.findOne({ id: parsedUser.id });
            }
        )
    )
    .parse();
