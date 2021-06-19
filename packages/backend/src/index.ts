import express, { NextFunction, Request, Response } from "express";
import { connectToDatabase, User } from "./database/index.js";
import { loadConfig } from "./config";
import * as jwt from "jsonwebtoken";
import { compare } from "bcrypt";
import cors from "cors";
import {
    deploymentSchema,
    ErrorResponse,
    errors,
    IDeployment,
    IPort,
    LoginResponse,
    ProfileResponse,
} from "@flowtr/panel-sdk";
import Docker from "dockerode";

// TODO: restructure api with seperate routers
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
            } as ErrorResponse);
        try {
            return jwt.verify(authHeader, config.toObject().jwtSecret);
        } catch (err) {
            return res.status(400).json({
                error: errors.invalidToken,
            } as ErrorResponse);
        }
    };

    const getUser = async (req: Request, res: Response, next: NextFunction) => {
        const parsed = getAuth(req, res);
        if (parsed && parsed["id"]) {
            req.user = await User.findOne({ id: parsed["id"] });
            next();
        }
    };

    // TODO: admin only
    app.get("/user/all", getUser, async (req, res) => {
        if (!req.user?.roles.includes("admin"))
            return res.status(400).json({
                error: errors.denied,
            } as ErrorResponse);
        const result = await User.find();
        return res.json({
            users: result,
        });
    });

    app.get("/auth/profile", getUser, async (req, res) => {
        if (req.user)
            return res.json({
                user: req.user,
            } as ProfileResponse);
    });

    app.post("/auth/login", async (req, res) => {
        const existingUser = await User.findOne({
            username: req.body.username,
        });
        if (!existingUser)
            return res.status(401).json({
                error: errors.userNotFound,
                username: req.body.username,
            } as LoginResponse);
        if (!(await compare(req.body.password, existingUser.password)))
            return res.status(401).json({
                error: errors.invalidPassword,
            } as LoginResponse);
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
        } as LoginResponse);
    });

    app.get("/deployment/all", getUser, async (req, res) => {
        try {
            if (!req.user)
                return res.status(500).json({
                    error: errors.userNotFound,
                } as ErrorResponse);
            /*             if (!user?.roles.includes("deployer"))
                return res.status(400).json({
                    error: errors.denied,
                } as ErrorResponse); */
            const containers = await docker.listContainers({
                filters: {
                    label: [`com.firenodes.panel.user=${req.user?.id}`],
                },
                all: true,
            });
            const filteredContainers: Docker.ContainerInspectInfo[] = [];

            for await (const c of containers)
                try {
                    const container = await docker.getContainer(c.Id).inspect();
                    filteredContainers.push(container);
                } catch {}

            return res.json({
                containers: filteredContainers.map(
                    (c) =>
                        ({
                            id: c.Id,
                            status: c.State.Running,
                            image: c.Config.Image,
                            labels: c.Config.Labels,
                            name:
                                c.Config.Labels[
                                    "com.firenodes.panel.deployment.name"
                                ] || c.Name,
                            ports: Object.entries<{ HostPort: string }[]>(
                                c.HostConfig.PortBindings
                            )
                                .filter((p) => p[0] && p[1])
                                .map(
                                    (p) =>
                                        ({
                                            privatePort: parseInt(
                                                p[0].includes("/")
                                                    ? p[0].split("/")[0]
                                                    : p[0]
                                            ),
                                            publicPort: parseInt(
                                                p[1][0].HostPort
                                            ),
                                        } as IPort)
                                ),
                        } as IDeployment)
                ),
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                error: errors.dockerFetch,
            } as ErrorResponse);
        }
    });

    app.get("/deployment/one/:id", getUser, async (req, res) => {
        try {
            if (!req.user)
                return res.status(500).json({
                    error: errors.userNotFound,
                } as ErrorResponse);
            /*             if (!user?.roles.includes("deployer"))
                return res.status(400).json({
                    error: errors.denied,
                } as ErrorResponse); */
            const filteredContainers: Docker.ContainerInspectInfo[] = [
                await docker.getContainer(req.params.id).inspect(),
            ];
            // console.log(filteredContainers);

            return res.json({
                containers: filteredContainers.map(
                    (c) =>
                        ({
                            id: c.Id,
                            status: c.State.Running,
                            image: c.Config.Image,
                            labels: c.Config.Labels,
                            name:
                                c.Config.Labels[
                                    "com.firenodes.panel.deployment.name"
                                ] || c.Name,
                            ports: Object.entries<{ HostPort: string }[]>(
                                c.HostConfig.PortBindings
                            )
                                .filter((p) => p[0] && p[1])
                                .map(
                                    (p) =>
                                        ({
                                            privatePort: parseInt(
                                                p[0].includes("/")
                                                    ? p[0].split("/")[0]
                                                    : p[0]
                                            ),
                                            publicPort: parseInt(
                                                p[1][0].HostPort
                                            ),
                                        } as IPort)
                                ),
                        } as IDeployment)
                ),
            });
        } catch (err) {
            return res.status(500).json({
                error: errors.dockerFetch,
            } as ErrorResponse);
        }
    });

    app.post("/deploy", getUser, async (req, res) => {
        try {
            if (!req.user)
                return res.status(500).json({
                    error: errors.userNotFound,
                } as ErrorResponse);
            /*             if (!user?.roles.includes("deployer"))
                return res.status(400).json({
                    error: errors.denied,
                } as ErrorResponse); */
            const deployment = await deploymentSchema.parseAsync(req.body);
            try {
                await docker.pull(deployment.image);
            } catch (err) {
                console.debug(
                    `Unable to pull image ${deployment.image}: ${err}`
                );
            }
            const container = await docker.createContainer({
                name: `deployment_${deployment.id}`,
                Image: deployment.image,
                Labels: {
                    "com.firenodes.panel.user": req.user?.id,
                    "com.firenodes.panel.deployment": deployment.id,
                    "com.firenodes.panel.deployment.name": deployment.name,
                },
                ExposedPorts: { "80/tcp:": {} },
                HostConfig: {
                    PortBindings: { "80/tcp": [{ HostPort: "5000" }] },
                },
            });

            await container.start();

            return res.json({
                container: await container.inspect(),
                deployment,
            });
        } catch (err) {
            return res.status(500).json({
                error: err,
            } as ErrorResponse);
        }
    });

    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json(err);
    });

    app.listen(port, () => console.log(`Listening on :${port}`));
};
