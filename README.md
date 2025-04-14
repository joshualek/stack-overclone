📦 Database details and instructions for deploying the backend

To set up and run this project locally:

1. Ensure MongoDB is installed and running locally on the default port (mongodb://127.0.0.1:27017).
2. Navigate to the backend directory:
   > cd backend
3. Install dependencies:
   > npm install
4. Start the server:
   > npm run server
5. MongoDB will automatically connect to the database `stack-overclone` and seed it with dummy data (5 users, sample questions, answers) if the users collection is empty.

The database includes two main collections:
- `users`: stores user info like username, email, password (plain-text for this prototype), bio, and profilePic path.
- `questions`: stores questions and embedded answers, each with votes, tags, and timestamps.

📘 Frontend details and instructions for running the client

To launch and use the frontend locally:

1. Navigate to the frontend directory:
   ```bash
   cd frontend
2. Install dependencies:
   > npm install

3. Start the server:
   > npm run server
  
4. The app will run at http://localhost:5173 (or another available port if 5173 is occupied).
