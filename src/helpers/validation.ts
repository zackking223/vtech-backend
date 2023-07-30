import Joi from "joi";


const registerValidation = (dataObj: User) => {
    const schema = Joi.object({
        email: Joi.string().min(6).required().email().label("Email").messages({
            'string.email': `We can tell that's not a valid email!`,
            'string.empty': `We need an email here buddy`,
            'string.min': `An email should have a minimum length of {#limit}`,
        }),
        name: Joi.string().min(6).required().label("Username").messages({
            'string.empty': `We need something to call you`,
            'string.min': `Your username should have a minimum length of {#limit}`,
        }),
        profession: Joi.string().min(6).required().label("Profession"),
        password: Joi.string().min(6).required(),
        repeatPassword: Joi.any().equal(Joi.ref("password")).required()
            .label('Repeat password')
            .options({ messages: { 'any.only': 'Password does not match' } }),
        avatar: Joi.any().label("Avatar"),
        about: Joi.string().label("About"),
        contacts: Joi.array().items(Joi.any()).label("Contacts"),
        date: Joi.any()
    });

    return schema.validate(dataObj);
};

const loginValidation = (dataObj: User) => {
    const schema = Joi.object({
        email: Joi.string().min(6).required().email().label("Email"),
        password: Joi.string().min(6).required().label("Password")
    });

    return schema.validate(dataObj);
};

const blogValidation = (dataObj: Blog) => {
    const dateTimeRegex = /\b(January|February|March|April|May|June|July|August|September|October|November|December)+ (0?[1-9]|[12][0-9]|3[01]), (?:19[7-9]\d|2\d{3})+/i;
    const authorSchema = Joi.object({
        _id: Joi.string().label("_id").allow(null, ''),
        avatar: Joi.any().required(),
        name: Joi.string().required(),
        profession: Joi.string().required(),
        isAdmin: Joi.boolean().label("Is admin"),
        isValidated: Joi.boolean().label("Is validated"),
        isCertified: Joi.boolean().label("Is certified"),
        email: Joi.string().email().label("Author's email"),
        password: Joi.string().label("Author's password"),
        likesCount: Joi.number(),
        dislikesCount: Joi.number(),
        follows: Joi.array().items(Joi.string()),
        postsCount: Joi.number(),
        followersCount: Joi.number(),
        bookmark: Joi.array().items(Joi.string()),
        date: Joi.any(),
        __v: Joi.any(),
        about: Joi.string(),
        notifications: Joi.array().items(Joi.any()),
        contacts: Joi.array().items(Joi.any())
    }).label("Author's info");
    const schema = Joi.object({
        _id: Joi.string().label("_id").allow(null, ''),
        coverImage: Joi.string(),
        description: Joi.string(),
        author: authorSchema,
        content: Joi.string().required().label("Content"),
        time: Joi.string().regex(dateTimeRegex).required().label("Time posted"),
        //December 30, 2023
        title: Joi.string().required().label("Title"),
        likesCount: Joi.number().required(),
        dislikesCount: Joi.number().required(),
        categories: Joi.array().items(Joi.string()).required().label("Categories"),
        tags: Joi.array().items(Joi.any()).label("Tags"),
        commentsCount: Joi.number(),
        viewsCount: Joi.number(),
        __v: Joi.any(),
        attachedImages: Joi.array().items(Joi.string()),
        comments: Joi.array().items(Joi.any())
    });
    return schema.validate(dataObj);
};

export { registerValidation, loginValidation, blogValidation };
