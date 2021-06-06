import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { ErrorResponse } from "../../../sdk/dist/api.js";

// TODO: move client-side api to sdk
export const api = axios.create({
    baseURL: (import.meta.env.API || "http://localhost:8080").toString(),
});

export const handleError = <T extends ErrorResponse = ErrorResponse>(
    err: AxiosError<ErrorResponse>
) => toast.dark(err.response?.data.error?.translation || err.message);
