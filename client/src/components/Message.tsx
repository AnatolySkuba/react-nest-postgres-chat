import React, { useRef, useState } from "react";
import { Prisma } from "@prisma/client";
import { FaHeart, FaRegHeart, FaReply, FaTrash } from "react-icons/fa";
import { MdModeEdit } from "react-icons/md";
import TimeAgo from "react-timeago";

import { MessageForm } from "./MessageForm";
import { Gallery } from "./Gallery";
import { useMessage } from "../hooks";
import { UserInfo, MessageWithReplies } from "../types";
import { saveToCloudinary, storage } from "../utils";
import { USER_INFO } from "../constants";
import { MessageList } from "./MessageList";

export const Message = ({
    id,
    text,
    images,
    files,
    likes,
    userId,
    userName,
    avatar,
    parentId,
    createdAt,
    updatedAt,
    getReplies,
}: MessageWithReplies) => {
    const userInfo = storage.get<UserInfo>(USER_INFO) as UserInfo;
    const { messageActions } = useMessage();
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const userMessage = userId === userInfo?.userId;
    const childMessages = getReplies(id);
    const fileRef = useRef(null);
    const likedByMe = likes.some((like) => like.userId === userInfo?.userId);

    const onMessageReply = (
        message: Prisma.MessageCreateInput | Prisma.MessageUncheckedCreateInput
    ) => {
        setIsReplying(false);
        messageActions.send({ ...message, parentId: id });
    };

    const onMessageUpdate = (
        message: Prisma.MessageUpdateInput | Prisma.MessageUncheckedCreateInput
    ) => {
        message = { ...message, parentId };
        setIsEditing(false);
        messageActions.update({ id: { id }, message });
    };

    const onMessageDelete = () => {
        messageActions.remove({ id });
    };

    const imageChangedHandler = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        if (!e.currentTarget.files) return;
        const file = e.currentTarget.files[0];
        const imageSaved = await saveToCloudinary(file);
        "largeURL" in imageSaved &&
            messageActions.updateAvatar({ id: userId, avatar: imageSaved.largeURL });
    };

    const onToggleLike = () => {
        userInfo?.userId && messageActions.updateLike({ userId: userInfo?.userId, messageId: id });
    };

    return (
        <div className="">
            <div
                className={`my-2 rounded-md w-full border ${
                    userMessage ? "border-green-100" : "border-gray-100"
                }`}
            >
                <div
                    className={`flex items-center p-1.5 justify-between ${
                        userMessage ? "bg-green-100" : "bg-gray-100"
                    }`}
                >
                    <div className="flex items-center min-w-fit gap-3">
                        {userMessage ? (
                            <>
                                <label htmlFor="image-upload" className="flex flex-col mx-2">
                                    <img
                                        className="w-8 h-8 border-2 border-white rounded-full bg-blue-300 cursor-pointer"
                                        src={avatar}
                                        alt="avatar"
                                    />
                                </label>
                                <input
                                    className="hidden"
                                    type="file"
                                    id="image-upload"
                                    accept=".jpg,.gif,.png"
                                    ref={fileRef}
                                    onChange={imageChangedHandler}
                                />
                            </>
                        ) : (
                            <img
                                className="w-8 h-8 border-2 border-white rounded-full bg-blue-300"
                                src={avatar}
                                alt="avatar"
                            />
                        )}
                        <p className="self-start font-bold text-lg">{userName}</p>
                        <p className="text-xs">{updatedAt !== createdAt ? "updated" : "created"}</p>
                        <TimeAgo className="text-xs" date={updatedAt} />
                    </div>
                    <div className="flex gap-2">
                        <button
                            className={`mx-2 icon-btn ${isReplying && "icon-btn-active"}`}
                            onClick={() => setIsReplying((prev) => !prev)}
                        >
                            <FaReply size="12" />
                        </button>
                        <button
                            className={`flex items-center gap-2 mx-2 icon-btn `}
                            onClick={() => onToggleLike()}
                        >
                            {likedByMe ? <FaHeart size="12" /> : <FaRegHeart size="12" />}
                            {likes.length}
                        </button>
                        {userMessage && (
                            <div className="flex gap-2">
                                <button
                                    className={`icon-btn ${isEditing && "icon-btn-active"}`}
                                    onClick={() => setIsEditing((prev) => !prev)}
                                >
                                    <MdModeEdit size="14" />
                                </button>
                                <button
                                    className="text-red-500 hover:text-red-400"
                                    onClick={() => {
                                        onMessageDelete();
                                    }}
                                >
                                    <FaTrash size="12" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {isEditing ? (
                    <MessageForm
                        initialValue={text}
                        oldFiles={files}
                        oldImages={images}
                        onSubmit={onMessageUpdate}
                    />
                ) : (
                    <p className="p-1.5">{text}</p>
                )}
                {!isEditing &&
                    files?.length > 0 &&
                    files.map((file, index) => (
                        <div key={index}>
                            <a href={file.filePath} className="text-blue-500">
                                {file.fileName}.txt
                            </a>
                        </div>
                    ))}
                {!isEditing && images?.length > 0 && (
                    <Gallery galleryID={`gallery-${new Date().getTime()}`} images={images} />
                )}
            </div>
            {isReplying && <MessageForm onSubmit={onMessageReply} />}

            {childMessages?.length > 0 && (
                <div className="pl-6">
                    <MessageList messages={childMessages} getReplies={getReplies} />
                </div>
            )}
        </div>
    );
};
