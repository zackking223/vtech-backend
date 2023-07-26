import { CommentModel } from "../models/Comment";
import { BlogModel } from "../models/Blog";
import express from "express";
import { verifyToken } from "../helpers/verifyToken";
import { NotificationModel } from "../models/Notification";
import { io } from "..";

const commentRouter = express.Router();

commentRouter.post("/:blogId", verifyToken, async (req, res) => {
  try {
    const commentData = await new CommentModel({
      author: (req as CustomRequest).user._id,
      content: req.body.content,
      createAt: req.body.createAt,
      likedBy: [],
      dislikedBy: [],
      likes: 0,
      dislikes: 0
    }).save();

		if ((req as CustomRequest).user._id !== req.body.blogAuthor) {
			console.log(req.body);
			await new NotificationModel({
				content: `${(req as CustomRequest).user.name} has commented on your blog.`,
				title: "New comment",
				url: `/blog/${req.params.blogId}/#${(req as CustomRequest).user._id}`,
				receiver: req.body.blogAuthor,
				icon: "icon-Add-comment"
			}).save();

			io.to(req.body.blogAuthor).emit("notification", "New comment added to your blog!");
		}

    try {
      await BlogModel.findByIdAndUpdate(req.params.blogId, {
        "$inc": {
          commentsCount: 1
        },
        "$push": {
          "comments": commentData._id
        }
      });

      return res.status(200).send({
        success: true,
        message: "Comment posted!"
      })
    } catch (err) {
      console.log(err);
      return res.status(400).send({
        success: false,
        message: "Can't post comment!"
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send({
      success: false,
      message: "Can't post comment!"
    });
  }
});

commentRouter.delete("/:commentId", verifyToken, async (req, res) => {
  if ((req as CustomRequest).user.isAdmin) {
    try {
      const result = await CommentModel.findByIdAndDelete(req.params.commentId);
      
      await BlogModel.findByIdAndUpdate(result?._id, {
        "$inc": {
          commentsCount: -1
        },
        "$pull": {
          comments: req.params.commentId
        }
      })
      return res.status(200).send({
        success: true,
        message: "Comment deleted!"
      });
    } catch (err) {
      console.log(err);
      return res.status(400).send({
        success: false,
        message: "Can't delete comment!"
      });
    }
  } else {
    try {
      const result = await CommentModel.findOneAndDelete({
        _id: req.params.commentId,
        author: (req as CustomRequest).user._id
      });
      
      await BlogModel.findByIdAndUpdate(result?._id, {
        "$inc": {
          commentsCount: -1
        },
        "$pull": {
          comments: req.params.commentId
        }
      })
      return res.status(200).send({
        success: true,
        message: "Comment deleted!"
      });
    } catch (err) {
      console.log(err);
      return res.status(400).send({
        success: false,
        message: "You're not the author!"
      });
    }
  }
});

commentRouter.put("/vote", verifyToken, async (req, res) => {
  try {
		let result = await CommentModel.findById(req.query.id);

		//Check if user has already liked
		let hasLiked = result?.likedBy.some((userId) => {
			return userId.equals((req as CustomRequest).user._id as string);
		});

		let hasDisliked = result?.dislikedBy.some((userId) => {
			return userId.equals((req as CustomRequest).user._id as string);
		});

		if (hasDisliked && req.query.method === "like") {
			await CommentModel.findByIdAndUpdate(req.query.id, {
				$inc: {
					dislikesCount: -1
				},
				$pull: {
					dislikedBy: (req as CustomRequest).user._id
				}
			});
		}

		if (hasLiked && req.query.method === "dislike") {
			await CommentModel.findByIdAndUpdate(req.query.id, {
				$inc: {
					likesCount: -1
				},
				$pull: {
					likedBy: (req as CustomRequest).user._id
				}
			});
		}

		if (hasLiked && req.query.method === "like") {
			result = await CommentModel.findByIdAndUpdate(req.query.id, {
				$inc: {
					likesCount: -1
				},
				$pull: {
					likedBy: (req as CustomRequest).user._id
				}
			});

			result = await BlogModel.findById(req.body.blogid).populate("author", {
				password: 0,
				email: 0
			}).populate("categories").populate({
				path: "comments",
				populate: {
					path: "author",
					model: "User",
					select: {
						password: 0,
						bookmark: 0,
						email: 0,
						follows: 0,
						isAdmin: 0,
						about: 0
					}
				}
			});

			return res.status(200).send({
				success: true,
				message: "Unliked comment!",
				data: result
			});
		} else if (!hasLiked && req.query.method === "like") {
			result = await CommentModel.findByIdAndUpdate(req.query.id, {
				$inc: {
					likesCount: 1
				},
				$push: {
					likedBy: (req as CustomRequest).user._id
				}
			});

			result = await BlogModel.findById(req.body.blogid).populate("author", {
				password: 0,
				email: 0
			}).populate("categories").populate({
				path: "comments",
				populate: {
					path: "author",
					model: "User",
					select: {
						password: 0,
						bookmark: 0,
						email: 0,
						follows: 0,
						isAdmin: 0,
						about: 0
					}
				}
			});

			return res.status(200).send({
				success: true,
				message: "Liked comment!",
				data: result
			});
		}

		if (hasDisliked && req.query.method === "dislike") {
			result = await CommentModel.findByIdAndUpdate(req.query.id, {
				$inc: {
					dislikesCount: -1
				},
				$pull: {
					dislikedBy: (req as CustomRequest).user._id
				}
			});

			result = await BlogModel.findById(req.body.blogid).populate("author", {
				password: 0,
				email: 0
			}).populate("categories").populate({
				path: "comments",
				populate: {
					path: "author",
					model: "User",
					select: {
						password: 0,
						bookmark: 0,
						email: 0,
						follows: 0,
						isAdmin: 0,
						about: 0
					}
				}
			});

			return res.status(200).send({
				success: true,
				message: "Undisliked comment!",
				data: result
			});
		} else if (!hasDisliked && req.query.method === "dislike") {
			result = await CommentModel.findByIdAndUpdate(req.query.id, {
				$inc: {
					dislikesCount: 1
				},
				$push: {
					dislikedBy: (req as CustomRequest).user._id
				}
			});

			result = await BlogModel.findById(req.body.blogid).populate("author", {
				password: 0,
				email: 0
			}).populate("categories").populate({
				path: "comments",
				populate: {
					path: "author",
					model: "User",
					select: {
						password: 0,
						bookmark: 0,
						email: 0,
						follows: 0,
						isAdmin: 0,
						about: 0
					}
				}
			});

			return res.status(200).send({
				success: true,
				message: "Disliked comment!",
				data: result
			});
		}

	} catch (err) {
		console.log(err);
		return res.status(400).send({
			success: false,
			message: "Can't find comment!"
		})
	}
});

export { commentRouter };