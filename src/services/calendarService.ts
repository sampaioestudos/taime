import { Task } from '../types';

export const createCalendarEvent = async (task: Task, gapi: any) => {
    if (!gapi || !gapi.client || !gapi.client.calendar) {
        throw new Error('Google Calendar API client not available.');
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
        const request = gapi.client.calendar.events.insert({
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
