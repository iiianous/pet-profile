# Full-Stack Development Guide for Frontend Developers

Welcome! This guide explains the current Node.js/Express/MongoDB app after the major enterprise-style refactor. It highlights how the app now uses service layers, DTO validation, centralized configuration, and a cleaner `src/` architecture.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Entry Point and Startup Flow](#entry-point-and-startup-flow)
4. [Routing and Controllers](#routing-and-controllers)
5. [Services and Separation of Concerns](#services-and-separation-of-concerns)
6. [DTOs and Request Validation](#dtos-and-request-validation)
7. [Error Handling](#error-handling)
8. [How It All Connects](#how-it-all-connects)
9. [Your First Request: Step by Step](#your-first-request-step-by-step)

---

## Getting Started

### Prerequisites
- Node.js installed (check: `node -v`)
- Understanding of HTTP (GET, POST requests)
- Basic JavaScript knowledge (async/await, promises)
- Familiarity with REST APIs and server-side concepts

### What Changed in This Refactor

The app now follows a more maintainable enterprise-style architecture:
- `src/` contains most application code
- `server.js` is the real startup file
- `app.js` builds the Express application
- `config/` stores environment and database configuration
- `services/` hold business logic and reusable operations
- `dtos/` define request validation rules
- `errors/` centralize API error handling
- `middlewares/` handle auth, validation, and errors

---

## Project Structure

```
pet-profile/
├── app.js                     # Compatibility loader for root app entry
├── server.js                  # Main startup script
├── package.json
├── src/
│   ├── app.js                 # Express app configuration
│   ├── server.js              # App bootstrap and startup
│   ├── config/
│   │   ├── index.js           # Environment and constants
│   │   └── db.js              # MongoDB connection helper
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── dashboard.controller.js
│   ├── dtos/
│   │   └── auth.dto.js        # Validation rules for auth requests
│   ├── errors/
│   │   └── api-error.js       # Standard API error class
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── validate.middleware.js
│   │   └── error.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── dashboard.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   └── token.service.js
│   └── models/
│       └── user.model.js
├── views/
├── public/
└── .env
```

### Why This Structure Matters

- `controllers/` stay thin and request-focused
- `services/` contain reusable business logic and data access patterns
- `dtos/` separate validation from controller logic
- `middlewares/` handle cross-cutting concerns consistently
- `config/` makes environment variables and constants centralized

---

## Entry Point and Startup Flow

### `src/server.js`

This file is the true startup script. It:
- loads environment variables
- connects to MongoDB
- starts the HTTP server
- handles fatal startup issues

Example:
```javascript
import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import { PORT } from './config/index.js';
```

### `src/app.js`

This file configures Express. It:
- sets the view engine
- configures security, logging, body parsing, and rate limiting
- mounts routes
- attaches the error handler

**Analogy:** `src/server.js` is the app launcher; `src/app.js` is the app factory.

---

## Routing and Controllers

### Routes

Routes define the available URLs and connect them to controller actions.

Example:
```javascript
router.post('/register', isGuest, registerValidation, validateRequest, postRegister);
```

- `isGuest` guards access for unauthenticated users
- `registerValidation` defines what input is valid
- `validateRequest` checks the rules and returns errors
- `postRegister` is the controller that handles the request

### Controllers

Controllers now act as coordinators:
- receive validated request data
- call services for business logic
- send a response or render a page

Example:
```javascript
const user = await registerUser({ name, email, password });
sendTokenResponse(user, res, '/dashboard');
```

This keeps controllers cleaner and easier to test.

---

## Services and Separation of Concerns

### What is a Service?

A service is a layer that contains business logic and data operations. It is a key part of enterprise applications because it keeps controllers thin and reusable.

### Example Service Responsibilities

- `auth.service.js`
  - register a new user
  - perform login checks
  - throw structured errors when requests fail
- `token.service.js`
  - sign JWT tokens
  - prepare HTTP-only cookies

### Why Services Help

- easier to unit test
- business logic is reusable across controllers
- controllers don’t need to know database details
- validation and error handling can remain separate

---

## DTOs and Request Validation

### What is a DTO?

DTO stands for **Data Transfer Object**. In this app, DTOs represent the expected shape and rules of incoming request data.

### Why Use DTOs?

- keeps validation rules in one place
- makes route definitions more declarative
- helps your app behave like a real API platform

### Example: `src/dtos/auth.dto.js`
```javascript
export const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long.'),
  body('email').isEmail().withMessage('Please provide a valid email address.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
];
```

### Validation Middleware

`validate.middleware.js` reads the results from `express-validator` and forwards any error as an `ApiError`.

This gives the app a consistent validation pattern.

---

## Error Handling

### Centralized Error Middleware

`src/middlewares/error.middleware.js` is responsible for:
- rendering user-friendly pages for browser requests
- returning JSON errors for API/JSON requests
- hiding internal details in production

### API Error Class

`src/errors/api-error.js` defines a reusable error structure with:
- status code
- message
- optional details array

This makes error handling predictable and enterprise-ready.

---

## How It All Connects

Here is the flow for a registration request:

1. Browser submits `POST /register`
2. Route matches `auth.routes.js`
3. `isGuest` middleware checks user state
4. `registerValidation` and `validateRequest` validate input
5. `auth.controller.js` receives clean data
6. `auth.service.js` creates the user and returns the model
7. `token.service.js` creates a JWT and sends it in a secure cookie
8. Controller redirects the user to `/dashboard`

### High-level Flow Diagram

```
Browser
   ↓
Route → Middleware → Controller → Service → Model → Database
   ↓
Response
```

---

## Your First Request: Step by Step

### Example: Register a User

1. User fills the registration form and submits it
2. Express matches `POST /register`
3. `registerValidation` builds the validation rules
4. `validateRequest` checks the request body
5. Controller calls `registerUser()`
6. Service creates the user in MongoDB
7. Token service sends a cookie
8. User lands on the dashboard

### Why This is Enterprise-Friendly

- clear separation of layers
- reusable services and validation rules
- centralized configuration and error handling
- easier to expand with new features, like APIs or admin routes

---

## Quick Tips for Future Enterprise Apps

- keep controllers thin
- move logic into services
- define input validation in DTOs
- centralize config values
- use middleware for common concerns
- make errors consistent and structured

---

## Summary

This refactor moves your app from a simple Express project toward a maintainable enterprise-grade structure. The main enhancements are:
- `src/server.js` and `src/app.js` split startup and app configuration
- `services/` isolate business logic
- `dtos/` encapsulate validation
- `errors/` centralize failure handling
- `middlewares/` manage auth, validation, and errors consistently

Keep using this structure as you add features, and your app will stay easy to understand, test, and scale.

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
