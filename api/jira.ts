import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Buffer } from 'buffer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const {
            'x-jira-domain': jiraDomain,
            'x-jira-email': jiraEmail,
            'x-jira-api-token': jiraApiToken,
        } = req.headers;

        if (!jiraDomain || !jiraEmail || !jiraApiToken || typeof jiraDomain !== 'string' || typeof jiraEmail !== 'string' || typeof jiraApiToken !== 'string') {
            return res.status(400).json({ error: 'Missing Jira credentials in request headers' });
        }

        const { method, path, body } = req.body;
        
        if (!method || !path) {
            return res.status(400).json({ error: 'Missing method or path in request body' });
        }

        const jiraUrl = `https://` + jiraDomain + `/rest/api/3/` + path;
        
        const auth = Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64');

        const jiraResponse = await fetch(jiraUrl, {
            method: method,
            headers: {
                'Authorization': `Basic ${auth}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        // Try to parse the response as JSON, but fall back to text if it fails
        let responseBody;
        const contentType = jiraResponse.headers.get('Content-Type');
        try {
            if (contentType && contentType.includes('application/json')) {
                responseBody = await jiraResponse.json();
            } else {
                responseBody = await jiraResponse.text();
            }
        } catch(e) {
            responseBody = await jiraResponse.text();
        }

        // Forward headers from Jira response to client
        res.setHeader('Content-Type', contentType || 'application/json');
        
        return res.status(jiraResponse.status).send(responseBody);

    } catch (error) {
        console.error("Jira proxy internal error:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
