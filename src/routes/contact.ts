import { escapeStringRegexp } from "../helpers/filterObject";
import { verifyToken } from "../helpers/verifyToken";
import { ContactModel, MediaModel } from "../models/Contact";
import express from "express";
import { UserModel } from "../models/User";

const contactRouter = express.Router();

contactRouter.post("/createcontact", verifyToken, async (req, res) => {
  try {
    await new ContactModel({
      media: req.body.media,
      content: req.body.content,
      url: req.body.content
    }).save();

    return res.status(200).send({
      success: true,
      message: "Contact added!"
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({
      success: false,
      message: "Can't add contact!"
    });
  }
});

contactRouter.put("/", verifyToken, async (req, res) => {
  try {
    (req.body.contacts as Contact[]).forEach(async (contact) => {
      if (!contact._id) {
        const result = await new ContactModel(contact).save();

        await UserModel.findByIdAndUpdate((req as CustomRequest).user._id, {
          "$push": {
            contacts: result._id
          }
        });
      } else {
        await ContactModel.findByIdAndUpdate(contact._id, {
          content: contact.content,
          url: contact.url
        });
      }
    });

    return res.status(200).send({
      success: true,
      message: "Contacts saved!"
    });

  } catch (err) {
    console.log(err);
    return res.status(400).send({
      success: false,
      message: "Can't save contacts!"
    });
  }
});

contactRouter.delete("", verifyToken, async (req, res) => {
  try {
    await ContactModel.findByIdAndDelete(req.query.id);
    await UserModel.findByIdAndUpdate((req as CustomRequest).user._id, {
      "$pull": {
        contacts: req.query.id
      }
    });
    return res.status(200).send({
      success: true,
      message: "Contact removed!"
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send({
      success: false,
      message: "Can't delete contact!"
    });
  }
});

contactRouter.post("/createmedia", verifyToken, async (req, res) => {
  try {
    await new MediaModel({
      name: req.body.name,
      icon: req.body.icon
    }).save();
  } catch (err) {
    console.log(err);
    return res.status(400).send({
      success: false,
      message: "Can't create new media!"
    })
  }
});

contactRouter.get("/media", async (req, res) => {
  const searchString = escapeStringRegexp(req.query.name as string || "");
  try {
    const result = await MediaModel.find({ name: { $regex: searchString, $options: "i" } });

    return res.status(200).send({
      success: true,
      message: "Found medias",
      data: result
    });
  } catch (err) {
    return res.status(400).send({
      success: false,
      message: "Can't find media"
    });
  }
});
export { contactRouter };