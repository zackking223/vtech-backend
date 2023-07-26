import nodemailer from "nodemailer";

//Run backend using a wsl if you want to use SENDMAIL
// async..await is not allowed in global scope, must use a wrapper
async function main() {
  let transporter = nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/usr/sbin/sendmail'
});
transporter.sendMail({
    from: 'dinhhaiancut@example.com',
    to: '20212896@eaut.edu.vn',
    subject: 'Nodemailer - SENDMAIL TRANSPORT',
    text: 'I hope this message gets delivered!'
}, (err, info) => {
    if (err) console.log(err);
    console.log(info.envelope);
    console.log(info.messageId);
});
}

main().catch(console.error);
