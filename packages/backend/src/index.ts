import fastify, { FastifyRequest, FastifyReply } from "fastify";
import { connectToDatabase, User } from "./database/index.js";
import { loadConfig } from "./config.js";
import jwt from "jsonwebtoken";
import { compare } from "bcrypt";
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
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { Logger } from "tslog";

// TODO: restructure api with seperate routers
export const startBackend = async () => {
    const logger = new Logger({
        name: "Panel Backend",
    });
    const config = await loadConfig();
    const port = parseInt(process.env.PORT || "8080");
    await connectToDatabase(config);
    const app = fastify({
        logger: true,
    });
    app.register(cors);
    app.register(helmet);

    const docker = new Docker({
        socketPath: "/run/user/1000/podman/podman.sock",
    });

    const getAuth = (req: FastifyRequest, res: FastifyReply) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.code(400);
            return {
                error: errors.noAuthorizationHeader,
            } as ErrorResponse;
        }
        try {
            return jwt.verify(authHeader, config.jwtSecret);
        } catch (err) {
            res.code(400);
            return {
                error: errors.invalidToken,
            } as ErrorResponse;
        }
    };

    const getUser = async (req: FastifyRequest, res: FastifyReply) => {
        const parsed = getAuth(req, res);
        if (parsed && parsed["id"]) {
            req.user = await User.findOne({ id: parsed["id"] });
        }
    };

    // TODO: admin only
    app.get("/user/all", { preHandler: [getUser] }, async (req, res) => {
        if (!req.user?.roles.includes("admin")) {
            res.code(400);
            return {
                error: errors.denied,
            } as ErrorResponse;
        }

        const result = await User.find();
        return {
            users: result,
        };
    });

    app.get("/auth/profile", { preHandler: [getUser] }, async (req, res) => {
        if (req.user)
            return {
                user: req.user,
            } as ProfileResponse;
    });

    app.post<{
        Body: {
            username: string;
            password: string;
        };
    }>("/auth/login", async (req, res) => {
        const existingUser = await User.findOne({
            username: req.body.username,
        });
        if (!existingUser) {
            res.code(401);
            return {
                error: errors.userNotFound,
                username: req.body.username,
            } as LoginResponse;
        }

        if (!(await compare(req.body.password, existingUser.password))) {
            res.status(401);
            return {
                error: errors.invalidPassword,
            } as LoginResponse;
        }

        const token = jwt.sign(
            {
                id: existingUser.id,
                username: existingUser.username,
            },
            config.jwtSecret,
            { expiresIn: "24h" }
        );
        return {
            token,
        } as LoginResponse;
    });

    app.get("/deployment/all", { preHandler: [getUser] }, async (req, res) => {
        try {
            if (!req.user) {
                res.code(500);

                return {
                    error: errors.userNotFound,
                } as ErrorResponse;
            }
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

            return {
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
            };
        } catch (err) {
            console.log(err);
            res.status(500);
            return {
                error: errors.dockerFetch,
            } as ErrorResponse;
        }
    });

    app.get<{
        Params: {
            id: string;
        };
    }>("/deployment/one/:id", { preHandler: [getUser] }, async (req, res) => {
        try {
            if (!req.user) {
                res.status(500);
                return {
                    error: errors.userNotFound,
                } as ErrorResponse;
            }
            /*             if (!user?.roles.includes("deployer"))
                return res.status(400).json({
                    error: errors.denied,
                } as ErrorResponse); */
            const filteredContainers: Docker.ContainerInspectInfo[] = [
                await docker.getContainer(req.params.id).inspect(),
            ];
            // console.log(filteredContainers);

            return {
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
            };
        } catch (err) {
            res.status(500);
            return {
                error: errors.dockerFetch,
            } as ErrorResponse;
        }
    });

    app.post("/deploy", { preHandler: [getUser] }, async (req, res) => {
        try {
            if (!req.user) {
                res.status(500);
                return {
                    error: errors.userNotFound,
                } as ErrorResponse;
            }
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
                ExposedPorts: { "80/tcp": {} },
                HostConfig: {
                    PortBindings: { "80/tcp": [{ HostPort: "5000" }] },
                },
            });

            await container.start();

            return {
                container: await container.inspect(),
                deployment,
            };
        } catch (err) {
            res.status(500);

            return {
                error: err,
            } as ErrorResponse;
        }
    });

    app.setErrorHandler((err, _req, res) => {
        logger.error(err.stack);
        res.status(500);

        res.send(err);
    });

    app.listen(port, () => logger.info(`Listening on :${port}`));
};
