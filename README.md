# PharmQC - Pharmaceutical Quality Control System

A comprehensive web application for managing pharmaceutical quality control processes, with role-based access control using Firebase Authentication and Firestore database.

## Features

- **Role-based access control** for Lab Analysts, Production Analysts, Managers, and Administrators
- **Real-time notifications** using Firebase Cloud Messaging
- **Data input forms** for laboratory and production data
- **CAPA (Corrective and Preventive Action)** management
- **Root cause analysis** with AI-powered predictions
- **Statistical reporting** and data visualization

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Authentication**: Firebase Authentication
- **Database**: Firestore
- **Notifications**: Firebase Cloud Messaging (FCM)
- **Hosting**: Vercel (recommended)

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Firebase account
- Firebase project with Authentication, Firestore, and Cloud Messaging enabled

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`
# Public Firebase Config (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Server-side Firebase Config
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_VAPID_KEY=your_vapid_key
\`\`\`

Note: The FIREBASE_VAPID_KEY is a server-side environment variable and should NOT have the NEXT_PUBLIC_ prefix.

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`
3. Run the development server:
   \`\`\`
   npm run dev
   \`\`\`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Firebase Setup

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Set up Firebase Cloud Messaging
5. Generate a VAPID key for web push notifications
6. Create a service account and download the private key for server-side operations
7. Update the Firebase security rules for Firestore to implement proper access control

### Firestore Security Rules

\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Common functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'administrator';
    }
    
    function isManager() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'manager';
    }
    
    function isLabAnalyst() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'lab-analyst';
    }
    
    function isProductionAnalyst() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'production-analyst';
    }
    
    // User profiles
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow write: if isAdmin() || (isAuthenticated() && request.auth.uid == userId);
    }
    
    // Lab data
    match /labData/{document=**} {
      allow read: if isAuthenticated();
      allow create: if isLabAnalyst() || isAdmin();
      allow update, delete: if isLabAnalyst() && resource.data.createdBy == request.auth.uid || isAdmin();
    }
    
    // Production data
    match /productionData/{document=**} {
      allow read: if isAuthenticated();
      allow create: if isProductionAnalyst() || isAdmin();
      allow update, delete: if isProductionAnalyst() && resource.data.createdBy == request.auth.uid || isAdmin();
    }
    
    // Notifications
    match /notifications/{document=**} {
      allow read: if isAuthenticated() && (
        resource.data.recipients.hasAny([request.auth.uid]) || 
        resource.data.sender == request.auth.uid
      );
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (
        resource.data.recipients.hasAny([request.auth.uid]) || 
        resource.data.sender == request.auth.uid
      );
      allow delete: if isAdmin();
    }
    
    // CAPAs
    match /capas/{document=**} {
      allow read: if isAuthenticated() && (
        resource.data.assignedTo.hasAny([request.auth.uid]) || 
        resource.data.createdBy == request.auth.uid || 
        isManager() || 
        isAdmin()
      );
      allow create: if isManager() || isAdmin();
      allow update: if isAuthenticated() && (
        resource.data.assignedTo.hasAny([request.auth.uid]) || 
        resource.data.createdBy == request.auth.uid || 
        isManager() || 
        isAdmin()
      );
      allow delete: if isAdmin();
    }
  }
}
\`\`\`

## User Roles and Permissions

### Lab Analyst
- Input laboratory data
- Send notifications to production team
- Receive notifications
- View and print CAPA instructions

### Production Analyst
- Input production data
- Send notifications to laboratory team
- Receive notifications
- View and print CAPA instructions

### Manager
- Send and receive notifications
- Perform root cause analysis
- Predict and assign CAPA actions

### Administrator
- Access to all features
- View statistical data and reports
- Manage user accounts

## Deployment

The application can be deployed to Vercel:

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Configure the environment variables in Vercel
4. Deploy the application

## License

This project is licensed under the MIT License - see the LICENSE file for details.
\`\`\`

Let's also update the service worker to handle FCM without directly accessing the VAPID key:
