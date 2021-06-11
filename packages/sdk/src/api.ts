import { IUser, IContainer } from "./schema";
import axios, { AxiosError, AxiosInstance } from "axios";
import { Storage } from "./util";

export interface PanelError {
    name: string;
    translation: string;
}

// TODO: translation code
export const errors = {
    userNotFound: {
        name: "UserNotFound",
        translation: "👤 User Not Found",
    },
    invalidPassword: {
        name: "InvalidPassword",
        translation: "🔐 Invalid Password",
    },
    invalidToken: {
        name: "InvalidToken",
        translation: "🔐 Invalid Token",
    },
    noAuthorizationHeader: {
        name: "NoAuthorizationHeader",
        translation: "🔐 Not Logged In",
    },
    dockerFetch: {
        name: "DeploymentFetch",
        translation: "🌐 Failed To Fetch Deployment",
    },
    denied: {
        name: "AccessDenied",
        translation: "❌ Permission Denied",
    },
};

export interface ErrorResponse {
    error?: PanelError;
}

export interface LoginResponse extends ErrorResponse {
    token?: string;
}
export interface ProfileResponse extends ErrorResponse {
    /**
     * The username provided if there was an error retrieving the profile.
     */
    username?: string;
    user?: IUser;
}

export interface ContainerResponse extends ErrorResponse {
    containers: IContainer[];
}

export type LoginInput = Omit<IUser, "id" | "roles">;

export class PanelApi {
    protected client: AxiosInstance;

    constructor(
        public readonly baseUrl: string,
        public readonly storage: Storage,
        public readonly handleError: (error: string) => void
    ) {
        this.client = axios.create({
            baseURL: baseUrl,
        });
    }

    async login(data: LoginInput) {
        try {
            const res = await this.client.post<LoginResponse>(
                "/auth/login",
                data
            );
            // TODO: better error message api
            if (res.status !== 200 && res.data.error) {
                this.handleError(res.data.error.translation);
                throw {
                    message: res.data.error.translation,
                    response: res,
                } as AxiosError;
            }
            if (res.data.token)
                this.storage.set({
                    token: res.data.token,
                });
            return res;
        } catch (err) {
            if (axios.isAxiosError(err))
                this.handleError(
                    (err as AxiosError<LoginResponse>).response?.data.error
                        ?.translation || err.message
                );
            this.storage.remove("token");

            throw err;
        }
    }

    async getDeployments() {
        try {
            const res = await this.client.get<ContainerResponse>(
                "/deployment/all",
                {
                    headers: {
                        Authorization: this.storage.get("token").token,
                    },
                }
            );
            return res;
        } catch (err) {
            if (axios.isAxiosError(err))
                this.handleError(
                    (err as AxiosError<LoginResponse>).response?.data.error
                        ?.translation || err.message
                );
            this.storage.remove("token");

            throw err;
        }
    }

    async getProfile() {
        try {
            const res = await this.client.get<ProfileResponse>(
                "/auth/profile",
                {
                    headers: {
                        Authorization: this.storage.get("token").token,
                    },
                }
            );
            // TODO: better error message api with language translations
            if (res.status !== 200 && res.data.error) {
                this.handleError(res.data.error.translation);
                throw {
                    message: res.data.error.translation,
                    response: res,
                } as AxiosError;
            }
            return res;
        } catch (err) {
            if (axios.isAxiosError(err))
                this.handleError(
                    (err as AxiosError<LoginResponse>).response?.data.error
                        ?.translation || err.message
                );
            this.storage.remove("token");

            throw err;
        }
    }
}
