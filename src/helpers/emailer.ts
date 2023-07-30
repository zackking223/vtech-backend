import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

export const emailer = async (from : string, to : string, protocol : string, host : string, userId : string) => {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  //Nodemailer configuration
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASSWORD
    }
  });

  // send mail with defined transport object
  // let info = await transporter.sendMail({
  //   from: '"Fred Foo 👻" <foo@example.com>', // sender address
  //   to: "bar@example.com, baz@example.com", // list of receivers
  //   subject: "Hello ✔", // Subject line
  //   text: "Hello world?", // plain text body
  //   html: "<b>Hello world?</b>", // html body
  // });

  // console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

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
        html: `<h1>Welcome to Vtech! Please confirm your account!</h1><p><a href="${serverUrl}">Confirm account</a></p>`
      }).then((res) => {console.log("Email sent: %s", res.messageId)});
    }
  )
}
