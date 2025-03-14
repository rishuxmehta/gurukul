# Gurrukul Authentication API

This is a secure authentication API for the Gurrukul ગુરુકુળ learning platform, implementing JWT-based authentication with role-based access control.

## Features

- 🔐 Secure user registration and login
- 🔒 Password encryption with bcrypt
- 🎫 JWT-based authentication
- 👮‍♂️ Role-based access control (Student, Educator, Admin)
- 👤 User profile management
- 🛡️ API protection middleware

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB 
- **Authentication**: JWT (JSON Web Tokens)
- **Password Encryption**: bcrypt
- **Validation**: express-validator

## Installation

1. **Install Node.js and npm** (if not already installed)
   - Download and install from [nodejs.org](https://nodejs.org/)

2. **Install MongoDB** (if not already installed)
   - Download and install from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Or use MongoDB Atlas cloud service

3. **Clone the repository**
   ```
   git clone https://your-repository-url.git
   cd gurrukul-auth-api
   ```

4. **Install dependencies**
   ```
   npm install
   ```

5. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update the variables in `.env`:
     ```
     NODE_ENV=development
     PORT=5000
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     JWT_EXPIRES_IN=7d
     JWT_COOKIE_EXPIRES_IN=7
     ```

6. **Start the server**
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- **POST /api/v1/auth/signup** - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student" // "student", "educator", or "admin"
  }
  ```

- **POST /api/v1/auth/login** - Login user
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- **GET /api/v1/auth/logout** - Logout user

- **GET /api/v1/auth/me** - Get current user info (requires authentication)

- **PATCH /api/v1/auth/update-password** - Update password (requires authentication)
  ```json
  {
    "currentPassword": "password123",
    "newPassword": "newPassword123"
  }
  ```

### User Management (Admin Only)

- **GET /api/v1/users** - Get all users (admin only)

- **POST /api/v1/users** - Create a new user (admin only)

- **GET /api/v1/users/:id** - Get user by ID (admin only)

- **PATCH /api/v1/users/:id** - Update user (admin only)

- **DELETE /api/v1/users/:id** - Delete user (admin only)

### User Profile (All Authenticated Users)

- **PATCH /api/v1/users/update-me** - Update current user profile
  ```json
  {
    "name": "Updated Name",
    "email": "updated@example.com"
  }
  ```

## Role-Based Access

The API implements role-based access control with three roles:

1. **Student** - Regular user with access to learning content
2. **Educator** - Content creator with access to course management
3. **Admin** - Full system access with user management capabilities

## Security Features

- Passwords are encrypted using bcrypt
- JWT tokens are used for authentication
- Tokens are stored in HTTP-only cookies for added security
- Routes are protected based on user roles
- Input validation to prevent injection attacks
- Error handling that doesn't leak sensitive information

## Frontend Integration

To integrate with the frontend:

1. Make AJAX requests to the API endpoints
2. Store the JWT token in secure storage (HTTP-only cookies recommended)
3. Include the token in the Authorization header for protected routes:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```
4. Handle token expiration and refresh

## License

This project is licensed under the MIT License. 