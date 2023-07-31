import express from "express";
const userRouter = express.Router();
import { UserModel } from "../models/User";
import { registerValidation, loginValidation } from "../helpers/validation";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyToken } from "../helpers/verifyToken";
import { emailer } from "../helpers/emailer";
import { BlogModel } from "../models/Blog";
import { NotificationModel } from "../models/Notification";
import { deleteFile, uploadToCloud2, uploadFile, convertFile } from "../helpers/manageFile";

type TokenList = {
	[key: string]: User
}
let tokenList: TokenList = {};
const FROM = "vtech@blog.com";
const GlobalTokenConfig = {
	expireTime: "1h"
}

const removeToken = async (token: string, tokenList: TokenList) => {
	if (token in tokenList) {
		if (Object.keys(tokenList).length === 0 && tokenList.constructor === Object) {
			return {};
		}
		let newTokenList = Object.entries(tokenList);
		newTokenList = newTokenList.filter(child => child[0] !== token);
		return Object.fromEntries(newTokenList);
	} else {
		return tokenList;
	}
}

//REGISTER
userRouter.post('/register', uploadFile.single("avatarFile"), async function (req, res) {
	//Validate user's request (data) before making a new user
	const { error } = registerValidation(req.body);

	if (!(req as CustomRequest).file) {
		return res.status(400).send({
			success: false,
			message: "Please provide an avatar.",
			source: "avatar"
		});
	}
	// const serverPath = `${req.protocol}://${req.get("host")}/public/uploads/avatars/`;
	const serverPath = `${process.env.CLOUD_URL}/avatars/`;
	const {fileName, fileURI} = await convertFile(req.file!); //multer got us covered

	if (error) {
		await deleteFile(fileName);
		return res.status(400).send({
			success: false,
			message: error.details[0].message,
			source: error.details[0].path[0]
		});
	}

	//Check if the user already existed in the db
	const emailExisted = await UserModel.exists({ "email": req.body.email });

	if (emailExisted) {
		await deleteFile(fileName);
		return res.status(400).send(
			{
				success: false,
				message: "Email already existed!",
				source: "email"
			}
		);
	}

	//Hash the password
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(req.body.password, salt);

	//Create a new user
	const user = new UserModel({
		name: req.body.name,
		email: req.body.email,
		profession: req.body.profession,
		avatar: {
			url: `${serverPath}${fileName}`,
			top: req.body.avatar.top,
			left: req.body.avatar.left
		}, //Ex: "http://localhost:3000/public/uploads/avatars/imagename-2032213"
		password: hashedPassword
	});


	try {
		const savedUser = await user.save();
		await emailer(FROM, req.body.email, req.protocol, req.get("host") as string, savedUser._id.toString());
		await uploadToCloud2(fileURI, fileName,"avatar");
		res.status(200).send({
			success: true,
			user: savedUser._id,
			message: "Successfully registered!"
		});
	} catch (err: any) {
		await deleteFile(fileName);
		res.status(400).json({
			success: false,
			message: err.message
		});
	}
});

const createToken = async (user: User, option: "access" | "refresh" = "access") => {
	if (option === "access") {
		const accessToken = await jwt.sign(
			{ user },
			process.env.SECRET_TOKEN as string,
			{ expiresIn: GlobalTokenConfig.expireTime }
		);
		return accessToken;
	} else if (option === "refresh") {
		// Lưu lại mã Refresh token, kèm thông tin của user để sau này sử dụng lại
		const refreshToken = await jwt.sign(
			{ user },
			process.env.SECRET_REFRESH_TOKEN as string
		);
		tokenList[refreshToken] = { ...user };
		return refreshToken;
	}
}

//LOGIN
userRouter.post("/login", async function (req, res) {
	//Validate data
	const { error } = loginValidation(req.body);
	if (error) return res.status(400).json({
		success: false,
		message: error.details[0].message,
		source: error.details[0].path[0]
	});

	//Check if the user exists in the db
	const user = await UserModel.findOne({ "email": req.body.email }).populate("contacts");
	if (!user) return res.status(400).send({
		success: false,
		message: "Email is not found!",
		source: "email"
	});
	const validPassword = await bcrypt.compare(req.body.password, user.password);
	if (!validPassword) return res.status(400).json({
		success: false,
		message: "Password is incorrect!",
		source: "password"
	});

	if (!user.isValidated) {
		return res.status(400).json({
			success: false,
			message: "Please check your email to validate account!"
		})
	}

	let userData = user.toObject();
	userData["password"] = "";

	const bookmarkArray = userData.bookmark.map(mark => mark.toString())
	const followsArray = userData.follows.map(follow => follow.toString());
	const notificationArray = await NotificationModel.find({ receiver: user._id });

	//create and asign a token with the user's id and send it to the client
	const token = await createToken({ ...userData, _id: userData._id.toString(), bookmark: bookmarkArray, follows: followsArray, contacts: userData.contacts as Contact[], notifications: notificationArray || [] });
	//create another token to be use as a refresh token
	const refreshToken = await createToken({ ...userData, _id: userData._id.toString(), bookmark: bookmarkArray, follows: followsArray, contacts: userData.contacts as Contact[], notifications: notificationArray || [] }, "refresh");
	res.status(200).json({
		success: true,
		user: { ...user._doc, notifications: notificationArray },
		token,
		refreshToken,
		message: "Login successfully!"
	});
});

// Lấy mã token mới sử dụng Refresh token:
userRouter.post("/refreshtoken", async (req, res) => {
	//User gửi mã refresh token:
	const refreshToken = req.header("refresh-token");
	if (!refreshToken) {
		return res.status(400).json({
			success: false,
			message: 'No refresh token provided!',
		});
	}
	//Kiểm tra xem mã refresh token có tồn tại trên hệ thống không
	if (refreshToken && (refreshToken in tokenList)) {

		//Chạy hàm verify:
		await jwt.verify(refreshToken, process.env.SECRET_REFRESH_TOKEN as string, async (error, user) => {
			if (error) {
				console.log(error);
				return res.status(403).json({
					success: false,
					message: "Invalid refresh token",
					error
				});
			}
			//Lấy lại thông tin user:
			const userData = tokenList[refreshToken];

			//Xóa token cũ
			tokenList = await removeToken(refreshToken, tokenList);

			//Tạo mã token mới vả trả cho user
			const newAccessToken = await createToken(userData);
			const newRefreshToken = await createToken(userData, "refresh");


			return res.status(200).json({
				success: true,
				user: userData,
				token: newAccessToken,
				refreshToken: newRefreshToken
			})
		});
	} else {
		return res.status(400).json({
			success: false,
			message: 'You are not authenticated!',
		});
	}
});

userRouter.post("/logout", verifyToken, async (req, res) => {
	const refreshToken = req.header("refresh-token");
	tokenList = await removeToken(refreshToken as string, tokenList);
	(req as CustomRequest).user = {} as User;
	res.status(200).send({
		success: true,
		message: "You logged out successfully!"
	});
});

//DELETE USER
userRouter.delete("/:id", verifyToken, async function (req, res) {
	const userToken = (req as UserRequest).user._id;
	const userIsAdmin = (req as UserRequest).user.isAdmin;

	if (userToken === req.params.id || (userIsAdmin == true)) {
		await UserModel.findByIdAndDelete(req.params.id).then(user => {
			if (!user) {
				return res.json({
					success: false,
					message: "Cannot find user!"
				});
			}
			else {
				return res.status(200).json({
					success: true,
					message: "User removed succesfully!"
				});
			};
		}).catch((err: any) => {
			console.log(err);
			res.json({
				success: false,
				message: "Cannot find user!"
			})
		});
	} else {
		res.json({
			success: false,
			message: "Permission denied!"
		});
	}
});

userRouter.get("/getuser", verifyToken, async (req, res) => {
	const userData = await UserModel.findById((req as UserRequest).user).select({
		password: 0
	});
	const notificationArray = await NotificationModel.find({ receiver: userData?._id });

	res.status(200).json({ user: {...userData?._doc, notifications: notificationArray} });
});

userRouter.get("/getprofile/:userId", async (req, res) => {
	try {
		const userData = await UserModel.findById(req.params.userId).select({
			password: 0,
			isVerified: 0,
			bookmark: 0,
			email: 0
		}).populate({
			path: "contacts",
			populate: {
				path: "media",
				model: "Media"
			}
		});
		const recentPosts = await BlogModel.find({
			author: req.params.userId
		}).select({
			content: 0
		}).populate("author", {
			name: 1
		});
		const likedPosts = await BlogModel.find({
			likedBy: req.params.userId
		}).select({
			content: 0
		}).populate("author", {
			name: 1
		});

		const notificationArray = await NotificationModel.find({ receiver: userData?._id });

		return res.status(200).send({
			success: true,
			message: "Found user!",
			data: {...userData?._doc, notifications: notificationArray},
			recentPosts,
			likedPosts
		});
	} catch (err) {
		console.log(err);
		return res.status(400).send({
			success: false,
			message: "Can't find user!"
		})
	}
});

export { userRouter };