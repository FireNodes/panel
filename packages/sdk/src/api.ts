import { IUser } from "./schema/user";

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
        translation: "Not Logged In",
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
