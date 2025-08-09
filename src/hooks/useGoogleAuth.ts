import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';

export const useGoogleAuth = () => {
    const [gapiReady, setGapiReady] = useState(false);
    const [gisReady, setGisReady] = useState(false);
    const [tokenClient, setTokenClient] = useState<any>(null);

    const [isSignedIn, setIsSignedIn] = useLocalStorage('taime-gauth-signedin', false);
    const [user, setUser] = useLocalStorage<any>('taime-gauth-user', null);
    const [accessToken, setAccessToken] = useLocalStorage<string | null>('taime-gauth-token', null);

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
    
    const initGapiClient = useCallback(async () => {
        try {
            await window.gapi.client.init({
                apiKey: GOOGLE_API_KEY,
                discoveryDocs: [
                    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
                    "https://www.googleapis.com/discovery/v1/apis/oauth2/v2/rest"
                ],
            });
            setGapiReady(true);
        } catch (error) {
            console.error("Error initializing GAPI client", error);
        }
    }, []);

    const handleGapiLoad = useCallback(() => {
        window.gapi.load('client', initGapiClient);
    }, [initGapiClient]);

    const handleGisLoad = useCallback(() => {
        try {
            const client = window.google.accounts.oauth2.initTokenClient({
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
            setGisReady(true);
        } catch (error) {
            console.error("Error initializing GIS client", error);
        }
    }, [setAccessToken, setIsSignedIn, signOut]);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
            console.error("Google Auth credentials are not configured in your environment variables.");
            return;
        }
        
        const gapiScriptId = 'gapi-script';
        const gisScriptId = 'gis-script';
        
        const gapiScript = document.getElementById(gapiScriptId);
        if(!gapiScript) {
            const script = document.createElement('script');
            script.id = gapiScriptId;
            script.src = 'https://apis.google.com/js/api.js';
            script.async = true;
            script.defer = true;
            script.onload = handleGapiLoad;
            document.body.appendChild(script);
        } else if (!gapiReady) {
            // If script exists but gapi not ready, it might be loading
            gapiScript.addEventListener('load', handleGapiLoad);
        }
        
        const gisScript = document.getElementById(gisScriptId);
        if(!gisScript) {
            const script = document.createElement('script');
            script.id = gisScriptId;
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = handleGisLoad;
            document.body.appendChild(script);
        } else if (!gisReady) {
            gisScript.addEventListener('load', handleGisLoad);
        }
    }, [handleGapiLoad, handleGisLoad, gapiReady, gisReady]);

    useEffect(() => {
        if (gapiReady && accessToken) {
            window.gapi.client.setToken({ access_token: accessToken });
        }
    }, [gapiReady, accessToken]);

    useEffect(() => {
        const fetchUser = async () => {
            if (isSignedIn && gapiReady && accessToken && !user) {
                 try {
                    const response = await window.gapi.client.oauth2.userinfo.get();
                    setUser({ profileObj: response.result });
                } catch (e: any) {
                    if (e.result?.error?.code === 401 || e.status === 401) {
                       signOut();
                    }
                    console.error('Error fetching user profile', e);
                }
            }
        };
        fetchUser();
    }, [isSignedIn, gapiReady, accessToken, user, setUser, signOut]);

    const signIn = () => {
        if (tokenClient) {
            tokenClient.requestAccessToken({ prompt: '' });
        } else {
            console.error("Google Identity Services not initialized yet. Please wait.");
        }
    };

    return {
        gapi: gapiReady ? window.gapi : null,
        isSignedIn,
        user,
        signIn,
        signOut,
    };
};