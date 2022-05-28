import { User } from "./database/entity/user.js";

declare module "fastify" {
    interface FastifyRequest {
        user?: User;
    }
}
