const SCOPES = ['https://www.googleapis.com/auth/calendar'];


async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this url:', authUrl);

  return new Promise((resolve, reject) => {
    console.log('Paste the code from that page here:');
    process.stdin.once('data', async (code) => {
      try {
        const { tokens } = await oAuth2Client.getToken(code.toString().trim());
        resolve(tokens);
      } catch (error) {
        reject(error);
      }
    });
  });
}
exports.getNewToken = getNewToken;
