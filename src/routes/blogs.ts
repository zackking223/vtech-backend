import express from "express";
const blogRouter = express.Router();
import { BlogModel } from "../models/Blog";
import { verifyToken } from "../helpers/verifyToken";
import { blogValidation } from "../helpers/validation";
import { AttachImgModel } from "../models/AttachImg";
import { escapeStringRegexp } from "../helpers/filterObject";
import { UserModel } from "../models/User";
import { NotificationModel } from "../models/Notification";
import { io } from "..";
import { convertFile, deleteFile, deleteFromCloud, uploadFile, uploadToCloud2 } from "../helpers/manageFile";
import { CategoryModel } from "../models/Category";

blogRouter.get("/main", async (req, res) => {
	try {
		const latests = await BlogModel.find().sort({ "time": "desc" })
			.limit(parseInt(req.query.limit as string)).skip(parseInt(req.query.skip as string))
			.select({
				content: 0,
				comments: 0,
				likedBy: 0,
				dislikedBy: 0
			}).populate({
				path: "author",
				select: {
					name: 1
				}
			});

		const mostLikes = await BlogModel.find({ limit: 5 }).sort({ "likesCount": "desc" }).select({
			content: 0,
			comments: 0,
			likedBy: 0,
			dislikedBy: 0
		}).populate({
			path: "author",
			select: {
				name: 1
			}
		});

		const categories = await CategoryModel.find();

		return res.status(200).send({
			success: true,
			message: "Found blog!",
			latests,
			mostLikes,
			categories
		});

	} catch (err) {
		console.log(err);
		return res.status(400).send({
			success: false,
			message: "Can't find any blog!"
		})
	}
});

blogRouter.get("/bookmarked", verifyToken, async (req, res) => {
	try {
		const result = await UserModel.findById(req.query.id)
			.limit(parseInt(req.query.limit as string)).skip(parseInt(req.query.skip as string))
			.populate({
				path: "bookmark",
				populate: {
					path: "author",
					select: {
						name: 1
					}
				}
			});

		return res.status(200).send({
			success: true,
			message: "Found blog!",
			data: result?._doc.bookmark
		})
	} catch (err) {
		console.log(err);
		return res.status(400).send({
			success: false,
			message: "Can't find any blog!"
		})
	}
});

blogRouter.get("/mostlikes", async (req, res) => {
	try {
		const result = await BlogModel.find().sort({ "likesCount": "desc" })
			.limit(parseInt(req.query.limit as string)).skip(parseInt(req.query.skip as string))
			.select({
				content: 0,
				comments: 0,
				likedBy: 0,
				dislikedBy: 0
			}).populate({
				path: "author",
				select: {
					name: 1
				}
			});

		return res.status(200).send({
			success: true,
			message: "Found blog!",
			data: result
		});
	} catch (err) {
		console.log(err);
		return res.status(400).send({
			success: false,
			message: "Can't find any blog!"
		})
	}
});

blogRouter.get("/mostviews", async (req, res) => {
	try {
		const result = await BlogModel.find().sort({ "viewsCount": "desc" })
			.limit(parseInt(req.query.limit as string)).skip(parseInt(req.query.skip as string))
			.select({
				content: 0,
				comments: 0,
				likedBy: 0,
				dislikedBy: 0
			}).populate({
				path: "author",
				select: {
					name: 1
				}
			});

		return res.status(200).send({
			success: true,
			message: "Found blog!",
			data: result
		});
	} catch (err) {
		console.log(err);
		return res.status(400).send({
			success: false,
			message: "Can't find any blog!"
		})
	}
});

blogRouter.get("/latests", async (req, res) => {
	try {
		const result = await BlogModel.find().sort({ "time": "desc" })
			.limit(parseInt(req.query.limit as string)).skip(parseInt(req.query.skip as string))
			.select({
				content: 0,
				comments: 0,
				likedBy: 0,
				dislikedBy: 0
			}).populate({
				path: "author",
				select: {
					name: 1
				}
			});

		return res.status(200).send({
			success: true,
			message: "Found blog!",
			data: result
		});
	} catch (err) {
		console.log(err);
		return res.status(400).send({
			success: false,
			message: "Can't find any blog!"
		})
	}
});

blogRouter.get("/all", async (req, res) => {
	try {
		const result = await BlogModel.find()
			.limit(parseInt(req.query.limit as string))
			.skip(parseInt(req.query.skip as string))
			.select({
				content: 0,
				comments: 0,
				likedBy: 0,
				dislikedBy: 0
			}).populate({
				path: "author",
				select: {
					name: 1
				}
			});

		return res.status(200).send({
			success: true,
			message: "Found blog!",
			data: result
		});
	} catch (err) {
		console.log(err);
		return res.status(400).send({
			success: false,
			message: "Can't find any blog!"
		})
	}
});

blogRouter.get("/certified", async (req, res) => {
	try {
		const result = await BlogModel.find().select({
			content: 0,
			comments: 0,
			likedBy: 0,
			dislikedBy: 0
		}).populate({
			path: "author",
			model: "User",
			match: {
				isCertified: true
			},
			select: {
				name: 1,
				isCertified: 1
			}
		});

		return res.status(200).send({
			success: true,
			message: "Found blog!",
			data: result.filter(blog => blog.author !== null)
		});
	} catch (err) {
		console.log(err);
		return res.status(400).send({
			success: false,
			message: "Can't find any blog!"
		})
	}
});

blogRouter.get("/attachimages/:blogId", verifyToken, async (req, res) => {
	try {
		const result = await AttachImgModel.find({
			blogId: req.params.blogId,
			uploader: (req as CustomRequest).user._id
		});

		return res.status(200).send({
			success: true,
			message: result.length > 0 ? "Found images!" : "No image attached!",
			data: result
		});

	} catch (err) {
		console.log(err);
		return res.status(400).send({
			success: false,
			message: "You are not the author!"
		})
	}
});

blogRouter.post("/uploadimage", verifyToken, uploadFile.single("image"), async (req, res) => {
	if (!(req as CustomRequest).file) {
		return res.status(400).send({
			success: false,
			message: "Please provide an image.",
			source: "Blog content"
		});
	}

	const serverPath = `${process.env.CLOUD_URL}/blogs/attaches/`;
	const { fileName, fileURI } = await convertFile(req.file!); //multer got us covered

	try {
		if (!req.body.blogid) {
			const result = await new BlogModel({
				author: (req as CustomRequest).user._id,
				categories: [],
				commentsCount: 0,
				content: "None",
				coverImage: "None",
				description: "None",
				dislikedBy: [],
				dislikesCount: 0,
				likedBy: [],
				likesCount: 0,
				tags: [],
				time: "",
				title: "None" + Date.now() + Math.floor(Math.random() * 101).toString(),
				viewsCount: 0
			}).save();

			await UserModel.findByIdAndUpdate((req as CustomRequest).user._id, {
				"$inc": {
					postsCount: 1
				}
			});

			await new AttachImgModel({
				blogId: result._id,
				fileName: fileName,
				uploader: (req as CustomRequest).user._id,
				imageUrl: `${serverPath}${fileName}`
			}).save();

			await uploadToCloud2(fileURI, fileName, "attach");

			return res.status(200).send({
				success: true,
				message: "File received",
				imageUrl: `${serverPath}${fileName}`,
				data: result._id,
				source: "Blog content"
			});

		} else {

			await new AttachImgModel({
				blogId: req.body.blogid,
				fileName: fileName,
				uploader: (req as CustomRequest).user._id,
				imageUrl: `${serverPath}${fileName}`
			}).save();

			await uploadToCloud2(fileURI, fileName, "attach");

			return res.status(200).send({
				success: true,
				message: "File received",
				imageUrl: `${serverPath}${fileName}`,
				data: req.body.blogid,
				source: "Blog content"
			});
		}
	} catch (err) {
		console.log(err);
		await deleteFile(fileName, "attach");
		return res.status(400).send({
			success: false,
			message: "Failed to upload!"
		});
	}
});



blogRouter.delete("/removeimage/:id", verifyToken, async (req, res) => {
	try {
		const result = await AttachImgModel.findOneAndDelete({ _id: req.params.id, uploader: (req as CustomRequest).user._id });

		await deleteFromCloud(result?.fileName as string, "attach");

		return res.status(200).send({
			success: true,
			message: `Image ${result?.fileName} deleted`,
			data: result?.imageUrl
		});
	} catch (err) {
		console.log(err);
		return res.status(400).send({
			success: false,
			message: "You're not the uploader!"
		});
	}
});

blogRouter.post("/", verifyToken, uploadFile.single("imageFile"), async (req, res) => {
	const { error } = blogValidation(req.body);

	if (!(req as CustomRequest).file) {
		return res.status(400).send({
			success: false,
			message: "Please provide a cover image.",
			source: "Cover image"
		});
	};

	const serverPath = `${process.env.CLOUD_URL}/blogs/covers/`;
	const { fileName, fileURI } = await convertFile(req.file!); //multer got us covered

	if (error) {
		await deleteFile(fileName, "cover");

		return res.status(400).json({
			success: false,
			message: error.details[0].message,
			source: error.details[0].path[0]
		});
	}

	//Create a new blog
	const blog = new BlogModel({
		author: req.body.author._id,
		content: req.body.content,
		time: req.body.time,
		title: req.body.title,
		description: req.body.description,
		likesCount: req.body.likesCount,
		dislikesCount: req.body.dislikesCount,
		categories: req.body.categories,
		tags: req.body.tags,
		coverImage: `${serverPath}${fileName}`,
		comments: req.body.comments
	});

	try {
		const result = await blog.save();
		await uploadToCloud2(fileURI, fileName, "cover");
		await UserModel.findByIdAndUpdate((req as CustomRequest).user._id, {
			"$inc": {
				postsCount: 1
			}
		});

		const followers = await UserModel.find({ follows: (req as CustomRequest).user._id }).select({
			_id: 1
		});

		followers.forEach(async (follower) => {
			if (follower._id) {
				await new NotificationModel({
					content: `${(req as CustomRequest).user.name} has upload a new post \"${result.title}\"`,
					title: `${(req as CustomRequest).user.name}'s new post`,
					url: `/blog/${result._id}`,
					receiver: follower._id,
					icon: "icon-Description"
				}).save();

				io.to(follower._id as string).emit("notification", `${(req as CustomRequest).user.name} just uploaded!`);
			}
		});

		return res.status(200).send({
			success: true,
			message: "Blog created successfully!",
			data: result._id
		});
	} catch (err) {
		await deleteFile(fileName, "cover");
		console.log(err);
		return res.status(400).json({
			success: false,
			message: "Title already existed!"
		});
	}
});

// Like blog
blogRouter.put("/vote", verifyToken, async (req, res) => {
	try {
		let target = await BlogModel.findById(req.query.id);

		//Check if user has already liked
		let hasLiked = target?.likedBy.some((userId) => {
			return userId.equals((req as CustomRequest).user._id as string);
		});

		let hasDisliked = target?.dislikedBy.some((userId) => {
			return userId.equals((req as CustomRequest).user._id as string);
		});

		if (hasDisliked && req.query.method === "like") {
			//Undislike when user Like
			await BlogModel.findByIdAndUpdate(req.query.id, {
				$inc: {
					dislikesCount: -1
				},
				$pull: {
					dislikedBy: (req as CustomRequest).user._id
				}
			});
			await UserModel.findByIdAndUpdate(target?.author, {
				"$inc": {
					dislikesCount: -1
				}
			});
		}

		if (hasLiked && req.query.method === "dislike") {
			//Unlike when user Dislike
			await BlogModel.findByIdAndUpdate(req.query.id, {
				$inc: {
					likesCount: -1
				},
				$pull: {
					likedBy: (req as CustomRequest).user._id
				}
			});

			await UserModel.findByIdAndUpdate(target?.author, {
				"$inc": {
					likesCount: -1
				}
			});
		}

		if (hasLiked && req.query.method === "like") {
			let result = await BlogModel.findByIdAndUpdate(req.query.id, {
				$inc: {
					likesCount: -1
				},
				$pull: {
					likedBy: (req as CustomRequest).user._id
				}
			});

			result = await BlogModel.findById(req.query.id).populate("author", {
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

			await UserModel.findByIdAndUpdate(target?.author, {
				"$inc": {
					likesCount: -1
				}
			});

			return res.status(200).send({
				success: true,
				message: "Unliked blog!",
				data: result
			});
		} else if (!hasLiked && req.query.method === "like") {
			let result = await BlogModel.findByIdAndUpdate(req.query.id, {
				$inc: {
					likesCount: 1
				},
				$push: {
					likedBy: (req as CustomRequest).user._id
				}
			});

			result = await BlogModel.findById(req.query.id).populate("author", {
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

			await UserModel.findByIdAndUpdate(target?.author, {
				"$inc": {
					likesCount: 1
				}
			});

			return res.status(200).send({
				success: true,
				message: "Liked blog!",
				data: result
			});
		}

		if (hasDisliked && req.query.method === "dislike") {
			let result = await BlogModel.findByIdAndUpdate(req.query.id, {
				$inc: {
					dislikesCount: -1
				},
				$pull: {
					dislikedBy: (req as CustomRequest).user._id
				}
			});

			result = await BlogModel.findById(req.query.id).populate("author", {
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

			await UserModel.findByIdAndUpdate(target?.author, {
				"$inc": {
					dislikesCount: -1
				}
			});

			return res.status(200).send({
				success: true,
				message: "Undisliked blog!",
				data: result
			});
		} else if (!hasDisliked && req.query.method === "dislike") {
			let result = await BlogModel.findByIdAndUpdate(req.query.id, {
				$inc: {
					dislikesCount: 1
				},
				$push: {
					dislikedBy: (req as CustomRequest).user._id
				}
			});

			result = await BlogModel.findById(req.query.id).populate("author", {
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

			await UserModel.findByIdAndUpdate(target?.author, {
				"$inc": {
					dislikesCount: 1
				}
			});

			return res.status(200).send({
				success: true,
				message: "Disliked blog!",
				data: result
			});
		}

	} catch (err) {
		console.log(err);
		return res.status(400).send({
			success: false,
			message: "Can't find blog!"
		})
	}
});

blogRouter.put("", verifyToken, uploadFile.single("imageFile"), async (req, res) => {
	const { error } = blogValidation(req.body);

	if (!(req as CustomRequest).file && !req.body.coverImage) {
		return res.status(400).send({
			success: false,
			message: "Please provide a cover image.",
			source: "Cover image"
		});
	};

	const serverPath = `${process.env.CLOUD_URL}/blogs/covers/`;

	const { fileName, fileURI } = await convertFile(req.file!); //multer got us covered

	if (error) {
		return res.status(400).json({
			success: false,
			message: error.details[0].message,
			source: error.details[0].path[0]
		});
	}

	try {
		const targetBlog = await BlogModel.findById(req.query.id);

		if (targetBlog?.author.toString() !== (req as CustomRequest).user._id && !(req as CustomRequest).user.isAdmin) {
			return res.status(400).send({
				success: false,
				message: "You are not the author!"
			});
		}

		if (fileName !== "") {
			const coverImageName = targetBlog?.coverImage.split("/") as string[];
			await deleteFromCloud(coverImageName[coverImageName?.length - 1] as string, "cover");
			await uploadToCloud2(fileURI, fileName, "cover");
		}

		await BlogModel.findOneAndUpdate({
			_id: req.query.id,
			author: (req as CustomRequest).user._id
		}, {
			content: req.body.content,
			time: req.body.time,
			title: req.body.title,
			description: req.body.description,
			likesCount: req.body.likesCount,
			dislikesCount: req.body.dislikesCount,
			categories: req.body.categories,
			tags: req.body.tags,
			coverImage: fileName ? `${serverPath}${fileName}` : req.body.coverImage
		});

		return res.status(200).send({
			success: true,
			message: "Blog updated!",
			blogId: targetBlog?._id.toString()
		});
	} catch (err) {
		console.log(err);
		return res.status(400).send({
			success: false,
			message: "Can't find the blog!"
		})
	}
});

blogRouter.get("/getblogs/:userId", async (req, res) => {
	try {
		const result = await BlogModel.find({ author: req.params.userId }).select({
			content: 0 // Don't return the content field
		}).populate("author", {
			password: 0
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
			message: "Found blogs!",
			data: result
		});
	} catch (err) {
		console.log(err);
		return res.status(400).send({
			success: false,
			message: "Can't find user!"
		})
	}
});

blogRouter.post("/search", async (req, res) => {
	const searchString = escapeStringRegexp(req.query.title as string || "");

	let findConfig : Object = {title: { $regex: searchString, $options: 'i' }};
	let sortConfig : any = {
		time: "desc"
	};
	try {
		if (req.body.orderBy === "A-Z") {
			sortConfig = {
				title: "desc"
			}
		} else if (req.body.orderBy === "Most likes") {
			sortConfig = {
				likesCount: "desc"
			}
		} else if (req.body.orderBy === "Most dislikes") {
			sortConfig = {
				dislikesCount: "desc"
			}
		} else if (req.body.orderBy === "Oldest") {
			sortConfig = {
				time: "asc"
			}
		} else if (req.body.orderBy === "Most views") {
			sortConfig = {
				viewsCount: "desc"
			}
		}

		if (req.body.categories.length > 0 ) {
			findConfig = { 
				title: { $regex: searchString, $options: 'i' },
				categories: {
					"$in": req.body.categories
				}
			}
		}

		const result = await BlogModel.find(findConfig)
			.select({ content: 0, likedBy: 0, dislikedBy: 0, commentsCount: 0 })
			.populate("author", {
				name: 1
			})
			.sort(sortConfig)
			.limit(parseInt(req.query.limit as string))
			.skip(parseInt(req.query.skip as string));

		return res.status(200).send({
			success: true,
			message: "List of blogs",
			data: result,
			search: searchString
		});
	} catch (err) {
		console.log(err);
		return res.status(400).send({
			success: false,
			message: "Can't find any blog!",
		});
	}
});

blogRouter.get("", async (req, res) => {
	try {
		const result = await BlogModel.findByIdAndUpdate(req.query.id, { $inc: { viewsCount: 1 } }).populate("author", {
			password: 0,
			bookmark: 0,
			email: 0,
			follows: 0,
			isAdmin: 0,
			about: 0
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
		let images: attachedImages[] = [];

		if (req.headers.userid) {
			images = await AttachImgModel.find({
				blogId: req.query.id,
				uploader: req.headers.userid
			});
		}

		if (result) {
			return res.status(200).send({
				success: true,
				message: "Found blog!",
				data: { ...result._doc, attachedImages: images }
			});
		} else {
			return res.status(400).send({
				success: false,
				message: "Can't find the blog!"
			});
		}
	} catch (err) {
		console.log(err);
		return res.status(400).send({
			success: false,
			message: "Can't find the blog!"
		})
	}
});

blogRouter.delete("/:blogId", verifyToken, async (req, res) => {

	if ((req as CustomRequest).user.isAdmin) {
		try {
			const result = await BlogModel.findByIdAndDelete(req.params.blogId);

			if (result?.coverImage !== "") {
				const coverImageName = result?.coverImage.split("/") as string[];
				await deleteFile(coverImageName[coverImageName?.length - 1] as string, "cover");
			}

			await UserModel.findByIdAndUpdate((req as CustomRequest).user._id, {
				"$inc": {
					postsCount: -1
				}
			});

			return res.status(200).send({
				success: true,
				message: "Blog deleted!"
			})
		} catch (err) {
			console.log(err);
			return res.status(400).send({
				success: false,
				message: "Blog doesn't exist!"
			})
		}

	} else {
		try {
			const result = await BlogModel.findOneAndDelete({
				_id: req.params.blogId,
				author: (req as CustomRequest).user._id
			});

			if (result?.coverImage !== "") {
				const coverImageName = result?.coverImage.split("/") as string[];
				// await deleteFile(coverImageName[coverImageName?.length - 1] as string, "cover");
				await deleteFromCloud(coverImageName[coverImageName?.length - 1] as string, "cover");
			}

			return res.status(200).send({
				success: true,
				message: "Blog deleted!"
			})
		} catch (err) {
			console.log(err);
			return res.status(400).send({
				success: false,
				message: "Blog doesn't exist!"
			})
		}
	}
});

export { blogRouter };