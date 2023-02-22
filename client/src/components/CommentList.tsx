import React from "react";
import { Comment as IComment } from "@prisma/client";

import { Comment } from "./Comment";

export const CommentList = ({ comments }: { comments: IComment[] }) => {
    return (
        <>
            {comments?.map((comment) => {
                return <Comment key={comment.id} {...comment} />;
            })}
        </>
    );
};
