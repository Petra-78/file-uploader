import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import { prisma } from "../lib/prisma.js";

export function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}

export async function signUp(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("index", { errors: errors.array() });
  }

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = await prisma.users.create({
      data: {
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
      },
    });

    console.log("NEW USER:", newUser);

    req.login(newUser, (err) => {
      if (err) return next(err);
      return res.redirect("/");
    });
  } catch (err) {
    if (err.code === "P2002") {
      const field = err.meta?.target?.join(", ");
      return res.status(409).render("index", {
        errors: [{ msg: `${field} already exists.` }],
      });
    }
    return next(err);
  }
}
