import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, index: true },
  email: String,
  name: String,
  age: Number,
  gender: String,
  weight: Number,
  height: Number,
  goal: String,
  bmi: Number,
  profileFilled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', UserSchema);
