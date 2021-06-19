import { toast } from "react-toastify";
import { PanelApi } from "@flowtr/panel-sdk";
import storage from "@plq/use-persisted-state/lib/storages/session-storage";
// import { createPersistedState } from "@plq/use-persisted-state";

export const handleError = (err?: string) => err && toast.dark(err);

export const api = new PanelApi(
    (import.meta.env.VITE_API || "http://localhost:8080").toString(),
    storage,
    handleError
);

/* const [usePersistedState] = createPersistedState("auth", storage);
export { usePersistedState };
 */
export { storage };
