const { google } = require('googleapis');
const key = require(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE); // Path to your service account key file

const SCOPES = ['https://www.googleapis.com/auth/calendar'];


const auth = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: SCOPES,
});


const calendar = google.calendar({ version: 'v3', auth });



interface EventDetails{
    summary:String,
    location:String,
    start:{
        dateTime: String
    },
    end:{
        dateTime:String
    }
    userEmail: String,
    speakerEmail:String
}

export async function createEvent(eventDetails:EventDetails) {

    console.log(eventDetails);

    const event = {
        summary: eventDetails.summary,
        location: eventDetails.location,
        description: 'A session on latest cloud technologies',
        start: {
            dateTime: eventDetails.start.dateTime,
            timeZone: 'Asia/Kolkata',
        },
        end: {
            dateTime: eventDetails.end.dateTime,
            timeZone: 'Asia/Kolkata',
        },
        attendees: [
            {email: eventDetails.userEmail },
            {email: eventDetails.speakerEmail}

        ],
    };

    try {
        const response = await calendar.events.insert({
            calendarId: 'primary', 
            resource: event,
            sendUpdates: 'all' 
            
        });
        console.log('Event created:', response.data.htmlLink);
    } catch (error) {
        console.error('Error creating event:', error);
    }
}


