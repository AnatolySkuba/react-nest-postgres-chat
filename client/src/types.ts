import { Message } from "@prisma/client";

export type UserInfo = {
    userId: string;
    userName: string;
};

export type AuthInputs = Array<{
    label: string;
    name: "userName" | "email";
    type: string;
}>;

export type Log = {
    status: "info" | "success" | "error";
    message: string;
};

export type MessageWithChildren = Message & {
    children: Array<MessageWithChildren>;
};

export type MessageWithFiles = Message & { files: File[]; images: Image[]; likes: Like[] };

export type MessageWithReplies = MessageWithFiles & {
    getReplies: (parentId: string) => MessageWithFiles[];
};

export type File = {
    id?: string;
    fileName: string;
    filePath: string;
    publicId: string;
};

export type Image = {
    id?: string;
    largeURL: string;
    publicId: string;
    width: number;
    height: number;
};

export type Like = {
    userId: string;
    messageId: string;
};
