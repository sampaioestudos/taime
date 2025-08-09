import { JiraConfig, JiraIssue } from '../types';

/**
 * Converts seconds to Jira's time tracking format (e.g., '1h 30m').
 * Minimum value is '1m'.
 */
const formatSecondsForJira = (totalSeconds: number): string => {
    if (totalSeconds < 60) {
        return '1m'; // Jira requires at least 1 minute
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    let timeString = '';
    if (hours > 0) {
        timeString += `${hours}h `;
    }
    if (minutes > 0) {
        timeString += `${minutes}m`;
    }

    return timeString.trim();
};

const callJiraApi = async (config: JiraConfig, method: 'GET' | 'POST', path: string, body?: any) => {
    const response = await fetch('/api/jira', {
        method: 'POST', // The proxy endpoint is always POST
        headers: {
            'Content-Type': 'application/json',
            // Pass Jira config to the proxy via headers
            'X-Jira-Domain': config.domain,
            'X-Jira-Email': config.email,
            'X-Jira-Api-Token': config.apiToken,
        },
        body: JSON.stringify({
            method, // 'GET' or 'POST' for the actual Jira API call
            path,   // e.g., 'myself' or 'issue/PROJ-123/worklog'
            body,   // The body for the actual Jira API call
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Jira Proxy Error:', response.status, errorText);
        throw new Error(`Jira API request via proxy failed: ${response.status} ${errorText}`);
    }
    return response;
};

export const testJiraConnection = async (config: JiraConfig): Promise<boolean> => {
    try {
        const response = await callJiraApi(config, 'GET', 'myself');
        return response.ok;
    } catch (error) {
        console.error('Jira connection test failed:', error);
        return false;
    }
};

export const searchJiraIssues = async (config: JiraConfig, searchTerm: string): Promise<JiraIssue[]> => {
    // Sanitize searchTerm to prevent JQL injection
    const sanitizedSearchTerm = searchTerm.replace(/"/g, '\\"').trim();
    if (!sanitizedSearchTerm) return [];

    let jql = `summary ~ "${sanitizedSearchTerm}*" OR description ~ "${sanitizedSearchTerm}*" OR key = "${sanitizedSearchTerm}"`;
    if (config.projectKey) {
        jql = `project = "${config.projectKey.toUpperCase()}" AND (${jql})`;
    }
    jql += ` ORDER BY updated DESC`;

    const bodyData = {
        jql,
        maxResults: 10,
        fields: ["summary", "key"]
    };

    try {
        const response = await callJiraApi(config, 'POST', 'search', bodyData);
        const data = await response.json();
        return data.issues.map((issue: any) => ({
            key: issue.key,
            summary: issue.fields.summary
        }));
    } catch (error) {
        console.error('Jira search failed:', error);
        return [];
    }
};


export const logWorkToJira = async (
    config: JiraConfig,
    issueKey: string,
    timeSpentSeconds: number
): Promise<Response> => {
    const bodyData = {
        timeSpent: formatSecondsForJira(timeSpentSeconds),
        comment: {
            type: 'doc',
            version: 1,
            content: [
                {
                    type: 'paragraph',
                    content: [
                        {
                            type: 'text',
                            text: 'Time logged from taime app.'
                        }
                    ]
                }
            ]
        }
    };

    return callJiraApi(config, 'POST', `issue/${issueKey}/worklog`, bodyData);
};
