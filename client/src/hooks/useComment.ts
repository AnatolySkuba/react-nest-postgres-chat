import { Comment, Prisma } from "@prisma/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

import { USER_INFO } from "../constants";
import { Log, UserInfo } from "../types";
import { storage } from "../utils";
import { notify } from "../utils/notify";

let socket: Socket;
let didInit = false;

export const useComment = () => {
    const userInfo = storage.get<UserInfo>(USER_INFO) as UserInfo;
    const SERVER_URI = import.meta.env.VITE_SERVER_URI;

    if (!socket) {
        socket = io(SERVER_URI, {
            query: {
                userName: userInfo?.userName,
            },
        });
    }

    const [comments, setComments] = useState<Comment[]>();

    useEffect(() => {
        if (!didInit) {
            didInit = true;
            // Only runs once per app load
            socket.on("log", (log: Log) => {
                notify(log);
            });
        }

        socket.on("messages", (messages: Comment[]) => {
            setComments(messages);
        });

        socket.emit("messages:get");
    }, []);

    const send = useCallback(
        (payload: Prisma.CommentCreateInput | Prisma.CommentUncheckedCreateInput) => {
            socket.emit("message:post", payload);
            socket.on("message:post", (message: Comment) => {
                console.log(48, message); ///////////////////////////////////
                storage.set<UserInfo>(USER_INFO, {
                    userName: message.userName.trim(),
                    userId: message.userId,
                });
            });
        },
        []
    );

    const update = useCallback((payload: Prisma.CommentUpdateInput) => {
        socket.emit("message:put", payload);
    }, []);

    const remove = useCallback((payload: Prisma.CommentWhereUniqueInput) => {
        socket.emit("message:delete", payload);
    }, []);

    window.clearMessages = useCallback(() => {
        socket.emit("messages:clear");
        location.reload();
    }, []);

    const commentActions = useMemo(
        () => ({
            send,
            update,
            remove,
        }),
        []
    );

    return { comments, commentActions };
};
