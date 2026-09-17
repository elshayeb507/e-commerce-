import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import apiRoutes from './routes';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/egypt_fresh_store';


app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const envOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
        : ['*'];

      if (
        envOrigins.includes('*') ||
        envOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  return res.status(200).json({
    status: 'online',
    store: 'سوق آل حمام',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', apiRoutes);


app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'حدث خطأ داخلي في الخادم',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});


const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log(' Connected to MongoDB (Primary/Atlas)');
  } catch (atlasErr: any) {
    console.warn('MongoDB Atlas connection warning (' + atlasErr.message + '), trying local fallback...');
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/egypt_fresh_store', { serverSelectionTimeoutMS: 5000 });
      console.log(' Connected to Local MongoDB (127.0.0.1:27017)');
    } catch (localErr: any) {
      console.error(' Failed to connect to MongoDB:', localErr.message);
    }
  }
};

app.listen(PORT, () => {
  console.log(` Server listening on http://localhost:${PORT}`);
});

connectDB();

export default app;
