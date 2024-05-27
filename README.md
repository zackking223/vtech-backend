# VTECH BACKEND REST API:
- Written with Nodejs Express.
- Using typescript.

## Libraries:
- Express.
- Socket.io.
- Mongoose.
- Bcrypt, JWT token.
- Multer.
- Cloudinary SDK.
- Joi.

## Features:
- Let users interact with mongodb.
- Authenticating users.
- Send realtime notifications.

# .env
```
DB_CONNECT = mongodb+srv://...
SECRET_TOKEN = 12345
SECRET_REFRESH_TOKEN = 123456
ETHEREAL_USER = user@email.com
ETHEREAL_PASSWORD = 12345

HOST = http://localhost:3001
CLIENT = http://localhost:5173

CLOUD_NAME = cloudname
CLOUD_URL = https://res.cloudinary.com/cloudname/image/upload/version
CLOUDINARY_API_KEY = 
CLOUDINARY_API_SECRET = 

NODE_OPTIONS=no-network-family-autoselection
```