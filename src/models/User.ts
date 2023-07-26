import mongoose from "mongoose";

interface IEvent extends DocumentResult<IEvent> {
    _id: string | mongoose.Types.ObjectId,
    name: string,
    avatar: UserAvatar,
    profession: string,
    bookmark: mongoose.Types.ObjectId[], //Array of ids
    email: string,
    password: string,
    likesCount: number,
    followersCount?: number,
    postsCount: number,
    dislikesCount?: number,
    follows: mongoose.Types.ObjectId[], //Array of ids
    isAdmin: boolean,
    date: string,
    isValidated: boolean,
    isCertified: boolean
    about?: string,
    contacts?: Contact[]
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    avatar: {
        url: {
            type: String,
            required: true
        },
        top: {
            type: Number,
            default: 0,
        },
        left: {
            type: Number,
            default: 0
        }
    },
    profession: {
        type: String,
        default: "None"
    },
    bookmark: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog"
    }],
    email: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 1024,
    },
    likesCount :{
        type: Number,
        default: 0
    },
    followersCount :{
        type: Number,
        default: 0
    },
    postsCount :{
        type: Number,
        default: 0
    },
    dislikesCount :{
        type: Number,
        default: 0
    },
    follows: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    isAdmin: {
        type: Boolean,
        default: false
    },
    date: {
        type: String,
        required: false 
    },
    isValidated: {
        type: Boolean,
        default: false
    },
    isCertified: {
        type: Boolean,
        default: false
    },
    about: {
        type: String,
        default: "None",
        required: false
    },
    contacts: [{
        type: mongoose.Types.ObjectId,
        ref: "Contact",
        default: []
    }]
});

export const UserModel = mongoose.model<IEvent>("User", userSchema);
//Model: moi khi tao 1 user moi trong nodeJs thi se dong thoi them 1 user (collection) tren database