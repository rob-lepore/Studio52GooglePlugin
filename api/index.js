const express = require('express');
const fs = require('fs');
const { OAuth2Client } = require('google-auth-library');
const { calendar } = require('googleapis/build/src/apis/calendar');
const { loadEvents } = require('../loadEvents');
const { getNewToken } = require('../getNewToken');
const dotenv = require("dotenv")

const app = express();
const port = 3000; // Use the port you prefer

app.use(express.json());
app.use(express.static('public'));

dotenv.config();

app.post('/api/load-events', async (req, res) => {
  try {
    const calIDPath = 'calendar.txt';
    const credentials = require('../credentials.json');
    const tokenPath = 'token.json';
    await fs.promises.writeFile(calIDPath, req.body.calID);
    const calID = req.body.calID;

    const { redirect_uris } = credentials.installed;
    client_secret = process.env.CLIENT_SECRET;
    client_id = process.env.CLIENT_ID; 
    const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

    let token;
    try {
      token = await fs.promises.readFile(tokenPath);
      oAuth2Client.setCredentials(JSON.parse(token));
    } catch (error) {
      token = await getNewToken(oAuth2Client);
      await fs.promises.writeFile(tokenPath, JSON.stringify(token));
    }

    result = await loadEvents(oAuth2Client, calID);
    if(result == 0) {
      res.status(200).json({text: "Eventi aggiornati correttamente!"});
    } else if (result == 1) {
      res.status(500).json({text: "Errore di connessione al calendario"});
    } else if (result == 2) {
      res.status(500).json({text: "Errore di creazione degli eventi"});
    }

  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
    res.status(500).json({text: "Errore di connessione al calendario"});
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.get("/api/calendarId", (req, res) => {
  calendarId = fs.readFileSync("calendar.txt", { encoding: 'utf8', flag: 'r' });
  res.json({calendarId});
})