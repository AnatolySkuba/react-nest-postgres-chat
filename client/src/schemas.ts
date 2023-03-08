import * as Yup from "yup";

const UserNameRegEx = /^[a-zA-Z0-9]+$/;

export const formSchema = Yup.object({
    userName: Yup.string().matches(UserNameRegEx, "Letters and numbers only").required("Required"),
    email: Yup.string().email("Invalid email address").required("Required"),
});
