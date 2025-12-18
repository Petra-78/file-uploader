import { body } from "express-validator";
import prisma from "../lib/prisma.js";

const signupValidator = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Email must be valid")
    .custom(async (value) => {
      const user = await prisma.users.findUnique({
        where: { email: value },
        select: { id: true },
      });

      if (user) {
        throw new Error("Account with this email already exists");
      }

      return true;
    }),

  body("username")
    .trim()
    .isLength({ max: 20 })
    .withMessage("Username must be max 20 characters long")
    .custom(async (value) => {
      const user = await prisma.users.findUnique({
        where: { username: value },
        select: { id: true },
      });

      if (user) {
        throw new Error("Account with this username already exists");
      }

      return true;
    }),

  body("password")
    .trim()
    .isLength({ min: 5, max: 16 })
    .withMessage("Password must be 5–16 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must contain at least one special character"),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];

export { signupValidator };
