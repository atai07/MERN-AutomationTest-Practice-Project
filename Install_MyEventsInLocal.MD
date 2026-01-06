

1. Go to any location in local.
2. Open CMD and Clone git repo Git > Git clone https://github.com/atai07/MERN-AutomationTest-Practice-Project


Your local path:
EG: D:\study\playwright\MERN-AutomationTest-Practice-Project

We will run 3 things:
1️⃣ Backend (Node + Express + MongoDB)
2️⃣ Frontend (React)
3️⃣ MongoDB (Database)



🧩 PART 0: Required Software (One-time setup)
✅ Step 0.1: Install Node.js

1. Open browser
2. Go to 👉 https://nodejs.org
3. Download LTS version
4. Install → keep clicking Next → Next → Finish

✔ Verify installation
Open Command Prompt and run:
node -v
npm -v
If versions show → OK ✅




✅ Step 0.2: Install Git (if not already)
Download: https://git-scm.com
Verify: git --version





✅ Step 0.3: Install MongoDB (IMPORTANT)

You have 2 choices (Choose ONE):

__________________________________________________________________________
OPTION A (EASIEST): MongoDB Atlas (Cloud DB) ⭐ RECOMMENDED
✔ No local DB install headache
Go to 👉 https://www.mongodb.com/cloud/atlas
1. Create free account
2. Create FREE cluster
3. Create Database User
4. Copy MongoDB connection string
Example: mongodb+srv://username:password@cluster0.mongodb.net/myevents
Keep this safe 🔐 — we’ll use it soon.
__________________________________________________________________________
OPTION B (Local MongoDB)
Only if you want local DB:
1. Install MongoDB Community Server
2. Start MongoDB service
3. Connection string:
mongodb://localhost:27017/myevents
__________________________________________________________________________
__________________________________________________________________________
__________________________________________________________________________

🧩 PART 1: Open Project Correctly
✅ Step 1.1: Open VS Code

1. Open VS Code
2. Click File → Open Folder
3. Select: Your local path:
EG: D:\study\playwright\MERN-AutomationTest-Practice-Project

You should see in MyEvents project:
backend/
frontend/
README.md







🧩 PART 2: Backend Setup (VERY IMPORTANT)
✅ Step 2.1: Open Backend Terminal

In VS Code:
1. Right click on backend
2. Click Open in Integrated Terminal

Your terminal path must be: ...MERN-AutomationTest-Practice-Project\backend


✅ Step 2.2: Install Backend Dependencies
Run:	npm install

⏳ Wait until it finishes
✔ node_modules folder will appear




✅ Step 2.3: Create Backend .env File
1. In backend/
2. Copy file:	.env.example
3. Rename to: 	.env

✅ Step 2.4: Configure Backend .env
Open .env and edit (example):
PORT=5000
MONGO_URI=PASTE_YOUR_MONGODB_URL_HERE
JWT_SECRET=supersecretkey
CLIENT_URL=http://localhost:3000

👉 Paste MongoDB Atlas URL if using cloud




✅ Step 2.5: Start Backend Server
Run: npm run dev

If successful, you’ll see something like:
Server running on port 5000
MongoDB connected


🚨 KEEP THIS TERMINAL OPEN
Backend API is now running at: 	http://localhost:5000






🧩 PART 3: Frontend Setup (React)
✅ Step 3.1: Open Frontend Terminal

In VS Code:
1. Right click on frontend
2. Click Open in Integrated Terminal
Terminal path:	...MERN-AutomationTest-Practice-Project\frontend


✅ Step 3.2: Install Frontend Dependencies
Run:	npm install
Wait until done ✔


✅ Step 3.3: Create Frontend .env
1. Copy: 		.env.example
2. Rename to:	.env

✅ Step 3.4: Configure Frontend .env
Open .env and set:	REACT_APP_API_URL=http://localhost:5000/api
(If your backend uses /api prefix)

✅ Step 3.5: Start Frontend
Run:		npm start

Browser will open automatically 🎉
Or manually visit:		http://localhost:3000




___________________________________________________________________________
🧩 FINAL: How You Should Run Daily

Every time you open PC:
Terminal 1 (Backend)
cd backend
npm run dev

Terminal 2 (Frontend)
cd frontend
npm start




✅ You are DONE 🎉
You now have:
MERN Backend running
React Frontend running
Database connected



___________________________________________________________________________
___________________________________________________________________________
___________________________________________________________________________
___________________________________________________________________________

🧩 MongoDB (**MongoDB dump**)data restore into MongoDB compass local with Correct tool = **mongorestore** 🧩

Import the whole myevents database at once into:	mongodb://localhost:27017

This is NOT done via MongoDB Compass UI ❌
This is done via Command Prompt using **mongorestore** ✅



🧩 PART 1: Check MongoDB Tools Installed

✅ Step 1.1: Open Command Prompt

✅ Step 1.2: Check mongorestore exists
Run:	mongorestore --version
✔ If version appears → OK

❌ If not → install MongoDB Database Tools
❌ If mongorestore NOT FOUND
Go to 👉 https://www.mongodb.com/try/download/database-tools
- Download Windows (x64)
- Install
- Restart Command Prompt





🧩 PART 2: Place Folder Correctly (IMPORTANT)

Let’s assume your dump folder is here:
EG: D:\study\playwright\MERN-AutomationTest-Practice-Project\db-dump\myevents

📌 The data should be inside (myevents) = database name folder.



🧩 PART 3: Restore Whole Database (ONE COMMAND)

✅ Step 3.1: Open CMD in Parent Folder

Go to the folder above myevents
Example: In CMD:	EG: D:\study\playwright\MERN-AutomationTest-Practice-Project\db-dump\


✅ Step 3.2: Run mongorestore

** Run EXACTLY this: mongorestore --db myevents --drop .\myevents   **

EG: D:\study\playwright\MERN-AutomationTest-Practice-Project\db-dump\> mongorestore --db myevents --drop .\myevents

What this means:
| Part            | Meaning                         |
| --------------- | ------------------------------- |
| `mongorestore`  | Restore MongoDB dump            |
| `--db myevents` | Target database                 |
| `--drop`        | Delete old data first           |
| `.\myevents`    | Folder containing `.bson` files |


✅ Successful Output Looks Like:
restoring myevents.users from users.bson
restoring myevents.blogs from blogs.bson
restoring myevents.comments from comments.bson
...
done


🎉 DATABASE IMPORTED SUCCESSFULLY


🧩 PART 4: Verify in MongoDB Compass
- Open MongoDB Compass
- Connect to: mongodb://localhost:27017
- Click database myevents and check


___________________________________________________________________________
___________________________________________________________________________
___________________________________________________________________________

**Admin Access**
admin2025@myevent.com
Password123$

**Users Access**
All users password: Password123!
All users:
alex.tremblay@testmail.ca
sophie.nguyen@demo.ca
daniel.martin@sample.ca
emily.walker@testorg.ca
ryan.oconnor@qa-demo.ca
aisha.khan@testing.ca
marc.leblanc@mockmail.ca
olivia.brown@fakemail.ca
jason.patel@sampleorg.ca
natalie.dubois@testdata.ca
kevin.wilson@demotest.ca
thomas.miller@canadatest.ca
isabelle.roy@mockdata.ca
andrew.scott@dummy.ca
