import { Schema } from "express-validator";

export const validationSignInSchema: Schema = {
  username: {
    optional: false,
    isString: true,
    errorMessage: "username must be a string and not empty",
  },
  password: {
    optional: false,
    isString: true,
    errorMessage: "password must be a string and not empty",
  },
};
