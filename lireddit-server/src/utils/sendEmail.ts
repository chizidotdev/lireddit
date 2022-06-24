import nodemailer from "nodemailer";

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(to: string, html: string): Promise<void> {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();

  // console.log("testAccount", testAccount);

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "qkogbandf7tq7yuh@ethereal.email", // generated ethereal user
      pass: "rdZTvZBBVyK7Q6Cjqx", // generated ethereal password
    },
  });

  console.log("\n Hey got passed the Transporter \n");
  console.log(
    "...===============waiting for the mail to send==============..."
  );

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to, // list of receivers
    subject: "Change password", // Subject line
    html,
    text: "This is the text", // plain text body
  });

  console.log("\n Hey got passed the info \n");

  console.log("Message sent: %s", info.messageId);

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
