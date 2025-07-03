import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Ensure 'cors' is installed (npm install cors)
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import dataRoutes from './routes/dataRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import userRoutes from './routes/userRoutes.js';
import tradieRoutes from './routes/tradieRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';

dotenv.config(); // Load environment variables from .env file

connectDB(); // Connect to MongoDB Atlas

const app = express();

// --- START CORS CONFIGURATION FIX ---

// Define the allowed origins for CORS.
// This array should include all domains from which your frontend might access the backend.
const allowedOrigins = [
    'http://localhost:5173', // Your React dev server (Vite default)
    'http://localhost:3000', // Common for create-react-app dev server
    'https://686652c3cc9662c1fb8111f2--chipper-cucurucho-a61e9c.netlify.app', 
    'https://tradiestop.online',
    'https://www.tradiestop.online' // Your specific Netlify frontend URL
    // Add any other Netlify preview URLs or your custom domain here once you set it up.
    // E.g., 'https://www.tradiestop.online', 'https://tradiestop-dev.netlify.app'
];

const corsOptions = {
    origin: function (origin, callback) {
        // If the origin is not provided (e.g., direct API calls, same-origin requests), allow it.
        // Otherwise, check if the origin is in our allowedOrigins list.
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error('Not allowed by CORS')); // Block the request
        }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'], // Explicitly allowed HTTP methods
    credentials: true, // Allow cookies, authorization headers etc. to be sent with requests
    optionsSuccessStatus: 204 // Standard status for preflight requests
};

// Apply the CORS middleware with the defined options
app.use(cors(corsOptions));
// --- END CORS CONFIGURATION FIX ---

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies (optional, but good practice)

app.get('/', (req, res) => {
    res.send('TradieStop API is running...');
});

// Your API Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tradies', tradieRoutes);
app.use('/api/invoices', invoiceRoutes);

const PORT = process.env.PORT || 5001; // Use port 5001 by default if PORT env var is not set

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
