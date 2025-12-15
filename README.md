# Study Buddy Platform

A collaborative learning platform that helps students schedule, join, and track group study sessions with AI assistance.

## Features

- **Authentication**: Secure login with email/password and Google OAuth using NextAuth
- **Study Sessions**: Create, join, and manage collaborative study sessions
- **Video Conferencing**: Real-time video sessions powered by LiveKit
- **Calendar View**: Interactive calendar to visualize upcoming sessions
- **Progress Dashboard**: Track completed sessions, study hours, and achievements
- **AI Study Assistant**: Get personalized study recommendations using AI
- **Profile Management**: Manage personal information and subjects

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, MongoDB
- **Authentication**: NextAuth (Email + Google OAuth)
- **Video**: LiveKit
- **AI**: Vercel AI SDK with OpenAI
- **UI Components**: shadcn/ui with Material 3 design

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or cloud)
- LiveKit account and credentials
- Google OAuth credentials (optional, for Google sign-in)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`env
# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/pera

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# LiveKit
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-url

# OpenAI (via Vercel AI Gateway - no key needed)
# The AI Gateway is configured automatically
\`\`\`

### Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up the database:

The platform includes MongoDB setup scripts in the `scripts` folder. You can run them directly from the v0 interface, or manually:

\`\`\`bash
# Connect to your MongoDB instance
mongosh

# Run the collection creation script
load('scripts/01-create-collections.js')

# Optional: Seed with sample data
load('scripts/02-seed-data.js')
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Sample Login Credentials

If you ran the seed script, you can use these test accounts:

- Email: `alice@example.com` | Password: `test123`
- Email: `bob@example.com` | Password: `test123`
- Email: `carol@example.com` | Password: `test123`

## Project Structure

\`\`\`
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── study-sessions/ # Session management
│   │   ├── study-assistant/ # AI assistant
│   │   └── livekit-token/ # Video token generation
│   ├── auth/             # Login/register page
│   ├── home/             # Home dashboard
│   ├── study-sessions/   # Session management
│   ├── calendar/         # Calendar view
│   ├── dashboard/        # Progress dashboard
│   ├── study-assistant/  # AI assistant
│   └── profile/          # Profile settings
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   └── ...              # Feature components
├── lib/                  # Utilities and helpers
│   ├── models/          # TypeScript models
│   ├── mongodb.ts       # Database connection
│   └── db-helpers.ts    # Database operations
└── scripts/             # Database setup scripts
\`\`\`

## Key Features Explained

### Authentication
- Email/password authentication with bcrypt hashing
- Google OAuth integration
- Protected routes with NextAuth middleware
- Session management with JWT

### Study Sessions
- Create sessions with title, topic, date, duration
- Join/leave sessions
- Automatic LiveKit room creation
- Session status tracking (scheduled, active, completed)

### Video Conferencing
- LiveKit integration for real-time video
- Access token generation per session
- Multiple participants support
- Built-in video controls

### AI Study Assistant
- Powered by OpenAI GPT-4 via Vercel AI Gateway
- Personalized recommendations based on student profile
- Streaming responses for better UX
- Context-aware suggestions

### Progress Tracking
- Session completion statistics
- Study hours calculation
- Weekly activity charts
- Recent session history

## Database Schema

### Students Collection
- name: String
- email: String (unique)
- password: String (hashed)
- grade: String
- subjects: Array of Strings
- studySessions: Array of ObjectIds

### StudySessions Collection
- title: String
- topic: String
- date: Date
- duration: Number (minutes)
- participants: Array of ObjectIds
- createdBy: ObjectId
- liveKitRoomName: String
- status: String (scheduled, active, completed, cancelled)

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the project in Vercel
3. Add all environment variables in the Vercel dashboard
4. Deploy

### Environment Setup

Make sure to configure:
- MongoDB connection string (use MongoDB Atlas for production)
- LiveKit credentials
- Google OAuth credentials (if using)
- NextAuth secret

## Support

For issues or questions, please check the code comments or reach out for support.

## License

This project was created for educational purposes.
