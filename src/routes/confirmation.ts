import Express from "express";
const confirmRouter = Express.Router();
import {UserModel} from "../models/User";
import jwt from "jsonwebtoken";

confirmRouter.get("/:token", async (req, res) => {
  try {
    const { _id } = jwt.verify(req.params.token, process.env.SECRET_TOKEN as string) as User;
    await UserModel.findByIdAndUpdate(_id, {isValidated: true});
  } catch (err) {
    res.status(400).send(err);
  }
  return res.redirect(200, "http://127.0.0.1:5173/login");
});

export {confirmRouter};