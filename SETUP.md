# Student Registration Form System

A full-stack student registration form application with admin panel, built with React, TypeScript, Vite, and Firebase.

## Features

### Student Portal (`/`)
- Clean, responsive student registration form
- Input validation for all fields
- Real-time feedback on form submission
- Data stored in Firebase Firestore

### Admin Panel (`/admin`)
- Secure login authentication
- Statistics dashboard with:
  - Total student count
  - Branch-wise distribution
  - Year-wise distribution
- View all student records in a table
- Export data to CSV format
- No visible access from student portal (security)

## Project Structure

```
src/
├── components/
│   ├── StudentForm.tsx       # Student registration form
│   ├── StudentForm.css
│   ├── AdminLogin.tsx         # Admin login page
│   ├── AdminLogin.css
│   ├── AdminPanel.tsx         # Admin dashboard
│   └── AdminPanel.css
├── config/
│   └── firebase.ts            # Firebase configuration
├── types/
│   └── student.ts             # TypeScript interfaces
├── App.tsx                    # Main app with routing
├── App.css
├── main.tsx
└── index.css
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Go to Project Settings → General → Your apps
4. Copy your Firebase configuration
5. Update `src/config/firebase.ts` with your Firebase credentials:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Firestore Database Setup

1. In Firebase Console, go to Firestore Database
2. Create database (start in production mode or test mode)
3. Create the `admins` collection manually:
   - Click "Start collection"
   - Collection ID: `admins`
   - Click "Next"
   - Document ID: Click "Auto-ID"
   - Add fields:
     - Field: `username`, Type: `string`, Value: your-username (e.g., `admin`)
     - Click "+ Add field"
     - Field: `password`, Type: `string`, Value: your-password (e.g., `admin123`)
   - Click "Save"

**Note:** The `students` collection will be created automatically when the first student submits the form - no need to create it manually!

**Important:** For production, implement proper password hashing!

### 5. Firestore Security Rules

Update your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Students collection - allow read and create
    match /students/{document=**} {
      allow read, create: if true;
    }
    
    // Admins collection - allow read only
    match /admins/{document=**} {
      allow read: if true;
    }
  }
}
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The app will run at `http://localhost:5174/`

- Student form: `http://localhost:5174/`
- Admin panel: `http://localhost:5174/admin`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Student Form Fields

The form collects the following information:

- **First Name*** (required)
- **Middle Name** (optional)
- **Surname*** (required)
- **Contact Number*** (required, 10 digits)
- **E-mail*** (required, valid email)
- **Branch*** (required, dropdown: Computer, IT, Mechanical, Electrical, Electronics, Civil)
- **Year*** (required, dropdown: FY, SY, TY, Final Year)
- **Division*** (required, single character)
- **Roll Number*** (required, max 15 characters)
- **ZPRN Number*** (required, max 15 characters)

## Technologies Used

- **Frontend:** React 19, TypeScript
- **Build Tool:** Vite 7
- **Routing:** React Router DOM v6
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth (for future enhancements)
- **Styling:** CSS3 with custom components

## Future Enhancements (To Do)

- [ ] Deploy to GitHub Pages
- [ ] Implement proper password hashing for admin credentials
- [ ] Add edit/delete functionality for student records
- [ ] Export to Excel format (in addition to CSV)
- [ ] Add email notifications on form submission
- [ ] Implement Firebase Authentication for admin
- [ ] Add search and filter in admin panel
- [ ] Responsive design improvements
- [ ] Form field validations enhancement
- [ ] Add student registration confirmation email

## Security Notes

- Admin panel is not linked from student form for security
- Access admin panel directly via `/admin` URL
- Implement proper authentication before production deployment
- Use environment variables for Firebase config in production
- Enable proper Firestore security rules

## License

MIT
