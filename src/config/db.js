import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MONGODB', error);
    process.exit(1);
  }
};
