import { Message, Prisma } from "@prisma/client";
import { useCallback, useMemo } from "react";
import { io, Socket } from "socket.io-client";

import { USER_INFO, QUERY_KEYS } from "../constants";
import { UserInfo } from "../types";
import { storage } from "../utils";

let socket: Socket;

export const useMessage = () => {
    const userInfo = storage.get<UserInfo>(USER_INFO) as UserInfo;
    const SERVER_URI = `${import.meta.env.VITE_SERVER_URI}${QUERY_KEYS.MESSAGE}`;

    if (!socket) {
        socket = io(SERVER_URI, {
            query: {
                userName: userInfo?.userName,
            },
        });
    }

    const send = useCallback(
        (payload: Prisma.MessageCreateInput | Prisma.MessageUncheckedCreateInput) => {
            socket.emit("message:post", payload);
            socket.on("message:post", (message: Message) => {
                storage.set<UserInfo>(USER_INFO, {
                    userName: message.userName.trim(),
                    userId: message.userId,
                });
            });
        },
        []
    );

    const update = useCallback(
        (payload: { id: Prisma.MessageWhereUniqueInput; message: Prisma.MessageUpdateInput }) => {
            socket.emit("message:put", payload);
        },
        []
    );

    const updateAvatar = useCallback((payload: { id: string; avatar: string }) => {
        socket.emit("avatar:put", payload);
    }, []);

    const updateLike = useCallback((payload: { userId: string; messageId: string }) => {
        socket.emit("like:put", payload);
    }, []);

    const remove = useCallback((payload: Prisma.MessageWhereUniqueInput) => {
        socket.emit("message:delete", payload);
    }, []);

    window.clearMessages = useCallback(() => {
        socket.emit("messages:clear");
        location.reload();
    }, []);

    const messageActions = useMemo(
        () => ({
            send,
            update,
            updateAvatar,
            updateLike,
            remove,
        }),
        []
    );

    return { socket, messageActions };
};
