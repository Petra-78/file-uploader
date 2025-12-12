import { Router } from "express";
const router = Router();
import passport from "passport";

router.get("/", (req, res) => {
  res.render("partials/login");
});

router.post("/", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      console.log(info.message);
      return res.render("partials/login", { errors: [info.message] });
    }
    req.login(user, (err) => {
      if (err) return next(err);
      return res.redirect("/");
    });
  })(req, res, next);
});

export default router;
