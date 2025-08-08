# taime - AI-Powered Time Manager

**taime** is a smart, Progressive Web App (PWA) designed to help you track, manage, and analyze your time with the power of Artificial Intelligence. Built with React, TypeScript, and TailwindCSS, and powered by Vite, it's optimized for high performance and easy deployment.

## Core Features

- **Task & Time Tracking:** Easily create tasks and track the time spent on each with a simple play/pause timer.
- **AI-Powered Productivity Analysis:** Utilize the Gemini API to automatically categorize your completed tasks, identify how you spend your time, and receive actionable insights to improve your focus and productivity.
- **Weekly History & Goal Setting:** View your tracked time over the week, set weekly hour goals, and track your progress.
- **Gamification:** Earn points and level up by completing tasks, adding a motivational layer to your productivity.
- **Real-time Insights:** Receive gentle, AI-generated reminders to take a break during long work sessions (Pomodoro-style).
- **Data Export & Import:** Backup your entire task history as a JSON or CSV file and import it back at any time. Your data stays with you.
- **Offline First (PWA):** Install taime on your desktop or mobile device and use it even without an internet connection.

---

## Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or newer recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a file named `.env.local` in the root of the project by copying the example file:
```bash
cp .env.example .env.local
```
Now, open `.env.local` and add your secret keys:
```
VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
VITE_GOOGLE_CLIENT_ID="YOUR_GOOGLE_OAUTH_CLIENT_ID"
VITE_GOOGLE_API_KEY="YOUR_GOOGLE_CLOUD_API_KEY"
```
See the **Integrations** section below for instructions on how to get these keys.

### 4. Run the Development Server
```bash
npm run dev
```
The application should now be running on `http://localhost:5173`.

---

## Available Scripts
- `npm run dev`: Starts the development server.
- `npm run build`: Bundles the app for production.
- `npm run preview`: Serves the production build locally.

---

## Deployment to Vercel

This project is optimized for deployment on [Vercel](https://vercel.com/).

1.  **Push to GitHub:** Create a repository on GitHub and push your code.
2.  **Import Project on Vercel:**
    *   Sign up or log in to your Vercel account.
    *   Click "Add New..." > "Project".
    *   Import the repository from GitHub.
3.  **Configure Environment Variables:** This is a crucial step for the deployed application to function correctly.
    *   In your Vercel project dashboard, go to the **Settings** tab.
    *   Select **Environment Variables** from the side menu.
    *   Add the following variables one by one, ensuring the names match exactly. The values should be the same secret keys you used in your local `.env.local` file.
        *   `VITE_GEMINI_API_KEY`: Your API key for Google's Gemini.
        *   `VITE_GOOGLE_CLIENT_ID`: Your OAuth Client ID for Google Calendar integration.
        *   `VITE_GOOGLE_API_KEY`: Your Google Cloud project API key for Google Calendar.
    *   Refer to the **Integrations** section below for detailed instructions on how to obtain each of these keys.
4.  **Deploy:** Click "Deploy". Vercel will automatically detect the Vite configuration, build your project, and deploy it. The Jira API proxy will be deployed as a serverless function automatically.

---

## Integrations

### Gemini API (Required)

The core analysis feature is powered by Google's Gemini API.

1.  **Get an API Key:** Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to create your API key.
2.  **Set Up the App:** Add the key to your `.env.local` file as `VITE_GEMINI_API_KEY`.

### Google Calendar Integration

Sync your completed tasks directly to your Google Calendar.

#### **Configuration Steps:**

1.  **Create a Google Cloud Project:**
    *   Go to the [Google Cloud Console](https://console.cloud.google.com/).
    *   Create a new project.

2.  **Enable the Google Calendar API:**
    *   In your new project, navigate to "APIs & Services" > "Library".
    *   Search for "Google Calendar API" and enable it.

3.  **Create OAuth 2.0 Credentials:**
    *   Go to "APIs & Services" > "Credentials".
    *   Click "Create Credentials" and select "OAuth client ID".
    *   Configure the consent screen (choose "External" and provide required info).
    *   Select "Web application" as the application type.
    *   Under "Authorized JavaScript origins", add your local and deployed URLs (e.g., `http://localhost:5173` and your Vercel URL).
    *   Click "Create". You will be given a **Client ID** and a standard **API Key** (if you don't have one).

4.  **Set Up the App:**
    *   Add the **Client ID** to your `.env.local` file as `VITE_GOOGLE_CLIENT_ID`.
    *   Add the **API Key** to your `.env.local` file as `VITE_GOOGLE_API_KEY`.
    *   Navigate to the "Settings" page in the app and click "Connect with Google".

### Jira Integration

Log the time you track in taime directly to your Jira issues.

#### **Configuration Steps:**

1.  **Create a Jira API Token:**
    *   Go to [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens).
    *   Click "Create API token", give it a label, and copy the token.

2.  **Set Up the App:**
    *   Navigate to the "Settings" page in the app.
    *   Enter your Jira Domain, Jira Email, and the API Token you just created.
    *   Click "Save Jira Config" and "Test Connection".