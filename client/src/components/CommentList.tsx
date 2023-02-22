import React, { useState } from "react";
import { Prisma } from "@prisma/client";
import { FaReply } from "react-icons/fa";

import { Comment } from "./Comment";
import { CommentForm } from "./CommentForm";
import { useComment } from "../hooks";

export const CommentList = () => {
    const { comments, commentActions } = useComment();
    const [isReplying, setIsReplying] = useState(false);

    const onCommentReply = (
        comment: Prisma.CommentCreateInput | Prisma.CommentUncheckedCreateInput
    ) => {
        setIsReplying(false);
        commentActions.send(comment);
    };

    return (
        <>
            <button
                className={`icon-btn ${isReplying && "icon-btn-active"}`}
                onClick={() => setIsReplying((prev) => !prev)}
            >
                <FaReply size="12" />
            </button>
            {isReplying && <CommentForm onSubmit={onCommentReply} />}
            {comments?.map((comment) => {
                return <Comment key={comment.id} {...comment} />;
            })}
        </>
    );
};
