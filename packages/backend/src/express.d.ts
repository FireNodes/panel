import { User } from "./database";

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}
