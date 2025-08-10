import { useState, useEffect, useCallback, useRef } from 'react';
import useLocalStorage from './useLocalStorage';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';

export const useGoogleAuth = () => {
    const [tokenClient, setTokenClient] = useState<any>(null);
    const [gapiReady, setGapiReady] = useState(false);
    const [isAuthReady, setIsAuthReady] = useState(false);

    const [isSignedIn, setIsSignedIn] = useLocalStorage('taime-gauth-signedin', false);
    const [user, setUser] = useLocalStorage<any>('taime-gauth-user', null);
    const [accessToken, setAccessToken] = useLocalStorage<string | null>('taime-gauth-token', null);

    const gapiLoaded = useRef(false);
    const gisLoaded = useRef(false);

    const signOut = useCallback(() => {
        if (accessToken && window.google?.accounts?.oauth2) {
            window.google.accounts.oauth2.revoke(accessToken, () => {});
        }
        setAccessToken(null);
        setIsSignedIn(false);
        setUser(null);
        if (window.gapi?.client) {
            window.gapi.client.setToken(null);
        }
    }, [accessToken, setAccessToken, setIsSignedIn, setUser]);
    
    // Step 1: Initialize GAPI client for API calls
    const initGapiClient = useCallback(async () => {
        try {
            await window.gapi.client.init({
                apiKey: GOOGLE_API_KEY,
                discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
            });
            setGapiReady(true);
        } catch (error) {
            console.error("Error initializing GAPI client", error);
        }
    }, []);

    // Step 2: Load GAPI script
    useEffect(() => {
        if (gapiLoaded.current || !GOOGLE_API_KEY) return;
        
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => window.gapi.load('client', initGapiClient);
        document.body.appendChild(script);
        gapiLoaded.current = true;

    }, [initGapiClient]);

    // Step 3: Load GIS script and initialize token client
    useEffect(() => {
        if (gisLoaded.current || !GOOGLE_CLIENT_ID) {
            // If no client ID is present, we can consider auth 'ready' but it will fail on click.
            // This prevents the button from being permanently disabled.
            if (!GOOGLE_CLIENT_ID) {
              console.warn("Google Client ID is not set. Google Sign-In will not function.");
            }
            setIsAuthReady(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            gisLoaded.current = true;
            try {
                const client = window.google!.accounts.oauth2.initTokenClient({
                    client_id: GOOGLE_CLIENT_ID,
                    scope: SCOPES,
                    callback: (tokenResponse: any) => {
                        if (tokenResponse && tokenResponse.access_token) {
                            setAccessToken(tokenResponse.access_token);
                            setIsSignedIn(true);
                        } else {
                            console.error("Authentication failed, no access token.", tokenResponse);
                            signOut();
                        }
                    },
                    error_callback: (error: any) => {
                        console.error("Authentication error:", error);
                    }
                });
                setTokenClient(client);
            } catch (error) {
                console.error("Error initializing GIS client", error);
            } finally {
                setIsAuthReady(true);
            }
        };
        script.onerror = () => {
            gisLoaded.current = true;
            setIsAuthReady(true); // Unblock UI even if script fails to load
            console.error("Failed to load Google Identity Services script.");
        };
        document.body.appendChild(script);

    }, [setAccessToken, setIsSignedIn, signOut]);

    // Step 4: When access token changes, set it for GAPI and fetch user info
    useEffect(() => {
        const fetchUser = async () => {
             if (gapiReady && accessToken) {
                window.gapi.client.setToken({ access_token: accessToken });
                try {
                    // Use a more specific user info endpoint
                    const response = await window.gapi.client.request({
                        path: 'https://www.googleapis.com/oauth2/v2/userinfo'
                    });
                    setUser(response.result);
                } catch (e: any) {
                    console.error('Error fetching user profile', e);
                    if (e.status === 401) { // Token likely expired or revoked
                        signOut();
                    }
                }
            }
        };
        fetchUser();
    }, [gapiReady, accessToken, setUser, signOut]);


    const signIn = () => {
        if (tokenClient) {
            // Prompt for consent if needed, or just get the token
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            console.error("Google Identity Services not initialized yet. Please wait or check configuration.");
        }
    };

    return {
        gapi: gapiReady ? window.gapi : null,
        isAuthReady,
        isSignedIn,
        user,
        signIn,
        signOut,
    };
};