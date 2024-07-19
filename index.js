const express = require('express');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
 const cors = require('cors');
 const app = express();

 dotenv.config();
 const prisma = new PrismaClient();
 app.use(bodyParser.json());
 
 app.use(cors());
app.get('/',async(req,res)=>{
    res.send("Hello World");
})


app.post('/api/referrals', async (req, res) => {
  const { referrerName, referrerEmail, refereeName, refereeEmail } = req.body;

  if (!referrerName || !referrerEmail || !refereeName || !refereeEmail) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const referral = await prisma.referral.create({
      data: { referrerName, referrerEmail, refereeName, refereeEmail }
    });

    const transporter =await nodemailer.createTransport({
    //   host: 'smtp.ethereal.email',
    //   port: 587,
    //   secure:false,
    service:"gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: refereeEmail,
      subject: 'Course Referral',
      text: `Hello ${refereeName},\n\n${referrerName} has referred you for a course.\n\nBest Regards,\nCourse Team`
    };

   transporter.sendMail(mailOptions, (error,info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to send email' });
      }
      res.status(200).json({ message: 'Referral submitted successfully' });
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to submit referral' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
