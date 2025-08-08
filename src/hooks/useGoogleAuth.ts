import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';

// These are now injected by Vite from your .env.local file
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// The scopes needed for Google Calendar API.
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

export const useGoogleAuth = () => {
    const [gapi, setGapi] = useState<any>(null);
    const [googleAuth, setGoogleAuth] = useState<any>(null);
    const [isSignedIn, setIsSignedIn] = useLocalStorage('taime-gauth-signedin', false);
    const [user, setUser] = useLocalStorage<any>('taime-gauth-user', null);

    const updateSigninStatus = useCallback((signedIn: boolean) => {
        setIsSignedIn(signedIn);
        if (signedIn) {
            setUser(googleAuth.currentUser.get());
        } else {
            setUser(null);
        }
    }, [googleAuth, setIsSignedIn, setUser]);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
            console.error("Google Auth credentials are not configured in your environment variables.");
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            window.gapi.load('client:auth2', () => {
                window.gapi.client.init({
                    apiKey: GOOGLE_API_KEY,
                    clientId: GOOGLE_CLIENT_ID,
                    scope: SCOPES,
                    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
                }).then(() => {
                    setGapi(window.gapi);
                    const authInstance = window.gapi.auth2.getAuthInstance();
                    setGoogleAuth(authInstance);
                    updateSigninStatus(authInstance.isSignedIn.get());
                    authInstance.isSignedIn.listen(updateSigninStatus);
                }).catch((error: any) => {
                    console.error("Error initializing Google API client", error);
                });
            });
        };
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
              document.body.removeChild(script);
            }
        };
    }, [updateSigninStatus]);

    const signIn = () => {
        if (googleAuth) {
            googleAuth.signIn();
        } else {
            console.error("Google Auth not initialized. Please check your API keys.");
        }
    };

    const signOut = () => {
        if (googleAuth) {
            googleAuth.signOut();
        }
    };

    return {
        gapi,
        isSignedIn,
        user,
        signIn,
        signOut,
    };
};