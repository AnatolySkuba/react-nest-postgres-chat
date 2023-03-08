import React, { useEffect, useMemo, useState } from "react";
import { Prisma } from "@prisma/client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { MessageList } from "./components/MessageList";
import { MessageForm } from "./components/MessageForm";
import { useMessage } from "./hooks";
import { notify } from "./utils";
import { MessageWithFiles, Log } from "./types";
import "./App.css";

let didInit = false;

function App() {
    const { socket, messageActions } = useMessage();
    const [messages, setMessages] = useState<MessageWithFiles[]>();
    const rootMessages = messages?.filter((message) => message.parentId === null);

    useEffect(() => {
        if (!didInit) {
            didInit = true;
            // Only runs once per app load
            socket.on("log", (log: Log) => {
                notify(log);
            });

            socket.emit("messages:get");
            socket.on("messages", (messages: MessageWithFiles[]) => {
                messages && setMessages(messages);
            });
        }
    }, []);

    const messagesByParentId = useMemo(() => {
        interface IGroup {
            [name: string]: MessageWithFiles[];
        }
        const group: IGroup = {};
        messages?.forEach((message) => {
            if (typeof message.parentId === "string") {
                group[message.parentId] ||= [];
                group[message.parentId].push(message);
            }
        });
        return group;
    }, [messages]);

    function getReplies(parentId: string) {
        return messagesByParentId[parentId];
    }

    const onMessageReply = (
        message: Prisma.MessageCreateInput | Prisma.MessageUncheckedCreateInput
    ) => {
        messageActions.send(message);
    };

    return (
        <>
            <div className="mx-auto p-3 max-w-2xl h-screen grid">
                <div className="overflow-auto">
                    {rootMessages && (
                        <MessageList messages={rootMessages} getReplies={getReplies} />
                    )}
                </div>
                <div className="self-end">
                    <MessageForm onSubmit={onMessageReply} />
                </div>
            </div>
            <ToastContainer newestOnTop={false} limit={3} />
        </>
    );
}

export default App;
