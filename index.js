//Including Core Node Modules
const fs = require('fs');
const readline = require('readline');

//Including the 'googleapis' module   
const { google } = require('googleapis');

//Setting the scope for the OAuth2 token. 
const SCOPES = ['https://mail.google.com/'];
//Note: this could have been set as https://www.googleapis.com/auth/gmail.send 
//(Sending messages only. No read or modify privileges on mailbox.)
//But nodemailer (node module used in app.js for sending mail) defines the correct 
//scope for its usage as https://mail.google.com/ 
//(Which provides Full access to the account’s mailboxes.)

//Location where the token (Access and Refresh) obtained from OAuth2 will be stored
const TOKEN_FILE = 'token.json';

//Asynchronously reading contents of credentials.json, which stores the client secret
//and client id of my functioning Google Account
fs.readFile('credentials.json', (error, contents) => {

    if (error) {
        return console.log('Could not load File!\n', error);
    }

    authorize(JSON.parse(contents));
});

//Function authorize(credentials) is used to start the OAuth2 process and allow 
//the mailer app to gain access a gmail account 
function authorize(credentials) {
    //destructuring required attributes from the 'web' object in credentials.json
    const { client_secret, client_id, redirect_uris } = credentials.web;

    //creating an oAuth2 object and passing the required values of client secret,
    //client id and redirect uri.(location where the app is directed after the authorisation flow)
    //Note: Redirect uri is set to http://localhost:8080 for testing purposes
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    //Asynchrnously reading token.js
        fs.readFile(TOKEN_FILE, (error, token) => {
        if (error) {
            //If token.js does not exist, create a new token file by calling 
            //getNewToken(oAuth2Client) function
            return getNewToken(oAuth2Client);
        }

        // If token.js already exists, set the credentials of oAuth2Client to the
        //'web' object present in credentials.json
        oAuth2Client.setCredentials(JSON.parse(token));
    });
}

function getNewToken(oAuth2Client) {
    //Creating a url for the user to authorise the app
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });

    console.log('Authorise this app by visiting this URL:\n'+authUrl);

    //Creating simple CLI I/O for inputting the code provided by the user
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Please enter the code from the url of page you visited, here:', (code) => {
        rl.close();

        //Getting the token for the given code 
        oAuth2Client.getToken(code, (error, token) => {
            if (error) {
                //if code is incorrect or there is an invalid_grant
                return console.log('Could not retrive Access Token!\n', error);
            }

            //if code is correct, setting credentials to the obtained token
            oAuth2Client.setCredentials(token);

            //Storing the token in the token.js file
            fs.writeFile(TOKEN_FILE, JSON.stringify(token), (error) => {
                if (error) return console.log(error);

                console.log('Token stored in: ', TOKEN_FILE);
            });
        });
    });
}

