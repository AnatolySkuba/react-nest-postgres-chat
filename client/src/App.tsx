import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { CommentList } from "./components/CommentList";
import "./App.css";

function App() {
    return (
        <div className="mx-auto p-3 max-w-2xl h-full overflow-auto">
            <CommentList />
            <ToastContainer newestOnTop={false} limit={3} />
        </div>
    );
}

export default App;
