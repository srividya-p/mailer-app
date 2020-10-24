//Including core node modules
const fs = require('fs');

//Including the 'nodemailer'module
const nodemailer = require('nodemailer');

//Synchronously reading the contents of token.json and credentials.json to 
//get details for sending an email.
let token = JSON.parse(fs.readFileSync('token.json'));
let credentials = JSON.parse(fs.readFileSync('credentials.json'));

//Using SMTP with OAuth2 type Authorisation for sending email and providing the 
//necessary details from files that were read.
const smtpTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type: "OAuth2",
        user: "srividya.subramanian77@gmail.com",
        clientId: credentials.web.client_id,
        clientSecret: credentials.web.client_secret,
        refreshToken: token.refresh_token,
        accessToken: token.access_token
    },
    tls: {
        rejectUnauthorized: false
    }
});

//Configuing options fo the email to be sent bu setting the from, to and the content
//to be sent
const mailOptions = {
    from: "srividya.subramanian77@gmail.com",
    to: "scs1.laptop@gmail.com",
    subject: "Node.js Email with Secure OAuth",
    generateTextFromHTML: true,
    html: "<b>test</b>"
};

//Using the smtpTransport object to send a mail and logging out the response
smtpTransport.sendMail(mailOptions, (error, response) => {
    if (error) return console.log(error);
    console.log(response);
    smtpTransport.close();
});