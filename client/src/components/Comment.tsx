import React, { useState } from "react";
import { Comment as IComment, Prisma } from "@prisma/client";
import { BsArrowUp, BsArrowDown } from "react-icons/bs";
import { FaHeart, FaRegHeart, FaReply, FaTrash } from "react-icons/fa";
import { MdModeEdit } from "react-icons/md";

import { CommentForm } from "./CommentForm";
import { useComment } from "../hooks";
import { UserInfo } from "../types";
import { storage } from "../utils";
import { USER_INFO } from "../constants";

export const Comment = ({
    id,
    text,
    file,
    image,
    userId,
    userName,
    avatar,
    homePage,
    parentId,
    createdAt,
    updatedAt,
}: IComment) => {
    const userInfo = storage.get<UserInfo>(USER_INFO) as UserInfo;
    const { commentActions } = useComment();
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const userComment = userId === userInfo?.userId;

    const onCommentReply = (
        comment: Prisma.CommentCreateInput | Prisma.CommentUncheckedCreateInput
    ) => {
        // if (userInfo) comment = { ...comment, parentId: id };
        // if (!userInfo) {
        //     comment = {
        //         ...comment,
        //         parent: {
        //             connect: {
        //                 id,
        //             },
        //         },
        //     };
        // }
        setIsReplying(false);
        commentActions.send({ ...comment, parentId: id });
    };

    const onCommentUpdate = (
        comment: Prisma.CommentCreateInput | Prisma.CommentUncheckedCreateInput
    ) => {
        const { text, file, image } = comment;
        setIsEditing(false);
        commentActions.update({ id, text, file, image });
    };

    const removeComment = (id: string) => {
        commentActions.remove({ id });
    };

    const dateFormatter = (date: Date) => {
        return `${date.toString().slice(2, 10).split("-").reverse().join(".")} at ${date
            .toString()
            .slice(11, 16)}`;
    };

    return (
        <div className={`${parentId && "pl-5"}`}>
            <div
                className={`my-2 rounded-md w-full border ${
                    userComment ? "border-green-100" : "border-gray-100"
                }`}
            >
                <div
                    className={`flex items-center p-1.5 justify-between ${
                        userComment ? "bg-green-100" : "bg-gray-100"
                    }`}
                >
                    <div className="flex items-center min-w-fit gap-3">
                        <img
                            className="w-8 h-8 border-2 border-white rounded-full bg-blue-300"
                            src={avatar}
                            alt="avatar"
                        />
                        <p className="self-start font-bold text-lg">{userName}</p>
                        <p className="text-xs">{dateFormatter(createdAt)}</p>
                    </div>
                    <div
                        className={`flex w-full max-w-120 ${
                            userComment ? "justify-between" : "justify-end"
                        }`}
                    >
                        <button
                            className={`mx-2 icon-btn ${isReplying && "icon-btn-active"}`}
                            onClick={() => setIsReplying((prev) => !prev)}
                        >
                            <FaReply size="12" />
                        </button>
                        {userComment && (
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
                                        removeComment(id);
                                    }}
                                >
                                    <FaTrash size="12" />
                                </button>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <BsArrowUp size="12" />
                            {/* <p className=" text-xs">{comments.length}</p> */}
                            <BsArrowDown size="12" />
                        </div>
                    </div>
                </div>
                {isEditing ? (
                    <CommentForm initialValue={text} onSubmit={onCommentUpdate} />
                ) : (
                    <p className="p-1.5">{text}</p>
                )}
            </div>
            {isReplying && <CommentForm onSubmit={onCommentReply} />}
        </div>
    );
};
