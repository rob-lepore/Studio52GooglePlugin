const { google } = require('googleapis');
const axios = require('axios');


async function loadEvents(auth, calID) {
  console.log('Cancellazione eventi in corso...');

  const calendar = google.calendar({ version: 'v3', auth });

  try {
    const response = await calendar.events.list({ calendarId: calID });
    const events = response.data.items;

    for (const event of events) {
      const eventId = event.id;
      await calendar.events.delete({ calendarId: calID, eventId });
      console.log(`Event deleted: ${event.summary}`);
    }

    console.log('Cancellazione eventi completata.');

    const apiResponse = await axios.get('https://studio52.vercel.app/api/events/all');
    const apiEvents = apiResponse.data;

    const currentDate = new Date().toISOString().split('T')[0];

    for (const apiEvent of apiEvents) {
      try {
        const eventDay = apiEvent.start.split('T')[0];
        if (eventDay < currentDate) {
          continue;
        }

        const newEvent = apiEvent.allDay
          ? {
            summary: apiEvent.title,
            description: apiEvent.description || '',
            start: { dateTime: apiEvent.start },
            end: { dateTime: apiEvent.start.slice(0, 10) + 'T02:00:00+00' },
          }
          : {
            summary: apiEvent.title,
            description: apiEvent.description || '',
            start: { dateTime: apiEvent.start },
            end: { dateTime: apiEvent.end },
          };

        await calendar.events.insert({ calendarId: calID, resource: newEvent });
        console.log(`Event created: ${apiEvent.title}`);
      } catch (error) {
        console.error(`Error creating event: ${error.message}`);
        return 2;
      }
    }
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
    return 1;
  }
  return 0;
}
exports.loadEvents = loadEvents;
