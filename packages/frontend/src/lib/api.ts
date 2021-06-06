import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { ErrorResponse, PanelApi } from "@flowtr/panel-sdk";

export const handleError = (err?: string) => err && toast.dark(err);

export const api = new PanelApi(
    (import.meta.env.API || "http://localhost:8080").toString(),
    sessionStorage,
    handleError
);
