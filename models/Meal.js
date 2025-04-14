import mongoose from 'mongoose';

const MealSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mealType: String,
  calories: Number,
  items: [String],
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Meal', MealSchema);
