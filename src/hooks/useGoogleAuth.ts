import { useState, useEffect, useCallback, useRef } from 'react';
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
    
    const initInProgress = useRef(false);

    const initializeGapiClient = useCallback(async () => {
        try {
            await window.gapi.client.init({
                apiKey: GOOGLE_API_KEY,
                discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
            });
            setGapi(window.gapi);
        } catch (error) {
            console.error("Error initializing Google API client:", error);
        }
    }, []);

    const initializeTokenClient = useCallback(() => {
        if (!window.google || !window.google.accounts) return;
        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: SCOPES,
            callback: async (tokenResponse: any) => {
                if (tokenResponse && tokenResponse.access_token) {
                    setIsSignedIn(true);
                    
                    window.gapi.client.setToken(tokenResponse);
                    
                    try {
                        const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                            headers: { 'Authorization': `Bearer ${tokenResponse.access_token}` }
                        });
                        if (profileResponse.ok) {
                            const profile = await profileResponse.json();
                            setUserProfile({ email: profile.email, name: profile.name, picture: profile.picture });
                        } else {
                             console.error("Error fetching user profile:", profileResponse.statusText);
                             setIsSignedIn(false);
                             setUserProfile(null);
                        }
                    } catch (error) {
                        console.error("Error fetching user profile:", error);
                        setIsSignedIn(false);
                        setUserProfile(null);
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

        if (initInProgress.current) return;
        initInProgress.current = true;

        const checkScripts = () => {
            if (window.gapi && window.google) {
                window.gapi.load('client', initializeGapiClient);
                initializeTokenClient();
            } else {
                setTimeout(checkScripts, 100);
            }
        };

        checkScripts();
    }, [initializeGapiClient, initializeTokenClient]);

    const signIn = () => {
        if (tokenClient) {
            tokenClient.requestAccessToken({ prompt: '' });
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