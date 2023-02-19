import React, { useState } from "react";
import { FiEdit2, FiTrash } from "react-icons/fi";
import { BsArrowUp, BsArrowDown } from "react-icons/bs";

import { USER_INFO } from "../../constants";
import { useChat } from "../../hooks";
import { UserInfo } from "../../types";
import { storage } from "../../utils";

export const ChatScreen = () => {
    const userInfo = storage.get<UserInfo>(USER_INFO) as UserInfo;
    // const { userId, userName } = userInfo;

    const { messages, chatActions } = useChat();

    const [text, setText] = useState("");
    const [editingState, setEditingState] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState("");

    const changeText = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();

        const trimmed = text.trim();
        if (!trimmed) return;
        // const message = {
        //     userId,
        //     userName,
        //     text,
        // };

        if (editingState) {
            // chatActions.update({ id: editingMessageId, text });
            // setEditingState(false);
        } else {
            // chatActions.send(message);
        }

        setText("");
    };

    const dateFormatted = (date: Date) => {
        return `${date.toString().slice(2, 10).split("-").reverse().join(".")} at ${date
            .toString()
            .slice(11, 16)}`;
    };

    const removeMessage = (id: string) => {
        chatActions.remove({ id });
    };

    return (
        <div className="mx-auto max-w-2xl">
            {messages &&
                messages.length > 0 &&
                messages.map((message) => {
                    const userMessage = message.userId === userInfo?.userId;
                    return (
                        <div
                            key={message.id}
                            className={[
                                "my-2 rounded-md w-full",
                                userMessage ? "border border-green-100" : "border border-gray-100",
                                editingState ? "bg-gray-300" : "",
                            ].join(" ")}
                        >
                            <div
                                className={[
                                    "flex items-center p-1.5 justify-between",
                                    userMessage ? " bg-green-100" : " bg-gray-100",
                                    editingState ? "bg-gray-300" : "",
                                ].join(" ")}
                            >
                                <div className="flex items-center min-w-fit gap-3">
                                    <img
                                        className="w-8 h-8 border-2 border-white rounded-full bg-blue-300"
                                        src={message.avatar}
                                        alt="avatar"
                                    />
                                    <p className="self-start font-bold text-lg">
                                        {message.userName}
                                    </p>
                                    <p className="text-xs">{dateFormatted(message.createdAt)}</p>
                                </div>
                                <div className="flex justify-between w-full max-w-100">
                                    {userMessage && (
                                        <div className="flex gap-2 ml-2">
                                            <button
                                                disabled={editingState}
                                                className={`${editingState && "hidden"}`}
                                                onClick={() => {
                                                    setEditingState(true);
                                                    setEditingMessageId(message.id);
                                                    setText(message.text);
                                                }}
                                            >
                                                <FiEdit2 size="12" />
                                            </button>
                                            <button
                                                disabled={editingState}
                                                className={`${editingState && "hidden"}`}
                                                onClick={() => {
                                                    removeMessage(message.id);
                                                }}
                                            >
                                                <FiTrash size="12" />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <BsArrowUp size="12" />
                                        <p className=" text-xs">{messages.length}</p>
                                        <BsArrowDown size="12" />
                                    </div>
                                </div>
                            </div>
                            <p className="p-1.5">{message.text}</p>
                        </div>
                    );
                })}
        </div>
    );
};

// export default ChatScreen;
