# Frontend Setup and Configuration

## Overview
This document provides information about the Connect2Edtech frontend setup and its integration with the backend.

## Technology Stack

### Core Technologies
- **React:** 19.1.1
- **React Router:** 7.8.2
- **Vite:** 5.4.0
- **Node.js:** 20.x (required)

### Build Tool
- **Vite** - Fast development server and build tool
- Hot module replacement (HMR)
- Optimized production builds

## Project Structure

```
frontend/
├── .env                          # Environment variables
├── package.json                  # Dependencies and scripts
├── vite.config.js                # Vite configuration
├── index.html                    # Entry point
├── public/
│   └── _redirects                # Netlify/Vercel redirects
├── src/
│   ├── main.jsx                  # App entry point
│   ├── App.jsx                   # Main app component
│   ├── router/
│   │   └── App.jsx               # Route definitions
│   ├── shared/
│   │   ├── AuthContext.jsx       # Authentication context
│   │   ├── cartApi.js            # Cart API integration
│   │   ├── storageUtils.js       # Storage utilities
│   │   ├── coursesData.js        # Course data
│   │   ├── SiteLayout.jsx        # Layout component
│   │   └── components/
│   │       ├── NavBar.jsx        # Navigation bar
│   │       └── WhatsAppCTA.jsx   # WhatsApp button
│   └── views/
│       ├── HomePage/
│       ├── AboutPage/
│       ├── CoursesPage/
│       ├── CourseDetailsPage/
│       ├── EnrollmentPage/
│       ├── CartPage/
│       ├── ContactPage/
│       ├── SignupPage/
│       ├── SigninPage/
│       ├── AdminDashboard/
│       ├── StudentPage/
│       ├── HrDashboard/
│       └── MailPage/
└── dist/                         # Built files (generated)
```

## Environment Configuration

### Frontend .env
```env
VITE_API_URL=https://connect2edtech.onrender.com
```

**Note:** This points to the production backend. For local development, change to:
```env
VITE_API_URL=http://localhost:10000
```

### Backend .env
```env
MONGODB_URI=mongodb+srv://hr_connect2future:%402026C2f@cluster0.nyefwik.mongodb.net/?appName=Cluster0
JWT_SECRET=change-me-to-a-strong-secret-in-production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hr@connect2future.com
SMTP_PASS=@2026C2f
MAIL_FROM=hr@connect2future.com
ADMIN_BOOTSTRAP_SECRET=c2f-bootstrap-9f3a7b21e8d4a6c0b5e1f79a2d34c68
```

## Frontend-Backend Integration

### API Configuration

**File:** `frontend/src/shared/cartApi.js`
```javascript
export const API_BASE = import.meta.env.VITE_API_URL || ""
```

**File:** `frontend/src/shared/AuthContext.jsx`
```javascript
const apiFetch = async (path, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  const res = await fetch(API_BASE + path, {
    ...options,
    headers,
  })
  // ... error handling
}
```

### API Endpoints Used

#### Authentication
- `POST /api/signup` - User registration
- `POST /api/signin` - User login
- `POST /api/verify-otp` - Email verification
- `POST /api/resend-otp` - Resend verification code
- `GET /api/auth/me` - Get current user

#### Cart Management
- `GET /api/cart` - Get cart items
- `POST /api/cart/add` - Add item to cart
- `DELETE /api/cart/:courseKey` - Remove item from cart
- `DELETE /api/cart` - Clear cart
- `POST /api/checkout/submit` - Submit checkout

#### Forms
- `POST /api/enrollment` - Course enrollment
- `POST /api/contact` - Contact form submission

#### User Data
- `GET /api/me/enrollments` - User's enrollments
- `GET /api/me/contacts` - User's contact messages
- `GET /api/me/checkouts` - User's checkout history

#### Admin/HR
- `GET /api/admin/users` - All users (admin only)
- `PATCH /api/admin/users/:id/role` - Update user role (admin only)
- `GET /api/admin/stats` - Dashboard statistics (staff only)
- `GET /api/admin/contacts` - All contacts (staff only)
- `GET /api/admin/enrollments` - All enrollments (staff only)
- `GET /api/admin/checkouts` - All checkouts (staff only)
- `GET /api/mail` - Mail inbox (staff only)
- `POST /api/mail/:id/reply` - Reply to contact (staff only)

## Routing

### Public Routes
- `/` - Home page
- `/about` - About page
- `/courses` - Course listing
- `/course/:course` - Course details
- `/enrollment` - Enrollment form
- `/cart` - Shopping cart
- `/contact` - Contact form
- `/signup` - User registration
- `/signin` - User login

### Protected Routes
- `/student` - Student dashboard (requires authentication)
- `/admin` - Admin dashboard (requires admin role)
- `/hr` - HR dashboard (requires admin or hr role)
- `/mail` - Mail inbox (requires staff role)
- `/dashboard` - Redirects to appropriate dashboard by role

## Authentication Flow

### 1. Sign Up
```javascript
const data = await signup({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '1234567890',
  password: 'password123',
  whatsappNumber: '1234567890',
  connectWhatsapp: true,
  role: 'user'
})
// Returns: { ok: true, message: '...', requiresVerification: true }
```

### 2. Verify OTP
```javascript
const data = await verifyOtp('john@example.com', '123456')
// Returns: { ok: true, token: '...', user: {...} }
// Token is automatically stored
```

### 3. Sign In
```javascript
const data = await signin('john@example.com', 'password123')
// Returns: { ok: true, token: '...', user: {...} }
// Token is automatically stored
```

### 4. Authenticated Requests
```javascript
const user = useAuth()
// user.token - JWT token
// user.user - User data
// user.role - User role (user/hr/admin)
// user.isAuthenticated - Boolean
// user.isAdmin - Boolean

// API calls automatically include token
const data = await apiFetch('/api/auth/me')
```

## State Management

### Authentication State
- **Provider:** `AuthProvider` wraps the entire app
- **Storage:** localStorage for persistence
- **Token:** JWT stored in localStorage
- **Auto-refresh:** Fetches user data if role/verified is missing

### Cart State
- **Storage:** localStorage for cart items
- **Session:** sessionStorage for guest session ID
- **Sync:** Backend sync via API calls
- **Events:** Custom 'cart-updated' event for UI updates

## Development

### Install Dependencies
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
```
- Starts Vite dev server on http://localhost:5173
- Hot module replacement enabled
- Proxies API requests to backend

### Build for Production
```bash
npm run build
```
- Creates optimized production build in `dist/`
- Minified and bundled assets
- Ready for deployment

### Preview Production Build
```bash
npm run preview
```
- Serves the production build locally
- Useful for testing before deployment

## Deployment

### Vercel
1. Connect repository to Vercel
2. Set environment variable: `VITE_API_URL=https://connect2edtech.onrender.com`
3. Deploy automatically on push

### Netlify
1. Connect repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set environment variable: `VITE_API_URL=https://connect2edtech.onrender.com`

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to your hosting service
```

## Features

### User Features
- ✅ User registration with email verification
- ✅ User login/logout
- ✅ Course browsing
- ✅ Course details view
- ✅ Shopping cart
- ✅ Course enrollment
- ✅ Contact form
- ✅ WhatsApp integration

### Admin Features
- ✅ User management
- ✅ Role assignment
- ✅ Dashboard statistics
- ✅ Enrollment management
- ✅ Contact management
- ✅ Checkout management
- ✅ Mail inbox with reply

### HR Features
- ✅ Dashboard statistics
- ✅ Enrollment management
- ✅ Contact management
- ✅ Checkout management
- ✅ Mail inbox with reply

## Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Mobile Features
- Hamburger menu
- Touch-friendly buttons
- Responsive images
- Mobile-optimized forms

## Performance

### Optimizations
- Code splitting with React.lazy()
- Image optimization
- Asset bundling and minification
- Tree shaking
- Gzip compression (via hosting)

### Best Practices
- Lazy loading for routes
- Memoization with useMemo()
- Efficient re-renders
- Optimized bundle size

## Browser Support

### Supported Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Polyfills
- No polyfills required for modern browsers
- Uses modern JavaScript features (ES6+)

## Troubleshooting

### Common Issues

#### API Connection Failed
```javascript
// Check VITE_API_URL in .env
// Ensure backend is running
// Check CORS configuration
```

#### Authentication Not Working
```javascript
// Clear localStorage
localStorage.removeItem('connect2edtech-user')

// Check JWT_SECRET matches between frontend/backend
// Verify token is being sent in requests
```

#### Cart Not Syncing
```javascript
// Check session ID is being sent
// Verify backend cart endpoints are accessible
// Check browser console for errors
```

## Security

### Implemented
- ✅ JWT authentication
- ✅ Protected routes
- ✅ Input validation
- ✅ XSS prevention (React)
- ✅ CSRF protection (same-origin)
- ✅ Secure token storage

### Recommendations
- ⚠️ Enable HTTPS in production
- ⚠️ Implement rate limiting
- ⚠️ Add request validation
- ⚠️ Use CSP headers
- ⚠️ Regular security audits

## Monitoring

### Frontend Metrics
- Page load times
- API response times
- Error rates
- User interactions

### Tools
- Browser DevTools
- React DevTools
- Vite build analyzer
- Lighthouse audits

## Next Steps

1. **Start Backend**
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:10000

4. **Test Features**
   - Sign up with email verification
   - Sign in
   - Browse courses
   - Add to cart
   - Enroll in courses
   - Submit contact form

## Resources

- **React Docs:** https://react.dev/
- **React Router:** https://reactrouter.com/
- **Vite Docs:** https://vitejs.dev/
- **Backend API:** See backend/MONGODB_SETUP.md

## Support

For issues:
1. Check browser console for errors
2. Check network tab for failed requests
3. Verify backend is running
4. Check environment variables
5. Review API documentation

---

**Last Updated:** 2026-07-10
**Version:** 1.0.0