import { Task } from '../types';

// This function assumes the GAPI client is loaded and the user is authenticated.
// In a real app, you would pass the gapi object or handle auth state here.
export const createCalendarEvent = async (task: Task) => {
    if (!window.gapi || !window.gapi.client.calendar) {
        throw new Error('Google Calendar API not loaded.');
    }

    if (!task.completionDate) {
        throw new Error('Task must have a completion date to be synced.');
    }

    const endDate = new Date(task.completionDate);
    const startDate = new Date(endDate.getTime() - task.elapsedSeconds * 1000);

    const event = {
        'summary': task.name,
        'description': task.description || 'Tracked with taime app.',
        'start': {
            'dateTime': startDate.toISOString(),
            'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        'end': {
            'dateTime': endDate.toISOString(),
            'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
    };

    try {
        const request = window.gapi.client.calendar.events.insert({
            'calendarId': 'primary',
            'resource': event,
        });

        const response = await request;
        console.log('Event created: ', response.result);
        return response.result;
    } catch (error) {
        console.error('Error creating calendar event:', error);
        throw new Error('Failed to create calendar event.');
    }
};
