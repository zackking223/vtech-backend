import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const transportConfig = {
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASSWORD
  }
}

export const emailer = async (from: string, to: string, protocol: string, host: string, userId: string) => {
  const transporter = nodemailer.createTransport(transportConfig);

  jwt.sign(
    {
      user: userId
    },
    process.env.SECRET_TOKEN as string,
    {
      expiresIn: '1d'
    },
    async (err, emailToken) => {
      if (err) {
        return console.log(err);
      }
      const serverUrl = `${protocol}://${host}/cf/${emailToken}`;

      await transporter.sendMail({
        from,
        to,
        subject: "Vtech | Account confirmation 🤖",
        html: `
        <div style="
        position: relative;
        color: white !important;
        font-family: Inter, sans-serif;
        padding: 60px 40px;
        border-radius: 12px;
        overflow: hidden;
        width: 400px;
        height: max-content;
        box-sizing: border-box;
        background: #180C2D;
        ">
          <div style="position: relative;">
           <img src="https://vtech-api.onrender.com/public/uploads/logo.png" alt="vtech logo" style="margin: 0 auto;display: block;">
           <p style="color: #E7DEF5;">Welcome to Vtech! Please confirm your account!</i>
       
           <p style="
             padding: 8px 12px;
             background:linear-gradient(90deg, #9859FF 0%, #3E46FF 100%);
             width: max-content;
             color: #F3ECFF;
             border-radius: 4px;
             cursor: pointer;
             margin: 40px auto;
             ">
             <a href="${serverUrl}" style="color: #F3ECFF;text-decoration: none;font-weight: 500;">Confirm account</a>
           </p>
       
           <hr>
       
           <p style="color: #cec2e0;font-size: 14px;">If you didn't created a Vtech account, please ignore this Email!</p>
           <a href="/" style="color: #cec2e0;font-size: 14px;">vtech-seven.vercel.app</a>
         </div>
       </div>
        `
      }).then((res) => { console.log("Email sent: %s", res.messageId) });
    }
  );
};

export const confirmEmail = async (
  to: string,
  serverUrl: string,
  subject: string = "Vtech | Change your password 🤖",
  description: string = "Dear user, this is your OTP to change your password!",
  btnContent: string = "Confirm request",
  from: string = "vtech@blog.com",
) => {
  const transporter = nodemailer.createTransport(transportConfig);

  await transporter.sendMail({
    from,
    to,
    subject,
    html: `
  <div style="
    position: relative;
    color: white !important;
    font-family: Inter, sans-serif;
    padding: 60px 40px;
    border-radius: 12px;
    overflow: hidden;
    width: 400px;
    height: max-content;
    box-sizing: border-box;
    background: #180C2D;
   ">
<div style="position: relative;">
  <img src="https://vtech-api.onrender.com/public/uploads/logo.png" alt="vtech logo"
    style="margin: 0 auto;display: block;">
  <p style="color: white !important;">${description}</i>

  <p style="
         padding: 8px 12px;
         background:linear-gradient(90deg, #9859FF 0%, #3E46FF 100%);
         width: max-content;
         color: white;
         border-radius: 4px;
         cursor: pointer;
         margin: 40px auto;
         ">
    <a href="${serverUrl}" style="color: white;text-decoration: none;font-weight: 500;">${btnContent}</a>
  </p>

  <hr>

  <p style="color: #cec2e0;font-size: 14px;">If you didn't make this request, do not click the button! Your account might've been hacked! ⚠️</p>
  <a href="/" style="color: #cec2e0;font-size: 14px;">vtech-seven.vercel.app</a>
</div>
</div>
        `
  }).then((res) => { console.log("Email sent: %s", res.messageId) });
};
