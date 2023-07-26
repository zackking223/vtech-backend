import { Request } from "express";
import { Readable } from "stream";
export { };

declare global {
  /**
   * Now declare things that go in the global namespace,
   * or augment existing declarations in the global namespace.
   */
  interface CustomRequest extends Request {
    file: MulterFile,
    user: User
  }

  type ParsedQs = {
    data: string
  }

  interface UserRequest extends Request<{ id: string; }, any, any, ParsedQs, Record<string, any>> {
    file: MulterFile,
    user: User
  }

  type MulterFile = {
    stream: Readable,
    fieldname: string,
    originalname: string,
    encoding: string,
    mimetype: string,
    size: number,
    destination: string,
    filename: string,
    path: string,
    buffer: Buffer
  }
  type Blog = {
    _id: string,
    title: string,
    coverImage: string,
    content: string,
    description: string, //Summary of the content
    author: User, //Author's id / Name / Profile info
    time: string, //CreateAt | "Month Date, Year" 

    likedBy: string[], //Users who likes
    dislikedBy: string[]

    likesCount: number, //Likes count
    dislikesCount: number,
    commentsCount: number,
    viewsCount: number,

    categories: Category[],
    tags: string[],

    imageFile?: File,
    attachedImages?: attachedImages[],

    comments: Comment[]
  };

  interface DocumentResult<T> {
    _doc: T
  }

  type Comment = {
    _id: string,
    content: string,
    author: User,
    createAt: string,
    likesCount: number,
    dislikesCount: number,
    likedBy: User[] | string[],
    dislikedBy: User[] | string[]
  }

  type Category = {
    _id: string, //Is also its name
    imageUrl: string
  }

  type attachedImages = {
    _id?: string,
    blogId?: string,
    fileName: string,
    uploader?: string,
    imageUrl?: string
  }

  type AppCard = {
    title: string,
    likesCount: number,
    time: string | "Month Date, Year",
    author: string, //Author's name
    viewsCount: number,
    description: string,
    coverImage?: string,
    blogUrl: string,
    myStyles?: string
  };

  type BlogComment = {
    _id?: string,
    content: string,
    author: User,
    createAt: string,
    likes?: number,
    dislikes?: number,

    likedBy?: string[],
    dislikedBy?: string[]
  };

  type User = {
    _id?: string,
    name: string,
    avatar: UserAvatar,
    profession: string,
    bookmark?: string[], //Array of ids
    email?: string,
    likesCount?: number,
    followersCount?: number,
    postsCount?: number,
    dislikesCount?: number,
    follows?: string[], //Array of ids
    isAdmin: boolean,
    date?: string,
    isValidated?: boolean,
    isCertified?: boolean
    about?: string,
    contacts?: Contact[],
    notifications: UserNotification[],

    avatarFile?: File
  };

  type UserAvatar = {
    url: string,
    top: number,
    left: number,
  };

  type File = any;

  type UserNotification = {
    _id: string,
    title: string,
    content: string,
    url: string,
    receiver: string,
    icon: string
  };

  type Contact = {
    _id?: string,
    media: ContactMedia,
    url: string,
    content: string
  }

  type ContactMedia = {
    _id: string,
    name: string,
    icon: string,
    placeholder: string,
    regex: string
  }
}
