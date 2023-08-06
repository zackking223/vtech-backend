import fs from "fs";
import multer from "multer";
import path from "path";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY!,
	api_secret: process.env.CLOUDINARY_API_SECRET!
});

export const FILE_TYPE_MAP = {
	"image/png": "png",
	"image/jpg": "jpg",
	"image/jpeg": "jpeg",
	"image/webp": "webp"
}

export async function convertFile(file: Express.Multer.File) {
	if (!file) {
		return {
			fileName: "",
			fileURI: ""
		}
	}

	const b64 = Buffer.from(file.buffer).toString("base64");
	let dataURI = "data:" + file.mimetype + ";base64," + b64;

	const extension = FILE_TYPE_MAP[file.mimetype as "image/png" | "image/jpg" | "image/jpeg" | "image/webp"];;
	const fileName = file.originalname.split(".")[0].replace(' ', '-');

	return {
		fileName: `${fileName.substring(0, fileName.lastIndexOf('.'))}-${Date.now()}.${extension}`,
		fileURI: dataURI
	}
}

export const deleteFile = async (fileName: string, option: "avatar" | "cover" | "attach" = "avatar") => {
	let dirPath = path.join(__dirname, '../../public/uploads/avatars/');
	if (option === "cover") {
		dirPath = path.join(__dirname, '../../public/uploads/blogs/covers/');
	} else if (option === "attach") {
		dirPath = path.join(__dirname, '../../public/uploads/blogs/attaches/');
	}

	try {
		fs.unlinkSync(dirPath + fileName);
		console.log("Delete File successfully.");
		console.log("At:", dirPath, fileName);
	} catch (error) {
		console.log(error);
	}
}

export const uploadToCloud = async (filename: string, option: "avatar" | "cover" | "attach" = "avatar") => {
	let imagePath = path.join(__dirname, `../../public/uploads/avatars/${filename}`);
	let folder = "avatars"
	if (option === "attach") {
		imagePath = path.join(__dirname, `../../public/uploads/blogs/attaches/${filename}`);
		folder = "blogs/attaches"
	} else if (option === "cover") {
		imagePath = path.join(__dirname, `../../public/uploads/blogs/covers/${filename}`);
		folder = "blogs/covers"
	}

	await cloudinary.uploader.upload(imagePath,
		{
			public_id: filename.split(".")[0],
			folder: folder,
			transformation: {
				format: "png"
			},

		},
		async function (error, result) {
			if (error) console.log(error);

			if (result) {
				await deleteFile(filename, option);
			}
		});
}

export const uploadToCloud2 = async (fileUri: string, filename: string, option: "avatar" | "cover" | "attach" = "avatar") => {
	let folder = "avatars"
	if (option === "attach") {
		folder = "blogs/attaches"
	} else if (option === "cover") {
		folder = "blogs/covers"
	}

	await cloudinary.uploader.upload(fileUri,
		{
			public_id: filename.split(".")[0],
			folder: folder,
			transformation: {
				format: "png"
			},

		},
		async function (error, result) {
			if (error) console.log(error.message);

			if (result) {

			}
		});
}

export const deleteFromCloud = async (fileName: string, option: "avatar" | "cover" | "attach" = "avatar") => {
	let public_id = `avatars/${fileName}`;

	if (option === "attach") {
		public_id = `blogs/attaches/${fileName}`;
	} else if (option === "cover") {
		public_id = `blogs/covers/${fileName}`;
	}

	await cloudinary.uploader.destroy(public_id, {},
		function (error, result) {
			if (error) console.log(error);
			if (result) console.log(result);
		});
}

export const uploadDisk = multer({
	storage: multer.diskStorage({
		destination: function (req, file, cb) {
			const isValid = FILE_TYPE_MAP[file.mimetype as "image/png" | "image/jpg" | "image/jpeg" | "image/webp"];
			let uploadStatus: Error | null = new Error("Incorrect file type!");

			if (isValid) uploadStatus = null;

			cb(uploadStatus, "public/uploads/avatars");
		},
		filename: function (req, file, cb) {
			const extension = FILE_TYPE_MAP[file.mimetype as "image/png" | "image/jpg" | "image/jpeg" | "image/webp"];;
			const fileName = file.originalname.replace(' ', '-');
			cb(null, `${fileName.substring(0, fileName.lastIndexOf('.'))}-${Date.now()}.${extension}`);
		}
	})
});

const virtualStorage = multer.memoryStorage();
export const uploadFile = multer({ storage: virtualStorage });