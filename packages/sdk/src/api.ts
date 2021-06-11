import { IUser, IContainer } from "./schema";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

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

export interface ApiStorage {
    /**
     * Returns the current value associated with the given key, or null if the given key does not exist in the list associated with the object.
     */
    getItem(key: string): string | null;
    /**
     * Returns the name of the nth key in the list, or null if n is greater than or equal to the number of key/value pairs in the object.
     */
    key(index: number): string | null;
    /**
     * Removes the key/value pair with the given key from the list associated with the object, if a key/value pair with the given key exists.
     */
    removeItem(key: string): void;
    /**
     * Sets the value of the pair identified by key to value, creating a new key/value pair if none existed for key previously.
     *
     * Throws a "QuotaExceededError" DOMException exception if the new value couldn't be set. (Setting could fail if, e.g., the user has disabled storage for the site, or if the quota has been exceeded.)
     */
    setItem(key: string, value: string): void;
}

export class PanelApi {
    protected client: AxiosInstance;

    constructor(
        public readonly baseUrl: string,
        public readonly storage: ApiStorage,
        public readonly handleError: (error: string) => void
    ) {
        this.client = axios.create({
            baseURL: baseUrl,
        });
    }

    login(data: LoginInput) {
        return new Promise<AxiosResponse<LoginResponse>>((resolve, reject) => {
            return this.client
                .post<LoginResponse>("/auth/login", data)
                .then((res) => {
                    // TODO: better error message api
                    if (res.status !== 200 && res.data.error) {
                        this.handleError(res.data.error.translation);
                        return reject(res);
                    }
                    if (res.data.token)
                        this.storage.setItem("token", res.data.token);
                    resolve(res);
                })
                .catch((err: AxiosError) => {
                    this.handleError(
                        err.response?.data.error?.translation || err.message
                    );
                    this.storage.removeItem("token");
                    reject(err);
                });
        });
    }

    getDeployments() {
        return new Promise<AxiosResponse<ContainerResponse>>(
            (resolve, reject) => {
                return this.client
                    .get<ContainerResponse>("/deployment/all", {
                        headers: {
                            Authorization: this.storage.getItem("token"),
                        },
                    })
                    .then((res) => {
                        if (res.status !== 200 && res.data.error) {
                            this.handleError(res.data.error.translation);
                            return reject(res);
                        }
                        resolve(res);
                    })
                    .catch((err: AxiosError) => {
                        this.handleError(
                            err.response?.data.error?.translation || err.message
                        );
                        reject(err);
                    });
            }
        );
    }

    getProfile() {
        return new Promise<AxiosResponse<ProfileResponse>>(
            (resolve, reject) => {
                return this.client
                    .get<ProfileResponse>("/auth/profile", {
                        headers: {
                            Authorization: this.storage.getItem("token"),
                        },
                    })
                    .then((res) => {
                        // TODO: better error message api with language translations
                        if (res.status !== 200 && res.data.error) {
                            this.handleError(res.data.error.translation);
                            return reject(res);
                        }
                        resolve(res);
                    })
                    .catch((err: AxiosError) => {
                        this.handleError(
                            err.response?.data.error?.translation || err.message
                        );
                        reject(err);
                    });
            }
        );
    }
}
