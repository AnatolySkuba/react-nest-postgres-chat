import { toast } from "react-toastify";

import { Log } from "../types";

export const notify = (log: Log) => {
    return toast[log.status](log.message, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        rtl: false,
        pauseOnFocusLoss: true,
        draggablePercent: 60,
        pauseOnHover: true,
    });
};
