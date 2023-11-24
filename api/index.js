const express = require('express');
const fs = require('fs');
const { OAuth2Client } = require('google-auth-library');
const { loadEvents } = require('../loadEvents');
const { getNewToken } = require('../getNewToken');
const dotenv = require("dotenv")
const axios = require('axios');
const mongoose = require("mongoose");


const app = express();
const port = 3000; // Use the port you prefer

app.use(express.json());
app.use(express.static('public'));

dotenv.config();

const mongoURI = `mongodb+srv://robertoleporerl:${process.env.DB_PASSWORD}@codes.ruestiq.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(mongoURI, {});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

const Calendar = require("../models/calendar");



app.post('/api/load-events', async (req, res) => {
  try {
    const credentials = require('../credentials.json');
    const tokenPath = 'token.json';
    const calID = req.body.calID;

    let calendars = await Calendar.find({})
    calendars[0].code = calID;
    calendars[0].save();

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

app.get("/api/calendarId", async (req, res) => {
  const calendars = await Calendar.find({})
  res.json({calendarId: calendars[0].code});
})