import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordEmail = async (email, password) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your New Password",
    text: `Your new password is: ${password}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password email sent to", email);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
