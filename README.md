<!-- [LOG] Accessed README.md for documentation -->
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/77a49664-12cd-47f0-bc04-aa11eb77f5db

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/77a49664-12cd-47f0-bc04-aa11eb77f5db) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/77a49664-12cd-47f0-bc04-aa11eb77f5db) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## How does the PWA work?

- The app is a Progressive Web App (PWA), which means it can be installed on desktops and mobile devices directly from the browser.
- It uses a service worker (`public/sw.js`) to cache assets and enable offline access.
- Data is stored locally in the browser using PouchDB (IndexedDB).
- When online, data is synchronized in real-time with CouchDB, allowing multiple devices to see live updates.
- The app supports background sync, push notifications, and offline-first usage.
- Users can install the app via the browser's "Install" prompt for a native-like experience.

## How to run CouchDB

**On Ubuntu/Debian:**
```sh
sudo apt update
sudo apt install couchdb
sudo systemctl start couchdb
sudo systemctl enable couchdb
```

**On Windows:**
- Download CouchDB from [https://couchdb.apache.org/](https://couchdb.apache.org/)
- Run the installer and follow the setup instructions.
- Start CouchDB from the Start Menu or Services.

**Verify CouchDB is running:**
- Open your browser and go to: [http://localhost:5984/_utils](http://localhost:5984/_utils)
- You should see the CouchDB admin interface.
