import express, { Request, Response } from "express";
import { connectToDatabase, User } from "./database/index.js";
import { loadConfig } from "./config";
import * as jwt from "jsonwebtoken";
import { compare } from "bcrypt";
import cors from "cors";
import { errors } from "@flowtr/panel-sdk";
import Docker from "dockerode";

// TODO: cli for migration and running the server w/ yargs
export const startBackend = async () => {
    const config = loadConfig();
    const port = parseInt(process.env.PORT || "8080");
    await connectToDatabase(config.toObject());
    const app = express();
    app.disable("etag");
    app.use(cors(), express.json());

    const docker = new Docker();

    const getAuth = (req: Request, res: Response) => {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return res.status(400).json({
                error: errors.noAuthorizationHeader,
            });
        try {
            return jwt.verify(authHeader, config.toObject().jwtSecret);
        } catch (err) {
            return res.status(400).json({
                error: errors.invalidToken,
            });
        }
    };

    const getUser = async (req: Request, res: Response) => {
        const parsed = getAuth(req, res);
        if (parsed && parsed["id"])
            return await User.findOne({ id: parsed["id"] });
    };

    // TODO: admin only
    app.get("/user/all", async (req, res) => {
        const result = await User.find();
        res.json({
            users: result,
        });
    });

    app.get("/auth/profile", async (req, res) => {
        const user = await getUser(req, res);
        if (user)
            return res.json({
                user,
            });
    });

    app.post("/auth/login", async (req, res) => {
        const existingUser = await User.findOne({
            username: req.body.username,
        });
        if (!existingUser)
            return res.status(401).json({
                error: errors.userNotFound,
                username: req.body.username,
            });
        if (!(await compare(req.body.password, existingUser.password)))
            return res.status(401).json({
                error: errors.invalidPassword,
            });
        const token = jwt.sign(
            {
                id: existingUser.id,
                username: existingUser.username,
            },
            config.toObject().jwtSecret,
            { expiresIn: "24h" }
        );
        return res.json({
            token,
        });
    });

    app.get("/deployment/all", async (req, res) => {
        const containers = await docker.listContainers();
        const filteredContainers = containers.map((c) =>
            c.Names[0].startsWith("deployment_")
        );
        return res.json({
            filteredContainers,
        });
    });

    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json(err);
    });

    app.listen(port, () => console.log(`Listening on :${port}`));
};
