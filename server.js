require('express-async-errors');
require('colors');
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const connectDb = require('./config/db');
const errorHandler = require('./middleware/error');

// Load Routes
const bootcampRoute = require('./routes/bootcampRoute');
const courseRoute = require('./routes/courseRoute');
const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');
const reviewRoute = require('./routes/reviewRoute');
const { use } = require('express/lib/router');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connecting Database
connectDb();

const app = express();

// Body Parser
app.use(express.json());

// Cookie Parser
app.use(cookieParser());

// File Upload
app.use(fileupload());

// Prevent NoSql Injection or Sanitize data
app.use(mongoSanitize());

// Set Security Headers
app.use(helmet());

// Prevent XSS attacks means running js code in user input
app.use(xss());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
});

app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable cors
app.use(cors());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Dev Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount Routes
app.use('/api/v1/bootcamps', bootcampRoute);
app.use('/api/v1/courses', courseRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/reviews', reviewRoute);

// Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// console.log(server);

// Unhandled Promise Rejection
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.bgRed.white.underline.bold);

  // Exit app
  server.close(() => process.exit(1));
});
