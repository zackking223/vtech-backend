import fs from "fs";
import multer from "multer";
import path from "path";

export const FILE_TYPE_MAP = {
	"image/png": "png",
	"image/jpg": "jpg",
	"image/jpeg": "jpeg",
	"image/webp": "webp"
}

export const deleteFile = async (fileName: string, option : "avatar" | "blog" = "avatar") => {
	let dirPath = path.join(__dirname, '../../public/uploads/avatars/');
	if (option === "blog") {
		dirPath = path.join(__dirname, '../../public/uploads/blogs/');
	}

	try {
		fs.unlinkSync(dirPath + fileName);
		console.log("Delete File successfully.");
		console.log("At:", dirPath, fileName);
	} catch (error) {
		console.log(error);
	}
	//console.log(fileName + " deleted");
}

export const storage = multer.diskStorage({
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
});

export const uploadFile = multer({ storage: storage });