import { Message, Prisma } from "@prisma/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

import { USER_INFO } from "../constants";
import { Log, UserInfo } from "../types";
import { storage } from "../utils";
import { notify } from "../utils/notify";

let socket: Socket;
let didInit = false;

export const useChat = () => {
    const userInfo = storage.get<UserInfo>(USER_INFO) as UserInfo;
    const SERVER_URI = import.meta.env.VITE_SERVER_URI;

    if (!socket) {
        socket = io(SERVER_URI, {
            query: {
                userName: userInfo?.userName,
            },
        });
    }

    const [messages, setMessages] = useState<Message[]>();

    useEffect(() => {
        if (!didInit) {
            didInit = true;
            // Only runs once per app load
            socket.on("log", (log: Log) => {
                notify(log);
            });
        }

        socket.on("messages", (messages: Message[]) => {
            setMessages(messages);
        });

        socket.emit("messages:get");
    }, []);

    const send = useCallback(
        (payload: Prisma.MessageCreateInput | Prisma.MessageUncheckedCreateInput) => {
            console.log(45, payload);
            socket.emit("message:post", payload);
            socket.on("message:post", (message: Message) => {
                console.log(48, message); ///////////////////////////////////
                storage.set<UserInfo>(USER_INFO, {
                    userName: message.userName.trim(),
                    userId: message.userId,
                });
            });
        },
        []
    );

    // const update = useCallback((payload: MessageUpdatePayload) => {
    //     socket.emit("message:put", payload);
    // }, []);

    const remove = useCallback((payload: Prisma.MessageWhereUniqueInput) => {
        socket.emit("message:delete", payload);
    }, []);

    window.clearMessages = useCallback(() => {
        socket.emit("messages:clear");
        location.reload();
    }, []);

    const chatActions = useMemo(
        () => ({
            send,
            // update,
            remove,
        }),
        []
    );

    return { messages, chatActions };
};
