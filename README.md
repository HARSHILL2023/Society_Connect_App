# Society Connect — Smart Residential Community Management Mobile App

[![React Native](https://img.shields.io/badge/React_Native-Expo-6366F1?style=for-the-badge&logo=react)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![Render](https://img.shields.io/badge/Render-Deployment-46E3B7?style=for-the-badge&logo=render)](https://render.com/)

**Society Connect** is a completely new, production-ready mobile application built for residential societies, apartment complexes, and gated communities. It empowers residents to raise maintenance complaints, enables managers to coordinate repairs, and equips administrators with complete oversight over users and analytics.

---

## 📱 Mobile Application Architecture

The mobile app is designed specifically with a mobile-first UI using **React Native** and **Expo**.

```
Society_Connect_App/
│
├── mobile/                      # React Native (Expo) Mobile Client
│   ├── assets/                  # App icon, splash, and adaptive icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Button, Input, Card, Badge, Header, ModalDialog, StatCard, EmptyState
│   │   │   ├── ticket/          # TicketCard, StatusFilter, CategoryFilter
│   │   │   └── user/            # UserCard
│   │   ├── constants/           # theme.js (colors, typography, spacing, categories, statuses)
│   │   ├── context/             # AuthContext.jsx (session persistence, auto-refresh)
│   │   ├── navigation/          # Role-based Navigation (Auth, Member, Manager, Admin navigators)
│   │   ├── screens/
│   │   │   ├── auth/            # LoginScreen, RegisterScreen
│   │   │   ├── member/          # MemberHomeScreen, MyTicketsScreen, CreateTicketScreen, TicketDetailScreen, MemberProfileScreen
│   │   │   ├── manager/         # ManagerDashboardScreen, AllTicketsScreen, ManagerProfileScreen
│   │   │   └── admin/           # AdminDashboardScreen, UsersManagementScreen, CreateUserScreen, AdminProfileScreen
│   │   ├── services/            # api.js (Axios with Bearer token interceptor and 401 handling)
│   │   └── utils/               # storage.js (AsyncStorage session wrapper)
│   ├── App.js                   # Root Provider and StatusBar setup
│   ├── app.json                 # Expo configuration
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── backend/                     # Node.js + Express Backend API
│   ├── config/                  # db.js (MongoDB Mongoose connection), env.js (Env validation)
│   ├── controllers/             # auth, ticket, user, admin controllers
│   ├── middleware/              # auth.middleware, role.middleware, validation.middleware, error.middleware
│   ├── models/                  # User.js, Ticket.js
│   ├── routes/                  # auth, ticket, user, admin route modules
│   ├── seed/                    # seed.js (Dev database seeder)
│   ├── utils/                   # ApiError, ApiResponse, generateToken
│   ├── app.js                   # Express configuration & security middleware
│   ├── server.js                # Server entry point
│   ├── test_api.js              # Full automated test suite (16 test cases)
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
└── README.md
```

---

## 👥 User Roles & Workflow

| Role | Key Features & Access |
|---|---|
| **Member** (Resident) | • Self-register with Flat number<br>• View personal ticket summary<br>• Raise tickets with category (Plumbing, Electrical, Security, Cleaning, Carpentry, Elevator, Gardening, Others) & priority<br>• Filter & search own tickets<br>• View real-time ticket progress & staff resolution notes<br>• Update profile details |
| **Manager** (Staff) | • Monitor global society maintenance feed<br>• Filter tickets by status (Pending, In Progress, Resolved) and category<br>• Search across resident name, flat number, and title<br>• Change ticket status and attach technician/maintenance notes<br>• Real-time stats dashboard |
| **Admin** (Super Admin) | • Full system analytics & metrics dashboard (ticket count, resident count, manager count)<br>• Category breakdown chart<br>• User provisioning: Create, edit, and delete Manager and Resident accounts<br>• Full ticket oversight and management<br>• Direct database health indicators |

---

## 🚀 Quick Start — Local Development

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo Go app on physical phone or Android Studio / Xcode Simulator

---

### 2. Running the Backend API

```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/society-connect?retryWrites=true&w=majority
JWT_SECRET=society_connect_jwt_secret_super_secure_key_2026
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_ORIGIN=*
```

Seed the test database (optional):
```bash
node seed/seed.js
```

Run the automated API test suite:
```bash
node test_api.js
```

Start the backend server:
```bash
npm run dev
# Server will run at http://localhost:5000
# Health check at http://localhost:5000/api/health
```

---

### 3. Running the Mobile App

```bash
cd mobile
npm install

# Copy environment file
cp .env.example .env
```

Configure `mobile/.env`:
- **Android Emulator**: `EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api`
- **iOS Simulator**: `EXPO_PUBLIC_API_URL=http://localhost:5000/api`
- **Physical Device (Local Wi-Fi)**: `EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:5000/api`
- **Production (Render)**: `EXPO_PUBLIC_API_URL=https://<your-render-app>.onrender.com/api`

Start the Expo bundler:
```bash
npx expo start
```
- Press `a` to open in Android Emulator
- Press `i` to open in iOS Simulator
- Scan QR code with Expo Go on your mobile phone

---

## 🔑 Default Test Accounts (from Seed)

All demo accounts use password: `Password123!`

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `admin@societyconnect.com` | `Password123!` |
| **Manager** | `manager@societyconnect.com` | `Password123!` |
| **Member 1** | `john@societyconnect.com` | `Password123!` |
| **Member 2** | `sarah@societyconnect.com` | `Password123!` |

*(You can also use the Quick Demo Switcher on the Login Screen for 1-tap role switching)*

---

## ☁️ Render Deployment Guide (Backend)

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New → Web Service**.
2. Connect your GitHub repository `HARSHILL2023/Society_Connect_App`.
3. Set the following settings:
   - **Name**: `society-connect-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add **Environment Variables**:
   ```
   NODE_ENV = production
   PORT = 10000
   MONGODB_URI = <YOUR_MONGODB_ATLAS_URI>
   JWT_SECRET = <SECURE_RANDOM_STRING>
   JWT_EXPIRES_IN = 7d
   CLIENT_ORIGIN = *
   ```
5. Click **Create Web Service**.
6. Once deployed, copy your Render URL (e.g. `https://society-connect-backend.onrender.com`) and update `mobile/.env`:
   ```
   EXPO_PUBLIC_API_URL=https://society-connect-backend.onrender.com/api
   ```

---

## 🛡️ Security Features

- **Password Hashing**: Bcrypt with 12 salt rounds
- **JWT Authorization**: Bearer tokens with role payload and expiration checks
- **Role-Based Guards**: Strict middleware enforcing `Admin`, `Manager`, and `Member` isolation
- **NoSQL Injection Prevention**: `express-mongo-sanitize`
- **Brute-force Protection**: `express-rate-limit` (strict limits on `/api/auth`)
- **HTTP Header Security**: `helmet`
- **Input Validation**: `express-validator` on all mutation endpoints
- **Secret Isolation**: Zero secrets committed to git repositories (`.env` in `.gitignore`)

---

## 📄 License
MIT License. Created for Society Connect Community Management.