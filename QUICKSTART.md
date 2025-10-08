# 🚀 Quick Start Guide

## Step 1: Firebase Setup (5 minutes)

### Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project" or use existing
3. Follow the setup wizard

### Get Firebase Config
1. In Firebase Console, click the ⚙️ (Settings) icon
2. Go to "Project settings"
3. Scroll to "Your apps" section
4. Click the web icon `</>`
5. Register your app (name it anything)
6. Copy the `firebaseConfig` object

### Update Firebase Configuration
Open `src/config/firebase.ts` and replace with your values:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSy...",              // ← Your values
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Create Firestore Database
1. In Firebase Console, click "Firestore Database" in left menu
2. Click "Create database"
3. Choose "Start in test mode" (for now)
4. Select your region
5. Click "Enable"

### Add Admin User
1. In Firestore Database, click "Start collection"
2. Collection ID: `admins`
3. Click "Next"
4. Add first document:
   - Document ID: Auto-ID
   - Field 1: `username` (type: string) → value: `admin`
   - Field 2: `password` (type: string) → value: `admin123`
5. Click "Save"

⚠️ **Important:** Change these credentials in production!

## Step 2: Run the Project

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Open your browser:
- **Student Form:** http://localhost:5174/
- **Admin Panel:** http://localhost:5174/admin

## Step 3: Test It Out

### Test Student Form
1. Go to http://localhost:5174/
2. Fill in the form with test data
3. Click "Submit Form"
4. You should see a success message

### Test Admin Panel
1. Go to http://localhost:5174/admin
2. Login with:
   - Username: `admin`
   - Password: `admin123`
3. You should see the dashboard with your submitted student data
4. Try exporting to CSV

## Troubleshooting

### "Failed to submit form"
- Check if Firebase config is correct in `src/config/firebase.ts`
- Make sure Firestore database is created
- Check browser console for errors

### "Failed to login"
- Make sure you created the `admins` collection in Firestore
- Check username/password spelling
- Verify in Firestore Console that the admin document exists

### Port already in use
- Change port in terminal: `npm run dev -- --port 3000`
- Or kill the process using port 5174

## Next Steps

1. ✅ Test the student form thoroughly
2. ✅ Test the admin panel features
3. ✅ Customize the form fields if needed
4. ✅ Update admin credentials in Firestore
5. 🔜 Plan for GitHub Pages deployment

## Need Help?

Check the full documentation in `SETUP.md`
