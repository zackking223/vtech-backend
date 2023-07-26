import Express from "express";
const app = Express();
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { Server } from "socket.io";
import Http from "http";

const httpServer = Http.createServer(app);
// {
//     key: fs.readFileSync("key.pem"),
//     cert: fs.readFileSync("cert.pem"),
// }
dotenv.config();
//connect to mongodb
mongoose.set('strictQuery', true);
mongoose.connect(
    process.env.DB_CONNECT as string,
    {
        dbName: "blogapp"
    },
    () => console.log("connected to mongodb!")
);


//Import route
import { userRouter } from "./routes/auth";
import { confirmRouter } from "./routes/confirmation";
import { blogRouter } from "./routes/blogs";
import { categoryRouter } from "./routes/category";
import { commentRouter } from "./routes/comment";
import { contactRouter } from "./routes/contact";
import { interactRouter } from "./routes/interact";

//Middleware
app.use(cors());
app.options("*", cors());
app.use("/public/uploads", Express.static(path.join(__dirname, "../public/uploads"))); //Serve images to frontend
app.use(Express.json());
app.use(morgan("tiny"));

//Route middleware
app.use("/api/user", userRouter);
app.use("/api/blog", blogRouter);
app.use("/api/category", categoryRouter);
app.use("/cf", confirmRouter);
app.use("/api/comment", commentRouter);
app.use("/api/contact", contactRouter);
app.use("/api/interact", interactRouter);


//Create Express app: Express()
//Create an Http server: Http.createServer(app)
//Create io passing in the Http server: i

export const localhostIP = "192.168.0.102";
const io = new Server(httpServer, {
    cors: {
        origin: `http://${localhostIP}:5173`,
    },
});

io.use((socket, next) => {
    const userId: string = socket.handshake.auth.userId;
    console.log(`User connected: ${userId}`);
    if (!userId) {
        return next(new Error("No id given!"));
    }
    socket.join(userId);
    next();
});

httpServer.listen(3001, () => {
    console.log("What sup, server is up: http://192.168.1.71:3001/api/category");
});

export { io };

