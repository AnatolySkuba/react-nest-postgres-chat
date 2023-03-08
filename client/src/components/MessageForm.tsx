import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import { AvatarGenerator } from "random-avatar-generator";
import { Prisma } from "@prisma/client";
import { FaTrash } from "react-icons/fa";
import { RiSendPlaneFill } from "react-icons/ri";
import { MdAdd } from "react-icons/md";

import { Gallery } from "./Gallery";
import { useAutoSizeTextArea } from "../hooks";
import { deleteFromCloudinary, saveToCloudinary, storage } from "../utils";
import { SUPPORTED_IMAGE_FORMATS, AUTH_INPUTS, USER_INFO } from "../constants";
import { UserInfo, Image, File } from "../types";
import { formSchema } from "../schemas";
import sprite from "../assets/sprite.svg";

export const MessageForm = ({
    onSubmit,
    initialValue = "",
    oldFiles,
    oldImages,
}: {
    onSubmit: (message: Prisma.MessageCreateInput | Prisma.MessageUncheckedCreateInput) => void;
    initialValue?: string;
    oldFiles?: File[];
    oldImages?: Image[];
}): JSX.Element => {
    const userInfo = storage.get<UserInfo>(USER_INFO) as UserInfo;
    const [value, setValue] = useState("");
    const [images, setImages] = useState<Array<Image>>([]);
    const [files, setFiles] = useState<Array<File>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const textAreaRef = useRef(null);
    const fileRef = useRef(null);
    const generator = new AvatarGenerator();
    let didInit = false;

    useEffect(() => {
        if (!didInit) {
            didInit = true;
            // Only runs once per app load
            oldFiles?.forEach((oldFile) => delete oldFile.id);
            oldImages?.forEach((oldImage) => delete oldImage.id);
            oldFiles && setFiles((prev) => [...prev, ...oldFiles]);
            oldImages && setImages((prev) => [...prev, ...oldImages]);
        }
    }, []);

    useAutoSizeTextArea(textAreaRef.current, value);

    const formik = useFormik({
        initialValues: {
            userName: "",
            email: "",
            text: initialValue,
            file: null,
            image: null,
        },
        validationSchema: !userInfo && formSchema,
        onSubmit: async ({ userName, text, email }) => {
            formik.resetForm();

            const payload = {
                text,
                files: {
                    createMany: { data: files },
                },
                images: {
                    createMany: { data: images },
                },
            };

            onSubmit(
                userInfo
                    ? {
                          ...payload,
                          userId: userInfo.userId,
                          userName: userInfo.userName,
                          avatar: "",
                      }
                    : {
                          ...payload,
                          user: {
                              create: {
                                  userName,
                                  email,
                                  avatar: generator.generateRandomAvatar(),
                              },
                          },
                      }
            );
            setImages([]), setFiles([]);
        },
    });

    const handleOnChange = ({ target }: React.ChangeEvent<HTMLFormElement>): void => {
        target.localName === "textarea" && setValue(target.defaultValue);
    };

    const fileChangedHandler = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        setIsLoading(true);
        if (!e.currentTarget.files) return;
        const file = e.currentTarget.files[0];

        if (SUPPORTED_IMAGE_FORMATS.includes(file?.type)) {
            const imageSaved = await saveToCloudinary(file);
            "largeURL" in imageSaved && setImages((prev) => [...prev, imageSaved]);
        } else {
            const fileSaved = await saveToCloudinary(file);
            "fileName" in fileSaved && setFiles((prev) => [...prev, fileSaved]);
        }
        setIsLoading(false);
    };

    const onDeleteFile = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
        fileForDelete: File
    ) => {
        e.preventDefault();
        setFiles((prev) => prev.filter((file) => file !== fileForDelete));
        deleteFromCloudinary(fileForDelete);
    };

    const onDeleteImage = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
        imageForDelete: Image
    ) => {
        e.preventDefault();
        setImages((prev) => prev.filter((image) => image !== imageForDelete));
        deleteFromCloudinary(imageForDelete);
    };

    return (
        <form
            onSubmit={formik.handleSubmit}
            onChange={handleOnChange}
            className="mx-auto max-w-3xl"
        >
            {!userInfo && (
                <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
                    <div>
                        {AUTH_INPUTS.map(({ label, name, type }, index) => {
                            return (
                                <label key={index} className="flex flex-col">
                                    {label}
                                    <input
                                        className="input flex-1"
                                        type={type}
                                        name={name}
                                        value={formik.values[name]}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.touched[name] && formik.errors[name] ? (
                                        <p className="input-error">{formik.errors[name]}</p>
                                    ) : null}
                                </label>
                            );
                        })}
                    </div>
                </div>
            )}
            <div className="flex items-center mt-4 min-w-full max-w-2xl">
                <textarea
                    className="input block p-1 max-w-2xl"
                    name="text"
                    ref={textAreaRef}
                    value={formik.values.text}
                    onChange={formik.handleChange}
                />
                <label htmlFor="file-upload" className="flex flex-col mx-2">
                    <div className="flex">
                        {isLoading ? (
                            <svg width="20" height="20" className="animate-spin fill-green-500">
                                <use href={sprite + "#spinner"}></use>
                            </svg>
                        ) : (
                            <div className="p-1.5 h-max transition-colors rounded-full bg-green-500 border text-white hover:bg-green-600 cursor-pointer">
                                <MdAdd />
                            </div>
                        )}
                    </div>
                </label>
                <input
                    className="hidden"
                    type="file"
                    id="file-upload"
                    accept=".txt,.jpg,.gif,.png"
                    ref={fileRef}
                    onChange={fileChangedHandler}
                />
                <button
                    type="submit"
                    className="p-1.5 h-max transition-colors rounded-full bg-green-500 border text-white hover:bg-green-600 "
                >
                    <RiSendPlaneFill />
                </button>
            </div>
            {files?.map((file, index: number) => (
                <div key={index} className="flex ">
                    <a href={file.filePath} className="text-blue-500">
                        {file.fileName}.txt
                    </a>
                    <button className="ml-2" onClick={(e) => onDeleteFile(e, file)}>
                        <FaTrash size="10" className="text-red-500" />
                    </button>
                </div>
            ))}
            {images && (
                <Gallery
                    galleryID={`gallery-${new Date().getTime()}`}
                    onDeleteImage={onDeleteImage}
                    images={images}
                />
            )}
        </form>
    );
};
