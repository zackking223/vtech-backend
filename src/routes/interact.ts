import express from "express";
import bcrypt from "bcryptjs";
const interactRouter = express.Router();
import { UserModel } from "../models/User";
import { BlogModel } from "../models/Blog";
import { verifyToken } from "../helpers/verifyToken";
import { NotificationModel } from "../models/Notification";
import { convertFile, deleteFromCloud, uploadFile, uploadToCloud, uploadToCloud2 } from "../helpers/manageFile";
import { otpModel } from "../models/OTP";
import { confirmEmail } from "../helpers/emailer";

interactRouter.put("/bookmark", verifyToken, async (req, res) => {
  try {
    let result = await BlogModel.findById(req.query.id);

    if (result !== null) {
      result = await UserModel.findOne({
        _id: (req as CustomRequest).user._id,
        bookmark: req.query.id
      });

      if (result !== null) {
        await UserModel.findByIdAndUpdate((req as CustomRequest).user._id, {
          $pull: {
            bookmark: req.query.id
          }
        });

        let data = await UserModel.findById((req as CustomRequest).user._id).select({ password: 0 });

        return res.status(200).send({
          success: true,
          message: "Bookmark removed!",
          data: data
        });
      } else {
        await UserModel.findByIdAndUpdate((req as CustomRequest).user._id, {
          $push: {
            bookmark: req.query.id
          }
        });

        let data = await UserModel.findById((req as CustomRequest).user._id).select({ password: 0 });

        return res.status(200).send({
          success: true,
          message: "Bookmarked!",
          data: data
        });
      }
    }

  } catch (err) {
    console.log(err);
    return res.status(400).send({
      success: false,
      message: "Can't find blog!"
    });
  }
});

interactRouter.put("/follow", verifyToken, async (req, res) => {
  try {
    let result = await UserModel.findById((req as CustomRequest).user._id);

    if (result) {
      let hasFollowed = result.follows.some((userId) => {
        return userId.equals(req.query.id as string);
      });

      if (hasFollowed) {
        result = await UserModel.findByIdAndUpdate((req as CustomRequest).user._id, {
          "$pull": {
            follows: req.query.id
          }
        });

        result = await UserModel.findByIdAndUpdate(req.query.id, {
          "$inc": {
            followersCount: -1
          }
        });

        return res.status(200).send({
          success: true,
          message: "Unfollowed!"
        });
      } else if (!hasFollowed) {
        result = await UserModel.findByIdAndUpdate((req as CustomRequest).user._id, {
          "$push": {
            follows: req.query.id
          }
        });

        result = await UserModel.findByIdAndUpdate(req.query.id, {
          "$inc": {
            followersCount: 1
          }
        });

        return res.status(200).send({
          success: true,
          message: "Followed!"
        });
      }
    }
    return res.status(400).send({
      success: false,
      message: "Can't find user!"
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({
      success: false,
      message: "Can't find user!"
    });
  }
});

interactRouter.put("/updateabout", verifyToken, async (req, res) => {
  try {
    await UserModel.findByIdAndUpdate((req as CustomRequest).user._id, {
      about: req.body.about
    });

    return res.status(200).send({
      success: true,
      message: "About saved!"
    });

  } catch (err) {
    console.log(err);
    return res.status(400).send({
      success: false,
      message: "Can't save about!"
    });
  }
});

interactRouter.put("/updatename", verifyToken, async (req, res) => {
  try {
    await UserModel.findByIdAndUpdate((req as CustomRequest).user._id, {
      name: req.body.name
    });

    return res.status(200).send({
      success: true,
      message: "Username saved!"
    });

  } catch (err) {
    console.log(err);
    return res.status(400).send({
      success: false,
      message: "Can't save username!"
    });
  }
});

interactRouter.put("/updateprofession", verifyToken, async (req, res) => {
  try {
    await UserModel.findByIdAndUpdate((req as CustomRequest).user._id, {
      profession: req.body.profession
    });

    return res.status(200).send({
      success: true,
      message: "Profession saved!"
    });

  } catch (err) {
    console.log(err);
    return res.status(400).send({
      success: false,
      message: "Can't save profession!"
    });
  }
});

interactRouter.delete("/notification", verifyToken, async (req, res) => {
  try {
    await NotificationModel.findByIdAndDelete(req.query.id);

    return res.status(200).send({
      success: true,
      message: "Notification removed!"
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({
      success: false,
      message: "Can't remove notification!"
    });
  }
});

interactRouter.delete("/allnotification", verifyToken, async (req, res) => {
  try {
    await NotificationModel.deleteMany({ receiver: req.query.id });

    return res.status(200).send({
      success: true,
      message: "All notification removed!"
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({
      success: false,
      message: "Can't remove notification!"
    });
  }
});

interactRouter.get("/notification", verifyToken, async (req, res) => {
  try {
    const result = await NotificationModel.find({ receiver: req.query.id });

    return res.status(200).send({
      success: true,
      message: "Notification removed!",
      data: result
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({
      success: false,
      message: "Can't find any notification!"
    });
  }
});

interactRouter.get("/followed", async (req, res) => {
  try {
    const result = await UserModel.findById(req.query.id).select({
      follows: 1
    }).populate({
      path: "follows",
      select: {
        password: 0,
        "email": 0,
        "likesCount": 0,
        "followersCount": 0,
        "postsCount": 0,
        "dislikesCount": 0,
        "follows": 0,
        "isValidated": 0,
        "about": 0,
        "contacts": 0,
        bookmark: 0
      }
    });

    return res.status(200).send({
      success: true,
      message: "Found followed!",
      data: result?.follows
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({
      success: false,
      message: "Can't find any followed!"
    });
  }
});

interactRouter.put("/avatar", verifyToken, uploadFile.single("avatarFile"), async (req, res) => {
  try {
    if (!(req as CustomRequest).file) {
      return res.status(400).send({
        success: false,
        message: "Please provide an avatar",
        source: "Avatar"
      });
    };

    const serverPath = `${process.env.CLOUD_URL}/avatars/`;

    if (req.file) {
      const { fileName, fileURI } = await convertFile(req.file);

      const targetUser = await UserModel.findById((req as CustomRequest).user._id);
      const oldAvatar = targetUser?.avatar.url.split("/") as string[];

      await deleteFromCloud(oldAvatar[oldAvatar.length - 1], "avatar");

      await UserModel.findByIdAndUpdate((req as CustomRequest).user._id, {
        avatar: {
          url: `${serverPath}${fileName}`,
          top: req.body.avatar.top,
          left: req.body.avatar.left
        }
      });

      await uploadToCloud2(fileURI, fileName, "avatar");

      return res.status(200).send({
        success: true,
        message: "Avatar updated!"
      });
    }

  } catch (err) {
    console.log(err);
    return res.status(400).send({
      success: false,
      message: "Can't update avatar!"
    });
  }
});

interactRouter.post("/otp", verifyToken, async (req, res) => {
  try {

    let subject = "";
    let description = "";
    let payload = "";

    if (req.body.action === "change_password") {
      
      subject = "Vtech | Change your password 🤖";
      description = `Dear ${(req as CustomRequest).user.name}, click the button down bellow to confirm changing your password. (This request will expired in 30 minutes!)`;
      //Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.payload, salt);
      payload = hashedPassword
    
    } else if (req.body.action === "validate_user") {
      
      subject = "Vtech | Account confirmation 🤖";
      description = `Dear ${(req as CustomRequest).user.name}, click the button down bellow to validate your account. (This request will expired in 30 minutes!)`;
    
    }

    const result = await new otpModel({
      request_user: (req as CustomRequest).user._id,
      action: req.body.action,
      payload
    }).save();

    await confirmEmail(
      (req as CustomRequest).user.email!,
      `${process.env.HOST}/api/interact/otp?id=${result._id}`,
      subject,
      description
    );

    return res.status(200).send({
      success: true,
      message: "OTP created!",
      data: result._id
    });
  } catch (err: any) {
    console.log(err);
    return res.status(400).send({
      success: false,
      message: "Can't create OTP!"
    })
  }
});

interactRouter.get("/otp", async (req, res) => {
  try {
    const result = await otpModel.findByIdAndDelete(req.query.id);
    let message = "";
    if (result) {
      if (result.action === "change_password") {
        await UserModel.findByIdAndUpdate(result.request_user, {
          password: result.payload
        });
        message = "Password changed!"
      }

      return res.status(200).send({
        success: true,
        message
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "OTP expired!"
      })
    }

  } catch (err) {
    console.log(err);

    return res.status(400).send({
      success: false,
      message: "Something went wrong!"
    });
  }
});

export { interactRouter };