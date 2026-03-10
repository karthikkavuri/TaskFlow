# VibeCode Todo App - Production-Level MERN Application

A full-featured Todo Application with user authentication, built with MongoDB, Express, React, and Node.js.

## Features

✅ **User Authentication**
- Sign up and login
- Email verification
- JWT-based authentication with refresh tokens
- Secure password hashing with bcryptjs

✅ **Todo Management**
- Create, read, update, and delete todos
- Mark todos as complete/incomplete
- Set priority levels (Low, Medium, High)
- Add due dates and descriptions
- Filter todos (All, Active, Completed)

✅ **Production-Ready**
- Protected API routes
- CORS enabled
- Error handling
- Environment variable configuration
- Responsive design

## Project Structure

```
vibecode/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Todo.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── todoController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── todoRoutes.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── config/
│   │   ├── db.js
│   │   └── email.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── TodoForm.jsx
│   │   │   ├── TodoList.jsx
│   │   │   └── TodoItem.jsx
│   │   ├── pages/
│   │   │   ├── SignupPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── VerifyEmailPage.jsx
│   │   │   └── TodoPage.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   ├── Auth.css
│   │   │   ├── Todo.css
│   │   │   ├── TodoForm.css
│   │   │   ├── TodoItem.css
│   │   │   ├── TodoList.css
│   │   │   └── Navbar.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── .env.example
```

## Prerequisites

- **Node.js** (v14+ recommended) - [Download](https://nodejs.org/)
- **MongoDB Community** - [Download & Install](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** (comes with Node.js)

## Installation & Setup

### 1. Install MongoDB Community Edition

**Windows:**
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. Choose "Install MongoDB as a Service" option
4. MongoDB will start automatically

**Verify Installation:**
```bash
mongo --version
```

### 2. Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file (already provided, just add your email credentials)
# Update .env with your email service credentials

# Start the backend server
npm run dev
```

Backend will run on: `http://localhost:5000`

### 3. Setup Frontend

```bash
# Navigate to frontend folder (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the React development server
npm run dev
```

Frontend will run on: `http://localhost:5173`

## Configuration

### Email Setup (Optional but Recommended)

For email verification, update the `.env` file in the backend:

**Option 1: Gmail (Free)**
1. Go to https://myaccount.google.com/apppasswords
2. Generate an App Password
3. Update `.env`:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_SERVICE=gmail
```

**Option 2: Other Email Services**
- SendGrid (Free tier: 100 emails/month)
- Resend.dev (Free tier: 100 emails/month)

### Environment Variables

**Backend (.env)**
```
MONGO_URI=mongodb://localhost:27017/vibecode-todo
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/refresh` - Refresh access token

### Todos (Protected Routes)
- `GET /api/todos` - Get all user's todos
- `GET /api/todos/:id` - Get single todo
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

## Testing the Application

1. **Signup**: Create a new account at http://localhost:5173/signup
2. **Email Verification**: Check your email inbox and verify (if email configured)
3. **Login**: Login with credentials at http://localhost:5173/login
4. **Create Todos**: Add your first todo on the dashboard
5. **Manage Todos**: Edit, delete, or mark todos as complete

## Free Services Used

- **MongoDB Community** - Free local database
- **Express.js** - Free backend framework
- **React** - Free frontend library
- **Vite** - Free build tool
- **Nodemailer** - Free email service
- **bcryptjs** - Free password hashing
- **JWT** - Free authentication method

## Tips for Production Deployment

1. **Change JWT Secrets**: Generate strong secrets
2. **Setup Production Database**: Use MongoDB Atlas (free tier available)
3. **Email Service**: Use SendGrid, Gmail, or Resend for sending emails
4. **Environment Variables**: Use secure methods to manage secrets
5. **API Rate Limiting**: Add rate limiting middleware
6. **HTTPS**: Use SSL/TLS certificates
7. **CORS**: Whitelist only your frontend domain

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` (Windows Services should auto-start)
- Check if port 27017 is accessible

### Port Already in Use
- Backend port 5000: Change `PORT` in backend `.env`
- Frontend port 5173: Vite will auto-increment if port is busy

### Email Not Sending
- Verify email credentials in `.env`
- Check "Less secure apps" setting if using Gmail
- Ensure app-specific password is used for Gmail

### CORS Error
- Verify frontend URL in backend `.env` (FRONTEND_URL)
- Check if backend CORS middleware is configured

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: React, Vite, React Router, Axios
- **Authentication**: JWT, bcryptjs
- **Styling**: CSS3
- **Email**: Nodemailer

## License

MIT License

## Support

For issues or questions, refer to the code comments or the official documentation of each library.

---

**Happy coding! 🚀**
