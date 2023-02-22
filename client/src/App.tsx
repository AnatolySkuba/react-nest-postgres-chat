import React, { useState } from "react";
import { Prisma } from "@prisma/client";
import { FaReply } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { CommentList } from "./components/CommentList";
import { CommentForm } from "./components/CommentForm";
import { useComment } from "./hooks";
import "./App.css";

function App() {
    const { comments, commentActions } = useComment();
    const [isReplying, setIsReplying] = useState(false);
    const rootComments = comments?.filter((comment) => comment.parentId === null);

    const onCommentReply = (
        comment: Prisma.CommentCreateInput | Prisma.CommentUncheckedCreateInput
    ) => {
        setIsReplying(false);
        commentActions.send(comment);
    };

    return (
        <div className="mx-auto p-3 max-w-2xl h-full overflow-auto">
            <button
                className={`icon-btn ${isReplying && "icon-btn-active"}`}
                onClick={() => setIsReplying((prev) => !prev)}
            >
                <FaReply size="12" />
            </button>
            {isReplying && <CommentForm onSubmit={onCommentReply} />}
            {rootComments && <CommentList comments={rootComments} />}
            <ToastContainer newestOnTop={false} limit={3} />
        </div>
    );
}

export default App;
