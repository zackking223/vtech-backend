import Express from "express";
const confirmRouter = Express.Router();
import {UserModel} from "../models/User";
import jwt from "jsonwebtoken";

confirmRouter.get("/:token", async (req, res) => {
  try {
    const res = jwt.verify(req.params.token, process.env.SECRET_TOKEN as string) as {
      user: string,
      iat: number,
      exp: number
    };
    
    await UserModel.findByIdAndUpdate(res.user, {isValidated: true});
  } catch (err) {
    console.log(err);
    return res.status(400).send({
      status: false,
      message: "Validation expired!"
    })
  }
  return res.redirect(200, `${process.env.CLIENT}/login`);
});

export {confirmRouter};