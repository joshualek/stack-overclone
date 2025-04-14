📦 Database details and instructions for deploying the backend

To set up and run this project locally:

1. Ensure MongoDB is installed and running locally on the default port (mongodb://127.0.0.1:27017).
2. Navigate to the backend directory:
   ```bash
   cd backend
4. Install dependencies:
   ```bash
   npm install
5. Start the server:
   ```bash
   npm run server
6. MongoDB will automatically connect to the database `stack-overclone` and seed it with dummy data (5 users, sample questions, answers) if the users collection is empty.
7. The app will run at http://localhost:3000

The database includes two main collections:
- `users`: stores user info like username, email, password (plain-text for this prototype), bio, and profilePic path.
- `questions`: stores questions and embedded answers, each with votes, tags, and timestamps.

📘 Frontend details and instructions for running the client

To launch and use the frontend locally:

1. Navigate to the frontend directory:
   ```bash
   cd frontend
2. Install dependencies:
   ```bash
   npm install

3. Start the server:
   ```bash
   npm run server
  
4. The app will run at http://localhost:5173 (or another available port if 5173 is occupied).

### 🔐 Login Instructions

To log in, use any of the following predefined usernames:

> `alice`, `bob`, `charlie`, `diana`, `edward`  
> **Password**: `user`

Alternatively, you can register a new user by providing any unique:
- Username
- Email
- Password

