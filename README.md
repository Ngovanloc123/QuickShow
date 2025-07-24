# QuickShow - Movie Ticket Booking Platform

QuickShow is a modern, full-stack web application designed for browsing movies and booking tickets seamlessly. It features a user-friendly interface for customers and a comprehensive admin panel for managing shows and bookings. The project is built with a React frontend and a Node.js/Express backend, integrating various services like Clerk for authentication and Stripe for payments.

## ✨ Features

- **User Authentication**: Secure sign-up and sign-in functionality powered by Clerk.
- **Movie Browsing**: View a list of current and upcoming movies fetched from the TMDB API.
- **Detailed Movie Information**: Access detailed information for each movie, including trailers.
- **Seat Selection & Booking**: Interactive seat layout for users to select and book their preferred seats.
- **Payment Integration**: Secure payment processing with Stripe.
- **Booking History**: Users can view their past and upcoming bookings.
- **Admin Dashboard**: A dedicated dashboard for administrators to manage the platform.
- **Show Management**: Admins can add, update, and delete movie shows.
- **Booking Management**: Admins can view and manage all user bookings.
- **Email Notifications**: Automated email confirmations for bookings (powered by Inngest and Nodemailer).

## 🛠️ Technology Stack

The project is a monorepo with two main parts: `client` and `server`.

**Frontend (Client):**
- **Framework**: React.js
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Authentication**: Clerk
- **HTTP Client**: Axios
- **UI Components**: Lucide React (for icons), React Hot Toast (for notifications)

**Backend (Server):**
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk
- **Payments**: Stripe
- **Background Jobs**: Inngest
- **Email Service**: Nodemailer (with Mailtrap for development)
- **Image Hosting**: Cloudinary
- **API Testing**: (Implicitly, tools like Postman or Insomnia can be used)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) account and a connection string.
- Accounts for Clerk, Stripe, TMDB, Cloudinary, and Mailtrap to get the required API keys.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Ngovanloc123/QuickShow.git
    cd QuickShow
    ```

2.  **Setup the Backend (`server`):**
    - Navigate to the server directory:
      ```bash
      cd server
      ```
    - Install dependencies:
      ```bash
      npm install
      ```
    - Create a `.env` file in the `server` directory by copying the example below.
    - Run the development server:
      ```bash
      npm run server
      ```
    - The server will start on `http://localhost:3000`.

3.  **Setup the Frontend (`client`):**
    - Navigate to the client directory from the root:
      ```bash
      cd client
      ```
    - Install dependencies:
      ```bash
      npm install
      ```
    - Create a `.env` file in the `client` directory by copying the example below.
    - Run the development server:
      ```bash
      npm run dev
      ```
    - The client will be available at `http://localhost:5173` (or another port if 5173 is busy).

### Environment Variables

You need to create `.env` files in both the `client` and `server` directories.

#### Server (`server/.env`)
```env
# MongoDB Connection String
MONGODB_URI=your_mongodb_connection_string

# Clerk Authentication Keys
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

# Inngest Keys for background jobs
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

# The Movie Database (TMDB) API Key
TMDB_API_KEY=your_tmdb_api_key

# Stripe API Keys
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Nodemailer configuration (using Mailtrap)
SENDER_EMAIL=your_sender_email@example.com
MAILTRAP_API_TOKEN=your_mailtrap_api_token
```

#### Client (`client/.env`)
```env
# Currency symbol to display in the UI
VITE_CURRENCY = '$'

# Clerk Publishable Key (same as in server)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key

# Base URL for the backend server
VITE_BASE_URL=http://localhost:3000

# TMDB Image Base URL
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/original
```

## 📜 Available Scripts

### For the Server (`/server`)

- `npm run server`: Starts the backend server using `nodemon` for automatic restarts on file changes.
- `npm run start`: Starts the backend server using `node`.

### For the Client (`/client`)

- `npm run dev`: Starts the Vite development server for the frontend.
- `npm run build`: Builds the React application for production.
- `npm run lint`: Lints the codebase using ESLint.
- `npm run preview`: Serves the production build locally to preview it.


