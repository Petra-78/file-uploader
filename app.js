import path from "node:path";
import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import "./config/passport.js";
import { fileURLToPath } from "node:url";

// Routers
// import signupRouter from "./routes/signupRouter.js";
// import loginRouter from "./routes/loginRouter.js";
import indexRouter from "./routes/indexRouter.js";
// import messageRouter from "./routes/messageRouter.js";

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
  })
);

app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.errors = [];
  next();
});

app.use("/", indexRouter);

// app.use("/log-in", loginRouter);
// app.use("/sign-up", signupRouter);
// app.get("/log-out", (req, res, next) => {
//   req.logout((err) => {
//     if (err) {
//       return next(err);
//     }
//     res.redirect("/");
//   });
// });

// app.use("/new", messageRouter);

// app.use((req, res) => {
//   if (res.status(404)) res.render("404");
//   else res.render("500");
// });

app.listen(process.env.PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`app listening on port ${process.env.PORT}!`);
});
