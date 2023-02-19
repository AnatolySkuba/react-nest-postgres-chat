import axios from "axios";

export const saveToCloudinary = async (file: Blob) => {
    const CLOUDINARY_NAME = import.meta.env.VITE_CLOUDINARY_NAME;
    const CLOUDINARY_UPLOAD = import.meta.env.VITE_CLOUDINARY_UPLOAD;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD);
    formData.append("folder", "chat");
    const { data } = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/${
            file.type === "image/jpeg" ? "image" : "raw"
        }/upload`,
        formData
    );
    // console.log(77, data);
    //  загрузка файла https://res.cloudinary.com/dcdsexk67/raw/upload/fl_attachment/u5qwwl8kycpzhwihv78g.txt

    return data.secure_url;
};
