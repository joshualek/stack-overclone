Lek Kai Hin Joshua  
A0273836U  

---

📦 Database details and instructions for deploying your project

To set up and run this project locally:

1. Ensure MongoDB is installed and running locally on the default port (mongodb://127.0.0.1:27017).
2. Navigate to the project directory:
   > cd stack-overclone
3. Install dependencies:
   > npm install
4. Start the server:
   > npm run server
5. MongoDB will automatically connect to the database `stack-overclone` and seed it with dummy data (5 users, sample questions, answers) if the users collection is empty.

The database includes two main collections:
- `users`: stores user info like username, email, password (plain-text for this prototype), bio, and profilePic path.
- `questions`: stores questions and embedded answers, each with votes, tags, and timestamps.

---

✨ Extra Features Implemented

Beyond the core required features from the assignment, the following enhancements have been added:

✅ **Dynamic Home Page**  
- Shows different content depending on whether a user is logged in.
- Guests see "Join Now" and "Create Your Account" prompts, while logged-in users do not.

✅ **User Profile Page**
- Shows all questions the user asked and answered, in a card layout with votes, tags, and timestamps.
- Users can click on the tags to view a list of questions filtered by the tag
- Includes in-page profile editing WITH VALIDATIONS.

✅ **Voting System (Toggleable)**
- Buttons are disabled for one’s own questions/answers and for unauthenticated users, it will prompt them to login.

✅ **Tag-Based Filtering**
- Tags are clickable from anywhere (question cards, user profile, etc).
- Redirects and filters the main question list by tag via query params.

✅ **Sort Functionality**
- Users can sort all questions by:
  - Most Recent
  - "Hot" (based on vote counts)
  - combined sorting with Tags

✅ **Dummy Data Seeding**
- On first launch (if no users exist), the database is seeded with:
  - 5 users
  - Multiple questions with varying tags and vote counts
  - Answers from different users to simulate engagement

✅ **UI Enhancements**
- Responsive, mobile-friendly Bootstrap layout
- Sticky navbar with active links
- Animated buttons and clean spacing
- Cards for all question listings with full stretched-link behavior (except for functional buttons like votes and tags)

✅ **Error Feedback on Edit**
- Displays alerts if username/email is already taken during profile editing
- Maintains entered values on validation error

---
