# Connect2Future - Installation Guide

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- npm or yarn package manager

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   - Add your MongoDB Atlas connection string
   - Configure CORS origins for your frontend domain
   - Set contact information (email, phone, WhatsApp)

5. Start the backend server:
   ```bash
   # Development mode (requires nodemon)
   npm run dev

   # Production mode
   npm start
   ```

   The backend will run on `http://localhost:10000`

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` if your backend is running on a different port/domain

5. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

## Environment Variables

### Backend (.env)
```
PORT=10000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
CONTACT_EMAIL=hr@connect2future.com
CONTACT_PHONE=+917019436720
WHATSAPP_PHONE=917019436720
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:10000/api
```

## Database Setup (MongoDB Atlas)

1. Create a MongoDB Atlas cluster
2. Get your connection string
3. Replace the MONGODB_URI in backend/.env with your connection string
4. The database will be automatically initialized with collections on first run

## API Endpoints

### Courses
- `GET /api/courses` - Get all courses (technical, non-technical, or all)

### Enrollments
- `POST /api/enrollments` - Create new enrollment
- `GET /api/enrollments` - Get all enrollments (admin)
- `GET /api/enrollments/stats` - Get enrollment statistics

### Contacts
- `POST /api/contacts` - Submit contact form
- `GET /api/contacts` - Get all contacts (admin)

### Health Check
- `GET /health` - API health status

## Deployment

### Backend (Render)
1. Push code to GitHub
2. Connect repository to Render
3. Use the provided `render.yaml` for configuration
4. Set environment variables in Render dashboard

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Use the provided `vercel.json` for configuration
4. Set VITE_API_URL environment variable

## Project Structure

```
Connect2Future/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   ├── package.json
│   ├── render.yaml
│   └── .env.example
└── frontend/
    ├── public/
    │   └── favicon.svg
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx & Navbar.css
    │   │   ├── Footer.jsx & Footer.css
    │   │   ├── WhatsAppFloat.jsx & WhatsAppFloat.css
    │   │   └── ScrollToTop.jsx
    │   ├── pages/
    │   │   ├── Home.jsx & Home.css
    │   │   ├── About.jsx & About.css
    │   │   ├── WhyChooseUs.jsx & WhyChooseUs.css
    │   │   ├── Courses.jsx & Courses.css
    │   │   ├── CourseDetails.jsx & CourseDetails.css
    │   │   ├── Contact.jsx & Contact.css
    │   │   ├── Enrollment.jsx & Enrollment.css
    │   │   └── NotFound.jsx & NotFound.css
    │   ├── styles/
    │   │   └── global.css
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── vercel.json
    └── .env.example
```

## Features

✅ Professional responsive design
✅ Smooth animations with Framer Motion
✅ Course filtering (Technical/Non-Technical)
✅ Course search functionality
✅ Enrollment form with MongoDB storage
✅ Contact form with MongoDB storage
✅ WhatsApp floating button
✅ Glassmorphism navbar on scroll
✅ Mobile-responsive navigation
✅ SEO meta tags
✅ 404 error page
✅ Loading states
✅ Form validation
✅ Success/error notifications

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Support

For questions or issues, please contact:
- Email: hr@connect2future.com
- Phone: +91 7019436720
- WhatsApp: https://wa.me/917019436720

## License

MIT License - feel free to use this project for your own EdTech platform.