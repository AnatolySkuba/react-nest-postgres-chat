import React, { useEffect, useRef } from "react";

import { Message } from "./Message";
import { MessageWithFiles } from "../types";

export const MessageList = ({
    messages,
    getReplies,
}: {
    messages: MessageWithFiles[];
    getReplies: (parentId: string) => MessageWithFiles[];
}) => {
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <>
            {messages?.map((message) => (
                <Message key={message.id} {...message} getReplies={getReplies} />
            ))}
            <div ref={messagesEndRef} />
        </>
    );
};
