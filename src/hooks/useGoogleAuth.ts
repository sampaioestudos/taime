import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

interface UserProfile {
    email: string;
    name: string;
    picture: string;
}

export const useGoogleAuth = () => {
    const [gapi, setGapi] = useState<any>(null);
    const [tokenClient, setTokenClient] = useState<any>(null);
    const [isSignedIn, setIsSignedIn] = useLocalStorage('taime-gauth-signedin', false);
    const [userProfile, setUserProfile] = useLocalStorage<UserProfile | null>('taime-gauth-profile', null);

    const initializeGapiClient = useCallback(async () => {
        await window.gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        });
        setGapi(window.gapi);
    }, []);

    const initializeTokenClient = useCallback(() => {
        if (!window.google || !window.google.accounts) return;
        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: SCOPES,
            callback: async (tokenResponse: any) => {
                if (tokenResponse && tokenResponse.access_token) {
                    setIsSignedIn(true);
                    
                    // The gapi client needs the token to be set to make authorized calls
                    window.gapi.client.setToken(tokenResponse);
                    
                    // Fetch user profile info
                    try {
                        const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                            headers: { 'Authorization': `Bearer ${tokenResponse.access_token}` }
                        });
                        if (profileResponse.ok) {
                            const profile = await profileResponse.json();
                            setUserProfile({ email: profile.email, name: profile.name, picture: profile.picture });
                        }
                    } catch (error) {
                        console.error("Error fetching user profile:", error);
                    }
                }
            },
        });
        setTokenClient(client);
    }, [setIsSignedIn, setUserProfile]);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
            console.error("Google Auth credentials are not configured.");
            return;
        }

        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.async = true;
        gapiScript.defer = true;
        gapiScript.onload = () => window.gapi.load('client', initializeGapiClient);
        document.body.appendChild(gapiScript);

        const gsiScript = document.getElementById('google-gsi-client');
        if (gsiScript) {
             gsiScript.onload = () => initializeTokenClient();
        }

        return () => {
            if (document.body.contains(gapiScript)) {
                document.body.removeChild(gapiScript);
            }
        };
    }, [initializeGapiClient, initializeTokenClient]);

    const signIn = () => {
        if (tokenClient) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            console.error("Google Auth client not initialized.");
            // try to initialize again
            initializeTokenClient();
        }
    };

    const signOut = () => {
        if (gapi && gapi.client.getToken()) {
            const accessToken = gapi.client.getToken().access_token;
            if (accessToken) {
                window.google.accounts.oauth2.revoke(accessToken, () => {});
            }
            gapi.client.setToken(null);
        }
        setIsSignedIn(false);
        setUserProfile(null);
    };

    return { gapi, isSignedIn, userProfile, signIn, signOut };
};