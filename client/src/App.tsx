import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ChatScreen, Form } from "./components";
import "./App.css";

function App() {
    return (
        <div className="p-3">
            <ChatScreen />
            <Form />
            <ToastContainer newestOnTop={false} limit={3} />
        </div>
    );
}

export default App;
