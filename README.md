# Dreams

A place where dreams come true - Full-stack application with Next.js frontend and NestJS backend, powered by Appwrite.

## Project Structure

This repository contains two separate applications:

```
dreams/
├── frontend/          # Next.js frontend application
├── backend/           # NestJS backend API
└── README.md          # This file
```

## Features

- 🔐 **Authentication** - User registration and login powered by Appwrite
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 🚀 **Real-time** - Built for real-time data synchronization
- 📱 **Responsive** - Works perfectly on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- Appwrite account and project

### Environment Setup

#### Frontend Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
NEXT_PUBLIC_APPWRITE_PROJECT_ID=68cb0a4a0033b6fc06c9
NEXT_PUBLIC_APPWRITE_PROJECT_NAME=dreams
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
```

#### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```bash
APPWRITE_PROJECT_ID=68cb0a4a0033b6fc06c9
APPWRITE_PROJECT_NAME=dreams
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
```

### Frontend (Next.js)

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will be available at: http://localhost:3000

### Backend (NestJS)

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run start:dev
```

The backend API will be available at: http://localhost:3001

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check endpoint
- `GET /appwrite` - Appwrite connection information

## Technology Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeScript
- **Database & Auth**: Appwrite
- **Architecture**: Separate applications with independent deployment

## Appwrite Integration

This application uses Appwrite for:

- **User Authentication** - Secure user registration and login with email verification
- **Database** - Document-based database for storing application data
- **Storage** - File storage for user uploads
- **Functions** - Server-side functions for complex operations

### Authentication Flow

The application uses Appwrite's built-in authentication system:

1. **Registration**: Users register with email/password, receiving verification emails
2. **Email Verification**: Users click verification link to activate their account
3. **Login**: Users sign in with verified email/password
4. **Session Management**: Appwrite handles session tokens and user state
5. **Backend Integration**: Backend can validate user sessions for protected routes

### Appwrite Setup

1. Create an Appwrite account at [appwrite.io](https://appwrite.io)
2. Create a new project named "dreams"
3. Copy your project ID and endpoint
4. Update the environment variables in both frontend and backend
5. Configure authentication settings in your Appwrite console:
   - Enable email authentication
   - Set up email templates for verification
   - Configure allowed origins for your domain

## Development

### Frontend Development

The frontend uses Next.js with App Router and includes:

- Authentication context and hooks
- Login and registration forms
- Responsive design with dark mode support

### Backend Development

The backend uses NestJS and includes:

- Appwrite service for database operations
- RESTful API endpoints
- TypeScript for type safety

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
