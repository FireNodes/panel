import { BaseEntity, createConnection } from "typeorm";
import { Config } from "../config.js";
import fs from "fs";
import { User } from "./entity/user.js";

export const connectToDatabase = async (config: Config) => {
    return createConnection({
        entities: [BaseEntity, User],
        logging: config.database.debug,
        synchronize: process.env.SYNC_DB !== "false",
        type: "postgres", // one of `mongo` | `mysql` | `mariadb` | `postgresql` | `sqlite`
        url: config.database.uri, // defaults to 'mongodb://localhost:27017' for mongodb driver
    });
};

export { User };
