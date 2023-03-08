import { AuthInputs } from "./types";

export const USER_INFO = "user-info";

export const SUPPORTED_IMAGE_FORMATS = ["image/gif", "image/jpeg", "image/png"];
export const AUTH_INPUTS: AuthInputs = [
    { label: "User Name*", name: "userName", type: "text" },
    { label: "E-mail*", name: "email", type: "email" },
];

export const QUERY_KEYS = {
    MESSAGE: "message",
};
