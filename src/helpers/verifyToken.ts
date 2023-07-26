import jwt from "jsonwebtoken";
import {Request, Response} from 'express';

export const verifyToken = function(req : Request, res : Response, next : () => void) {
    const token = req.header("auth-token");
    
    if (!token) {
        console.log("No token provided!");
        return res.status(401).json({
            success: false,
            message: "Please login first!"
        });
    }

    try {
        const { user } = jwt.verify(token, process.env.SECRET_TOKEN as string) as {user: User};

        (req as CustomRequest).user = user;
        next();
    } catch(err) {
        console.log("Invalidi token!");
        return res.status(400).json({
            success: false,
            message: "Please login first!"
        });
    }
};