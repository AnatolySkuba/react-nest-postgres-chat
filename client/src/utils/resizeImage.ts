import { FormikErrors, FormikTouched } from "formik";
import { SetStateAction } from "react";

export const resizeImage = (
    file: File,
    maxWidth: number,
    maxHeight: number,
    setImageSrc: { (value: SetStateAction<string>): void; (arg0: string): void },
    formik: {
        setFieldValue(arg0: string, blob: Blob): void;
        initialValues: {
            userName: string;
            email: string;
            homePage: string;
            text: string;
            file: null;
            image: null;
            captcha: string;
        };
        initialErrors: FormikErrors<unknown>;
        initialTouched: FormikTouched<unknown>;
    }
) => {
    const image = new Image();
    image.src = URL.createObjectURL(file);

    image.onload = () => {
        const width = image.width,
            height = image.height;

        let newWidth, newHeight;

        if (width <= maxWidth && height <= maxHeight) {
            newWidth = width;
            newHeight = height;
        } else {
            if (width > height && width / height > maxWidth / maxHeight) {
                newHeight = height * (maxWidth / width);
                newWidth = maxWidth;
            } else {
                newWidth = width * (maxHeight / height);
                newHeight = maxHeight;
            }
        }

        const canvas = document.createElement("canvas");
        canvas.width = newWidth;
        canvas.height = newHeight;

        const context = canvas.getContext("2d");
        context?.drawImage(image, 0, 0, newWidth, newHeight);

        canvas.toBlob(function (blob) {
            if (!blob) return;
            const newImg = document.createElement("img"),
                url = URL.createObjectURL(blob);

            newImg.onload = function () {
                // no more reading blob, so it's canceled
                URL.revokeObjectURL(url);
            };
            setImageSrc(url);
            formik.setFieldValue("image", blob);
        }, file.type);
    };
};
