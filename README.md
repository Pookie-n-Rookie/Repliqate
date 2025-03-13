# Repliqate 📋

Repliqate is a **digital clipboard application** that allows you to copy and store **text, images, and screenshots** in a database. It provides a seamless way to manage your clipboard history, view past entries, and retrieve them whenever needed. Built with **Go** for the backend and **HTML, CSS, and JavaScript** for the frontend, Repliqate is a lightweight, fast, and user-friendly tool for managing your clipboard data.

---

## Features ✨

- **Copy Text and Images**: Copy text or images (as base64) and store them in a database.
- **Paste Latest Entry**: Retrieve the most recent clipboard entry (text or image).
- **Previous Entry**: Retrieve the second-latest entry from the clipboard history.
- **Clear Clipboard**: Clear the current clipboard content.
- **History Window**: View all clipboard history in a separate, slide-in window.
- **Dark Theme**: Sleek and modern dark theme for a comfortable user experience.
- **Animations**: Smooth fade-in and slide-in animations for a polished look.
- **Database Storage**: All clipboard entries are stored in a **Supabase** database for persistence.

---

## Tech Stack 🛠️

### Backend
- **Go**: A fast and efficient programming language used for the backend.
- **Supabase**: An open-source Firebase alternative used for database storage.
- **HTTP Server**: Built-in Go HTTP server to handle API requests.

### Frontend
- **HTML**: Structure of the web application.
- **CSS**: Styling and animations for a modern and responsive design.
- **JavaScript**: Handles interactions with the backend and dynamic content updates.

---

## How It Works 🚀

### Backend
1. **Copy Endpoint (`/copy`)**:
   - Accepts `POST` requests with `content` (text or base64 image) and `type` (text or image).
   - Stores the content in the **Supabase** database.

2. **Previous Endpoint (`/paste`)**:
   - Accepts `GET` requests.
   - Retrieves the second-latest clipboard entry from the database.

3. **Clear Endpoint (`/clear`)**:
   - Accepts `POST` requests.
   - Clears the current clipboard content.

4. **History Endpoint (`/history`)**:
   - Accepts `GET` requests.
   - Retrieves all clipboard entries from the database, sorted by creation time.

### Frontend
1. **Copy**:
   - Users can enter text or paste an image into the textarea.
   - Clicking the **Copy** button sends the data to the backend for storage.


2. **Previous**:
   - Clicking the **Previous** button retrieves the second-latest entry from the backend.
   - Displays the content (text or image) in the UI.

3. **Clear**:
   - Clicking the **Clear** button clears the current clipboard content.

4. **History**:
   - Clicking the **History** button opens a separate window.
   - Displays all clipboard entries in a scrollable list.

---

## Setup Instructions 🛠️

### Prerequisites
- **Go** installed on your machine.
- **Supabase** account and project setup.
- A `.env` file with the following variables:
  ```env
  SUPABASE_URL=https://your-supabase-url.supabase.co
  SUPABASE_KEY=your-supabase-anon-key
  PORT=the port you want
  ```
  
  
