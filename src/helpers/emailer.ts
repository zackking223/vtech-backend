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
        subject: "Vtech account confirmation 🤖",
        html: `
        <div style="
        position: relative;
        background: #180C2D;
        color: #F3ECFF;
        font-family: Inter, sans-serif;
        width: max-content;
        height: max-content;
        padding: 60px 40px;
        border-radius: 12px;
        overflow: hidden;
        width: 400px;
        height: max-content;
        box-sizing: border-box;
       ">
         <img src="https://lh3.google.com/u/0/d/1zW4U0ive1VcC_P_8MPa9RhFy54oiU3ka=w1920-h942-iv1" alt="background" style="
           position: absolute;
           width: 100%;
           height: 100%;
           top: 0;
           left: 0;
           opacity: 0.3;
         ">
         <div style="position: relative;">
           <img src="https://lh3.google.com/u/0/d/1Xm0U79s_HTPw5oe213TFM8H-_A48h62b=w1920-h942-iv1" alt="vtech logo" style="margin: 0 auto;display: block;">
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

export const changePassEmail = async (from: string, to: string, userId: string, newPass: string) => {
  const transporter = nodemailer.createTransport(transportConfig);

  jwt.sign(
    {
      user: userId,
      password: newPass
    },
    process.env.SECRET_TOKEN as string,
    {
      expiresIn: '1d'
    },
    async (err, emailToken) => {
      if (err) {
        return console.log(err);
      }
      const serverUrl = `${process.env.HOST}/api/interact/${emailToken}`;

      await transporter.sendMail({
        from,
        to,
        subject: "Vtech password change 🤖",
        html: `
        <div style="
          position: relative;
          background: #180C2D;
          color: #F3ECFF;
          font-family: Inter, sans-serif;
          width: max-content;
          height: max-content;
          padding: 60px 40px;
          border-radius: 12px;
          overflow: hidden;
          width: 400px;
          height: max-content;
          box-sizing: border-box;
          ">
            <img src="https://lh3.google.com/u/0/d/1zW4U0ive1VcC_P_8MPa9RhFy54oiU3ka=w1920-h942-iv1" alt="background" style="
              position: absolute;
              width: 100%;
              height: 100%;
              top: 0;
              left: 0;
              opacity: 0.3;
            ">
            <div style="position: relative;">
              <img src="https://lh3.google.com/u/0/d/1Xm0U79s_HTPw5oe213TFM8H-_A48h62b=w1920-h942-iv1" alt="vtech logo" style="margin: 0 auto;display: block;">
              <p style="color: #E7DEF5;">Dear user, this is your OTP to change your password!</i>
          
              <p style="
                padding: 8px 12px;
                background:linear-gradient(90deg, #9859FF 0%, #3E46FF 100%);
                width: max-content;
                color: #F3ECFF;
                border-radius: 4px;
                cursor: text;
                margin: 40px auto;
                "
              >
                12l3jlk124jkl
              </p>
          
              <hr>
          
              <p style="color: #cec2e0;font-size: 14px;">If you didn't create this request, your account might be hacked! ⚠️</p>
              <a href="/" style="color: #cec2e0;font-size: 14px;">vtech-seven.vercel.app</a>
            </div>
          </div>
        `
      }).then((res) => { console.log("Email sent: %s", res.messageId) });
    }
  );
};
