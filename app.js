import path from "node:path";
import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import "./config/passport.js";
import { fileURLToPath } from "node:url";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { prisma } from "./lib/prisma.js";

import indexRouter from "./routes/indexRouter.js";
import loginRouter from "./routes/loginRouter.js";
import folderRouter from "./routes/folderRouter.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SECRET_SESSION || "cats",
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(
  "/web_modules",
  express.static(path.join(process.cwd(), "node_modules"))
);

app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.errors = [];
  res.locals.folders = [];
  res.locals.currentFolder = null;
  next();
});

app.use("/", indexRouter);
app.use("/", folderRouter);
app.use("/login", loginRouter);
app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.use((req, res, next) => {
  const err = new Error("Page not found");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).render("error", {
    status: err.status || 500,
    title: err.status === 403 ? "Access denied" : "Server error",
    message: err.message || "Something went wrong. Please try again later.",
  });
});

app.listen(process.env.PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`app listening on port ${process.env.PORT}!`);
});
