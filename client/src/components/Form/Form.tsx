import React, { useRef, useState } from "react";
import { useFormik } from "formik";
import { AvatarGenerator } from "random-avatar-generator";

import { useChat, useAutoSizeTextArea } from "../../hooks";
import { resizeImage, saveToCloudinary, storage } from "../../utils";
import { Captcha } from "../Captcha";
import { TAGS, SUPPORTED_IMAGE_FORMATS, AUTH_INPUTS, USER_INFO } from "../../constants";
import { UserInfo } from "../../types";
import { formSchema, formAuthorizedSchema } from "../../schemas";

export const Form = (): JSX.Element => {
    const userInfo = storage.get<UserInfo>(USER_INFO) as UserInfo;
    const [value, setValue] = useState("");
    const [imageSrc, setImageSrc] = useState("");
    const [captcha, setCaptcha] = useState({ inputCaptcha: "", isCaptcha: false });
    const textAreaRef = useRef(null);
    const fileRef = useRef(null);
    const { chatActions } = useChat();
    const generator = new AvatarGenerator();

    useAutoSizeTextArea(textAreaRef.current, value);

    const formik = useFormik({
        initialValues: {
            userName: "",
            email: "",
            homePage: "",
            text: "",
            file: null,
            image: null,
            captcha: "",
        },
        validationSchema: userInfo ? formAuthorizedSchema : formSchema,
        onSubmit: async ({ userName, text, homePage, file, image, email }) => {
            formik.resetForm();
            setCaptcha({ inputCaptcha: "", isCaptcha: false });
            console.log(38, { userName, text, homePage, file, image, email });
            if (image) image = await saveToCloudinary(image);
            if (file) file = await saveToCloudinary(file);

            chatActions.send(
                userInfo
                    ? {
                          text,
                          file,
                          image,
                          userId: userInfo.userId,
                          userName: userInfo.userName,
                          homePage,
                          avatar: "",
                      }
                    : {
                          text,
                          file,
                          image,
                          user: {
                              create: {
                                  userName,
                                  email,
                                  avatar: generator.generateRandomAvatar(),
                                  homePage,
                              },
                          },
                      }
            );
        },
    });

    const addTag = ({ currentTarget }: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
        const tag = currentTarget.textContent?.slice(1, -1);
        formik.setFieldValue(
            "text",
            formik.values.text +
                (tag === "a" ? `<${tag} href="" title=""></${tag}>` : `<${tag}></${tag}>`)
        );
    };

    const handleOnChange = ({ target }: React.ChangeEvent<HTMLFormElement>): void => {
        target.localName === "textarea" && setValue(target.defaultValue);
    };

    const fileChangedHandler = (e: React.ChangeEvent<HTMLInputElement>): void => {
        if (!e.currentTarget.files) return;
        const file = e.currentTarget.files[0];

        SUPPORTED_IMAGE_FORMATS.includes(file?.type)
            ? resizeImage(file, 320, 240, setImageSrc, formik)
            : formik.setFieldValue("file", file);
    };

    return (
        <form
            onSubmit={formik.handleSubmit}
            onChange={handleOnChange}
            className="mx-auto max-w-2xl"
        >
            <div className="relative">
                <label>
                    Text*
                    <div className="absolute top-0 right-2">
                        {TAGS.map((tag, index) => (
                            <button key={index} type="button" onClick={addTag} className="mx-1">
                                [{tag}]
                            </button>
                        ))}
                    </div>
                    <textarea
                        className="input block max-w-none"
                        name="text"
                        ref={textAreaRef}
                        value={formik.values.text}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                    {formik.touched.text && formik.errors.text ? (
                        <p className="input-error">{formik.errors.text}</p>
                    ) : null}
                </label>
            </div>
            {!userInfo && (
                <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
                    <div>
                        {AUTH_INPUTS.map(({ label, name, type }, index) => {
                            return (
                                <label key={index} className="flex flex-col mt-2">
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
                    <Captcha formik={formik} captcha={captcha} setCaptcha={setCaptcha} />
                </div>
            )}
            <label className="flex flex-col mt-2">
                Upload File
                <input
                    type="file"
                    accept=".txt,.jpg,.gif,.png"
                    ref={fileRef}
                    onChange={fileChangedHandler}
                />
            </label>
            {formik.errors.file ? <p>{formik.errors.file}</p> : null}
            <button type="submit" className="btn my-4">
                Add comment
            </button>
            {imageSrc && <img src={imageSrc} alt="preview" />}
        </form>
    );
};
