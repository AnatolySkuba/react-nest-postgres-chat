import { useState, useEffect, FocusEventHandler } from "react";
import { FormikTouched, FormikErrors } from "formik";

import { useCanvas } from "../../hooks";
import sprite from "../../assets/sprite.svg";
import { notify } from "../../utils";

type Props = {
    formik: {
        initialValues: {
            userName: string;
            email: string;
            homePage: string;
            text: string;
            captcha: string;
        };
        values: any;
        touched: FormikTouched<{ [captcha: string]: any }>;
        errors: FormikErrors<{ [captcha: string]: string[] }>;
        handleBlur: FocusEventHandler<HTMLInputElement> | undefined;
    };
    captcha: {
        inputCaptcha: string;
        isCaptcha: boolean;
    };
    setCaptcha: React.Dispatch<
        React.SetStateAction<{
            inputCaptcha: string;
            isCaptcha: boolean;
        }>
    >;
};

export const Captcha = ({ formik, captcha, setCaptcha }: Props): JSX.Element => {
    const [ctx, setCtx] = useState<any>();
    const [text, setText] = useState("");
    const [showRequired, setShowRequired] = useState(false);

    useEffect(() => {
        triggerFunction();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ctx]);

    const randomNumber = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    useEffect(() => {
        formik.touched.captcha &&
            setTimeout(() => {
                setShowRequired(true);
            }, 100);
    }, [formik.touched.captcha]);

    const textGenerator = () => {
        let generatedText = "";
        for (let i = 0; i < 3; i++) {
            generatedText += String.fromCharCode(randomNumber(65, 90));
            generatedText += String.fromCharCode(randomNumber(97, 122));
            generatedText += String.fromCharCode(randomNumber(48, 57));
        }
        return generatedText;
    };

    const triggerFunction = () => {
        setCaptcha((prevState) => ({
            ...prevState,
            inputCaptcha: "",
        }));
        let text = textGenerator();
        text = [...text].sort(() => Math.random() - 0.5).join("");
        setText(text);
        if (ctx) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            const textColors = ["rgb(0,0,0)", "rgb(130,130,130)"];
            const letterSpace = 150 / text.length;
            for (let i = 0; i < text.length; i++) {
                const xInitialSpace = 25;
                ctx.font = "20px Roboto Mono";
                ctx.fillStyle = textColors[randomNumber(0, 1)];
                ctx.fillText(text[i], xInitialSpace + i * letterSpace, randomNumber(25, 40), 100);
            }
        }
    };

    const canvasRef = useCanvas(([_canvas, ctx]: any) => {
        setCtx(ctx);
        triggerFunction();
    });

    const submitCaptcha = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        if (captcha.inputCaptcha === text) {
            notify({ status: "success", message: "Success" });
            formik.values.captcha = text;
            setCaptcha((prevState) => ({
                ...prevState,
                isCaptcha: true,
            }));
        } else {
            notify({ status: "error", message: "Incorrect" });
            triggerFunction();
        }
    };

    return (
        <div className="my-3.5 min-w-72 max-w-xs h-44 p-2.5 shadow-md rounded-lg">
            <div className="flex mb-3">
                <canvas
                    className="border border-gray-400 rounded"
                    ref={canvasRef}
                    width="192"
                    height="48"
                ></canvas>
                <button
                    className="mx-auto h-12 bg-green-600 p-3 rounded-full"
                    onClick={triggerFunction}
                    type="button"
                >
                    <svg className="w-6 h-6">
                        <use href={sprite + "#rotate-right"}></use>
                    </svg>
                </button>
            </div>
            <input
                className="input w-48"
                type="text"
                name="captcha"
                value={captcha.inputCaptcha}
                onBlur={formik.handleBlur}
                onChange={(e) =>
                    setCaptcha((prevState) => ({
                        ...prevState,
                        inputCaptcha: e.target.value,
                    }))
                }
                placeholder="Enter text in the image*"
            />
            {showRequired && !captcha.isCaptcha ? (
                <p className="input-error">{formik.errors.captcha}</p>
            ) : null}
            <button className="btn mt-2 w-36" type="button" onClick={submitCaptcha}>
                Submit
            </button>
        </div>
    );
};
