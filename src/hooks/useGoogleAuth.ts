import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

declare global {
    interface Window {
        google: any;
        gapi: any;
    }
}

export const useGoogleAuth = () => {
    const [tokenClient, setTokenClient] = useState<any>(null);
    const [gapi, setGapi] = useState<any>(null);
    const [isSignedIn, setIsSignedIn] = useLocalStorage('taime-gauth-signedin', false);
    const [userProfile, setUserProfile] = useLocalStorage<any>('taime-gauth-profile', null);

    const loadGapiClient = useCallback(async () => {
        const gapiInstance = await new Promise<any>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                window.gapi.load('client', () => {
                    window.gapi.client.init({ apiKey: GOOGLE_API_KEY })
                        .then(() => {
                           window.gapi.client.load('https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest')
                              .then(() => resolve(window.gapi));
                        })
                        .catch(reject);
                });
            };
            script.onerror = reject;
            document.body.appendChild(script);
        });
        setGapi(gapiInstance);
    }, []);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
            console.error("Google Auth credentials are not configured.");
            return;
        }

        loadGapiClient();

        const client = window.google?.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: SCOPES,
            callback: async (tokenResponse: any) => {
                if (tokenResponse && tokenResponse.access_token) {
                    setIsSignedIn(true);
                    window.gapi.client.setToken(tokenResponse);

                    // Fetch user profile info
                    try {
                        const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                            headers: {
                                'Authorization': `Bearer ${tokenResponse.access_token}`
                            }
                        });
                        if (profileResponse.ok) {
                            const profile = await profileResponse.json();
                            setUserProfile(profile);
                        }
                    } catch (error) {
                        console.error("Error fetching user profile:", error);
                    }
                }
            },
        });
        setTokenClient(client);
    }, [loadGapiClient, setIsSignedIn, setUserProfile]);

    const signIn = () => {
        if (tokenClient) {
            // Prompt the user to select an account and grant access
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            console.error("Google Auth client not initialized.");
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