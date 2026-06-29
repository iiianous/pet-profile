# Full-Stack Development Guide for Frontend Developers

Welcome! This guide will help you understand how a Node.js/Express/MongoDB backend works. As a frontend developer, think of this as learning a new "tech stack" that handles data persistence, authentication, and business logic on the server side.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [The Entry Point (app.js)](#the-entry-point-appjs)
3. [How Routing Works](#how-routing-works)
4. [MVC Architecture Explained](#mvc-architecture-explained)
5. [Authentication Flow](#authentication-flow)
6. [How It All Connects](#how-it-all-connects)
7. [Your First Request: Step by Step](#your-first-request-step-by-step)

---

## Getting Started

### Prerequisites
- Node.js installed (check: `node -v`)
- Understanding of HTTP (GET, POST requests)
- Basic JavaScript knowledge (async/await, promises)
- Familiarity with REST APIs (since you're a frontend dev!)

### Project Structure Overview

```
node-auth/
├── app.js                 # Entry point (where the server starts)
├── config/
│   └── db.js             # Database connection
├── routes/               # Define URL paths (e.g., /login, /register)
│   ├── authRoutes.js
│   └── dashboardRoutes.js
├── controllers/          # Business logic (what happens when route is hit)
│   ├── authController.js
│   └── dashboardController.js
├── models/               # Data structure (how data looks in MongoDB)
│   └── User.js
├── middleware/           # Functions that run before route handlers
│   ├── authMiddleware.js
│   └── errorHandler.js
├── views/                # EJS templates (HTML rendered on server)
├── public/               # Static files (CSS, JS, images)
└── package.json          # Project dependencies
```

---

## The Entry Point (app.js)

### What is app.js?

`app.js` is **the first file that runs** when you start your server. Think of it like `index.js` in a React app—it's where everything begins.

### Starting the Server

```bash
npm start    # or node app.js
```

### What Happens in app.js?

1. **Import dependencies** - Load all the packages you need
   ```javascript
   import express from 'express';
   import cookieParser from 'cookie-parser';
   import helmet from 'helmet';
   ```

2. **Create the Express app** - This is your server object
   ```javascript
   const app = express();
   ```

3. **Configure middleware** - Set up how the server processes requests
   ```javascript
   app.use(express.json());           // Parse JSON from requests
   app.use(cookieParser());           // Parse cookies
   app.use(helmet());                 // Add security headers
   ```

4. **Define routes** - Tell Express what to do for different URLs
   ```javascript
   app.use(authRoutes);               // Use auth routes
   app.use(dashboardRoutes);          // Use dashboard routes
   ```

5. **Start the server** - Listen for incoming requests
   ```javascript
   app.listen(PORT, () => {
     console.log(`Server running on http://localhost:${PORT}`);
   });
   ```

**Frontend Developer Analogy:** If your React app is a client that *requests* data, app.js is the *server* that *provides* it!

---

## How Routing Works

### What is Routing?

Routing determines **which code runs** based on the URL path and HTTP method (GET, POST, etc.).

### Routes vs Controllers

- **Routes** (`authRoutes.js`) - Define the URL paths
- **Controllers** (`authController.js`) - Contain the actual logic

### Example: Login Route

In [authRoutes.js](authRoutes.js):
```javascript
router.get('/login', isGuest, getLogin);
router.post('/login', isGuest, [validation rules], postLogin);
```

**Breaking it down:**
- `router.get('/login', ...)` - When user visits `localhost:3000/login` (GET request)
- `isGuest` - Middleware that checks if user is NOT logged in
- `getLogin` - The controller function that runs

In [authController.js](authController.js):
```javascript
export const getLogin = (req, res) => {
  res.render('login', {
    title: 'Log in',
    errors: [],
    values: {}
  });
};
```

**What this does:** Renders the login page (EJS template)

### Request Flow

```
User visits localhost:3000/login
            ↓
Express matches route: router.get('/login', ...)
            ↓
Runs middleware: isGuest (checks if already logged in)
            ↓
Runs controller: getLogin (renders login.ejs)
            ↓
HTML sent to browser
```

### HTTP Methods You'll Use

| Method | Purpose | Example |
|--------|---------|---------|
| GET | Fetch data, render pages | `/login`, `/dashboard` |
| POST | Submit form data | `/login` (submit form), `/register` |
| PUT | Update existing data | Update user profile |
| DELETE | Remove data | Delete a post |

---

## MVC Architecture Explained

MVC = **Model, View, Controller**. This is the architectural pattern your project uses.

### What Each Layer Does

```
┌─────────────────────────────────────────────┐
│           Frontend (Browser)                 │
└─────────────────────┬───────────────────────┘
                      │ HTTP Request
                      ↓
┌─────────────────────────────────────────────┐
│  ROUTE (authRoutes.js)                       │
│  ├─ Defines URL path                        │
│  └─ Middleware (guards, validation)         │
└─────────────────────┬───────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────┐
│  CONTROLLER (authController.js)              │
│  ├─ Business logic                          │
│  ├─ Handles requests                        │
│  └─ Calls models/services                   │
└─────────────────────┬───────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────┐
│  MODEL (User.js)                             │
│  ├─ Defines data structure                  │
│  ├─ Database interactions                   │
│  └─ Data validation                         │
└─────────────────────┬───────────────────────┘
                      │
                      ↓
         ┌─────────────────────────┐
         │  MongoDB (Database)      │
         └─────────────────────────┘
```

### 1. Model (User.js)

**What is it?** A blueprint for your data. Like a TypeScript interface but with database powers.

```javascript
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  createdAt: Date
});
```

**Frontend Analogy:** Like defining your API response types in TypeScript:
```typescript
interface User {
  name: string;
  email: string;
  password: string;
}
```

**Key Differences:**
- Models validate data *before* saving to database
- Models can have methods (e.g., comparing passwords)
- Models automatically manage database interactions

### 2. Controller (authController.js)

**What is it?** The "brain" of your application. It handles the business logic.

```javascript
export const postRegister = async (req, res, next) => {
  // 1. Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('register', {
      errors: errors.array()
    });
  }

  // 2. Extract data from request
  const { name, email, password } = req.body;

  // 3. Check if user already exists (database query)
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).render('register', {
      message: 'Email already in use'
    });
  }

  // 4. Create new user (Model handles hashing)
  const newUser = new User({ name, email, password });
  await newUser.save();

  // 5. Send response
  res.redirect('/login');
};
```

**Frontend Analogy:** Like an async function that:
1. Validates props
2. Makes API calls
3. Updates state
4. Returns JSX

### 3. View (login.ejs, register.ejs)

**What is it?** The HTML that users see. EJS is a templating language (like JSX but simpler).

```ejs
<!-- views/login.ejs -->
<form method="POST" action="/login">
  <input type="email" name="email" placeholder="Email" required>
  <input type="password" name="password" placeholder="Password" required>
  <button type="submit">Log In</button>

  <% errors.forEach(error => { %>
    <p class="error"><%= error.msg %></p>
  <% }); %>
</form>
```

**Frontend Analogy:** This is server-rendered HTML (like Next.js/Remix), not a React SPA. The server generates the HTML and sends it to the browser.

---

## Authentication Flow

### What is Authentication?

Verification that a user is who they claim to be. In your app:

1. User creates account (registration)
2. User logs in (authentication)
3. Server issues a token/session
4. User uses token to access protected resources

### How Your App Does It: JWT + Cookies

**JWT** = JSON Web Token (a secure way to identify users)

### Step-by-Step: User Registration

```
User fills form & clicks "Register"
        ↓
POST /register sent to server
        ↓
postRegister() controller runs:
  - Validates input
  - Hashes password (bcryptjs)
  - Saves user to MongoDB
        ↓
Server redirects to /login
```

**Password Hashing (Security):**

In [User.js](models/User.js):
```javascript
UserSchema.pre('save', async function (next) {
  // This runs BEFORE saving to database
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

**Why?** Never store plain passwords! Hash them so even you can't read them.

### Step-by-Step: User Login

```
User enters email & password, clicks "Log In"
        ↓
POST /login sent to server
        ↓
postLogin() controller runs:
  1. Find user in database by email
  2. Compare entered password with hashed password
  3. If match:
     a. Create JWT token
     b. Store token in secure cookie
     c. Redirect to /dashboard
  4. If no match:
     a. Return login page with error
```

**Token Creation:**

```javascript
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d'  // Expires in 1 day
  });
};
```

**Frontend Analogy:** Like localStorage in React, but:
- Secure (can't be accessed by JavaScript)
- Server-validated (no client tampering)
- Auto-expiring (1 day lifetime)

### Step-by-Step: Accessing Protected Routes

```
User visits localhost:3000/dashboard
        ↓
Express checks route middleware: protect
        ↓
protect middleware (authMiddleware.js) runs:
  1. Read token from cookie
  2. Verify token with JWT secret
  3. If valid:
     a. Attach user info to request object
     b. Call next() to proceed
  4. If invalid:
     a. Clear cookie
     b. Redirect to /login
        ↓
If middleware passes, getDashboard() runs
```

**Middleware Concept:**

```javascript
// authMiddleware.js
export const protect = async (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.redirect('/login');
  }
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  
  next();  // ← "I'm done, proceed to the route handler"
};
```

**Frontend Analogy:** Like `ProtectedRoute` component in React Router:

```javascript
function ProtectedRoute() {
  if (!user) return <Navigate to="/login" />;
  return <Dashboard />;
}
```

### Logout

```javascript
export const logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};
```

Simply delete the cookie. User loses authentication.

---

## How It All Connects

### The Complete Picture

```
┌──────────────────────────────────────────────────────┐
│          Frontend (React/HTML)                        │
│          (What user sees)                            │
└────────────────┬─────────────────────────────────────┘
                 │ HTTP: GET /login
                 ↓
┌──────────────────────────────────────────────────────┐
│          Node.js/Express Server                       │
│          (app.js)                                    │
└─────────────────┬────────────────────────────────────┘
                  │
         ┌────────┴────────┐
         ↓                 ↓
    ┌─────────┐       ┌─────────┐
    │  Routes │       │Middleware│
    │authRoutes.js    authMiddleware.js
    └────┬────┘       └─────────┘
         ↓
    ┌─────────────────┐
    │ Controllers     │
    │authController.js│
    └────┬────────────┘
         ↓
    ┌──────────────────┐
    │  Models          │
    │  User.js         │
    └────┬─────────────┘
         ↓
    ┌────────────────────┐
    │  MongoDB Database  │
    └────────────────────┘
```

### Data Flow: Registration Example

```javascript
// 1. User submits form (Frontend sends POST request)
// POST /register with body: { name: "John", email: "john@example.com", password: "..." }

// 2. Express matches route (routes/authRoutes.js)
router.post('/register', isGuest, [validation], postRegister);

// 3. Middleware runs (middleware/authMiddleware.js)
// isGuest checks: Is user already logged in?

// 4. Validation runs
// body('name').isLength({ min: 2 })...

// 5. Controller runs (controllers/authController.js)
export const postRegister = async (req, res, next) => {
  const { name, email, password } = req.body;  // Get form data
  
  // 6. Model queries database (models/User.js)
  const existingUser = await User.findOne({ email });
  
  // 7. If user doesn't exist, create new one
  const newUser = new User({ name, email, password });
  
  // 8. Model hashes password automatically (pre-save hook)
  await newUser.save();  // ← Writes to MongoDB
  
  // 9. Send response back to frontend
  res.redirect('/login');
};
```

---

## Your First Request: Step by Step

### Scenario: User Logs In

#### Frontend (Browser)
```html
<form method="POST" action="/login">
  <input name="email" value="user@example.com">
  <input name="password" value="password123">
  <button>Log In</button>
</form>
```

#### Step 1: Route Matching
**User clicks button** → Browser sends `POST /login` with email and password

**app.js receives request** → Looks for matching route

```javascript
// app.js
app.use(authRoutes);  // ← Checks authRoutes.js
```

#### Step 2: Route Handler
**authRoutes.js checks:**
```javascript
router.post('/login', isGuest, [validation], postLogin);
//          ^^^^^^   ^^^^^^   ^^^^^^^^^^   ^^^^^^^^
//          URL      Middleware Validation Controller
```

#### Step 3: Middleware Runs
**isGuest middleware checks:**
```javascript
// "Is user already logged in?"
if (req.cookies && req.cookies.token) {
  const decoded = jwt.verify(req.cookies.token);
  const user = await User.findById(decoded.id);
  
  if (user) {
    return res.redirect('/dashboard');  // Already logged in!
  }
}

next();  // "Not logged in, proceed"
```

#### Step 4: Validation Runs
```javascript
body('email').isEmail().withMessage('Valid email required'),
body('password').notEmpty().withMessage('Password required')
```

If validation fails → Return to login page with errors

#### Step 5: Controller Runs
```javascript
export const postLogin = async (req, res, next) => {
  // 1. Get form data
  const { email, password } = req.body;
  
  // 2. Query database for user
  const user = await User.findOne({ email }).select('+password');
  
  // 3. Check if user exists
  if (!user) {
    return res.status(401).render('login', {
      message: 'User not found'
    });
  }
  
  // 4. Compare passwords
  const isMatch = await user.comparePassword(password);
  
  // 5. If passwords match
  if (isMatch) {
    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    
    // Store in secure cookie
    res.cookie('token', token, {
      httpOnly: true,  // Can't be accessed by JavaScript
      secure: true,    // Only sent over HTTPS
      sameSite: 'lax'  // Protection against CSRF
    });
    
    // Redirect to dashboard
    res.redirect('/dashboard');
  }
};
```

#### Step 6: Response Sent
**Server sends back:**
- Set-Cookie header with token
- Redirect response (302) to `/dashboard`

**Browser:**
- Saves cookie automatically
- Navigates to `/dashboard`

#### Step 7: Protected Route
**User visits `/dashboard`:**

```javascript
router.get('/dashboard', protect, getDashboard);
//                        ^^^^^^
//                        Middleware that requires authentication
```

**protect middleware runs:**
```javascript
// 1. Read token from cookie
const token = req.cookies.token;

// 2. Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET);

// 3. Get user from database
req.user = await User.findById(decoded.id);

// 4. Proceed
next();
```

**getDashboard controller runs:**
```javascript
export const getDashboard = (req, res) => {
  res.render('dashboard', {
    user: req.user  // ← Middleware attached this!
  });
};
```

**Dashboard displayed with user info** ✅

---

## Key Concepts Summary

| Concept | Frontend | Backend |
|---------|----------|---------|
| **State** | useState() | Database (MongoDB) |
| **Props** | Pass data to components | Request body (req.body) |
| **Component** | React component | Express route + controller |
| **Side Effects** | useEffect() | Middleware |
| **Validation** | React form libraries | express-validator |
| **Async** | fetch API | async/await + database queries |
| **Authentication** | localStorage | JWT + secure cookies |

---

## Common Questions

### Q: Why do we have separate files for routes and controllers?
**A:** Separation of concerns. Routes define **what URL** is hit, controllers define **what happens**. Keeps code organized and testable.

### Q: What if I need to modify a user's email?
**A:** In controller:
```javascript
const user = await User.findById(userId);
user.email = newEmail;
await user.save();  // Model validates before saving
```

### Q: How do I prevent someone from accessing `/dashboard` without logging in?
**A:** Use the `protect` middleware on that route:
```javascript
router.get('/dashboard', protect, getDashboard);
```

### Q: Is my password safe in cookies?
**A:** Yes! Cookies are `httpOnly` and `secure`:
- `httpOnly`: JavaScript can't read it (blocks XSS attacks)
- `secure`: Only sent over HTTPS (prevents man-in-the-middle)
- Server validates token before trusting it

### Q: How is this different from a React SPA?
**A:** React SPAs (Single Page Apps):
- Frontend handles routing
- Backend provides just APIs
- Client re-renders components

Your app (Traditional Server-Rendered):
- Server handles routing
- Server renders HTML
- Browser displays HTML
- More similar to PHP/Django apps

---

## Next Steps

1. **Run the app:** `npm start`
2. **Test registration:** Visit `http://localhost:3000/register`
3. **Test authentication:** Register, log in, access protected route
4. **Read the code:** Walk through each file with this guide
5. **Modify:** Try adding a new field to the User model (e.g., age)
6. **Build:** Add a new route/controller for updating user profile

---

## Useful Resources

- [Express.js Official Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [JWT Explanation](https://jwt.io/introduction)
- [HTTP Methods](https://www.w3schools.com/http/http_methods.asp)

---

**Happy learning! You're now learning full-stack development! 🚀**
