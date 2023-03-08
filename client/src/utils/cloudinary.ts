import axios from "axios";
import { sha1 } from "crypto-hash";

import { File, Image } from "../types";

export const saveToCloudinary = async (file: Blob): Promise<File | Image> => {
    const CLOUDINARY_NAME: string = import.meta.env.VITE_CLOUDINARY_NAME;
    const CLOUDINARY_UPLOAD: string = import.meta.env.VITE_CLOUDINARY_UPLOAD;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD);
    formData.append("folder", "react-nest-postgres-messages");
    const { data } = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/${
            file.type === "image/jpeg" ? "image" : "raw"
        }/upload`,
        formData
    );

    if (data.resource_type === "raw") {
        return {
            fileName: data.original_filename,
            filePath: `https://res.cloudinary.com/${CLOUDINARY_NAME}/raw/upload/fl_attachment/${data.public_id}`,
            publicId: data.public_id,
        };
    }

    return {
        largeURL: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
    };
};

export const deleteFromCloudinary = async (file: File | Image): Promise<void> => {
    const CLOUDINARY_NAME: string = import.meta.env.VITE_CLOUDINARY_NAME;
    const CLOUDINARY_API_KEY: string = import.meta.env.VITE_CLOUDINARY_API_KEY;
    const CLOUDINARY_API_SECRET: string = import.meta.env.VITE_CLOUDINARY_API_SECRET;

    const timestamp = new Date().getTime();
    const string = `public_id=${file.publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const signature = await sha1(string);

    const formData = new FormData();
    formData.append("public_id", file.publicId);
    formData.append("signature", signature);
    formData.append("api_key", CLOUDINARY_API_KEY);
    formData.append("timestamp", timestamp.toString());
    await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/${
            "largeURL" in file ? "image" : "raw"
        }/destroy`,
        formData
    );
};
