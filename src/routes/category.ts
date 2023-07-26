import Express from 'express';
const categoryRouter = Express.Router();
import { verifyToken } from '../helpers/verifyToken';
import { CategoryModel } from "../models/Category";
import { escapeStringRegexp } from '../helpers/filterObject';

categoryRouter.post("/", verifyToken, async (req, res) => {
  if (req.body.name) {
    res.status(400).send({
      success: false,
      message: "Please provide a name for the category"
    });
  }

  const newCategory = new CategoryModel({
    name: req.body.name
  });

  try {
    const result = await newCategory.save();
    return res.status(200).send({
      success: true,
      message: "Category created!",
      data: result
    });
  } catch (err) {
    return res.status(400).send({
      success: false,
      message: err
    });
  }
});

categoryRouter.get("", async (req, res) => {
  const searchString = escapeStringRegexp(req.query.name as string || "");
  try {
    const result = await CategoryModel.find({_id: {$regex: searchString, $options: 'i'}})
      .limit(parseInt(req.query.limit as string))
      .skip(parseInt(req.query.skip as string));
      
    return res.status(200).send({
      success: true,
      message: "List of category",
      data: result,
      search: searchString
    });
  } catch (err) {
    return res.status(400).send({
      success: false,
      message: err
    });
  }
});

export {categoryRouter};
