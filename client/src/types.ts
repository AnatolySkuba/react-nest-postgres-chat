import { Comment } from "@prisma/client";

export type UserInfo = {
    userId: string;
    userName: string;
};

export type AuthInputs = Array<{
    label: string;
    name: "userName" | "email" | "homePage";
    type: string;
}>;

export type Log = {
    status: "info" | "success" | "error";
    message: string;
};

export type CommentWithChildren = Comment & {
    children: Array<CommentWithChildren>;
};
