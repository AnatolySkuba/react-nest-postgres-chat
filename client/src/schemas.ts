import * as Yup from "yup";
import { SUPPORTED_IMAGE_FORMATS } from "./constants";

const UserNameRegEx = /^[a-zA-Z0-9]+$/;
const HomePageRegEx = /^((http|https|ftp):\/\/).+/;
const TextRegEx =
    /^([^<]|(<code>.*<\/code>)|(<i>[^<]*<\/i>)|(<strong>[^<]*<\/strong>)|(<a href="[^"]*" title="[^"]*">[^<]*<\/a>))+$/;

export const formAuthorizedSchema = Yup.object({
    text: Yup.string()
        .matches(
            TextRegEx,
            "You can only use the following HTML tags:  <a href=”” title=””> </a> <code> </code> <i> </i> <strong> </strong>"
        )
        .required("Required"),
    file: Yup.mixed()
        .nullable()
        .test(
            "FILE_SIZE",
            "Uploaded file more than 100 kb.",
            (value: any) =>
                !value ||
                SUPPORTED_IMAGE_FORMATS.includes(value?.type) ||
                (value?.type === "text/plain" && value?.size < 100000)
        ),
});

export const formSchema = formAuthorizedSchema.shape({
    userName: Yup.string().matches(UserNameRegEx, "Letters and numbers only").required("Required"),
    email: Yup.string().email("Invalid email address").required("Required"),
    homePage: Yup.string().matches(HomePageRegEx, "URL format"),
    // captcha: Yup.string().required("Required"),
});
