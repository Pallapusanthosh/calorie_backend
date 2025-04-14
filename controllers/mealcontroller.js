import Meal from '../models/Meal.js';
import calorieDatabase from '../utils/calorie_Database.json' with { type: 'json' };
import processImageWithYOLO from '../utils/process_image.js';
 


export const addMeal = async (req, res) => {
    const { mealType, weight } = req.body;
    const yoloResults = await processImageWithYOLO(req.file.path);
    console.log("yolo123", yoloResults);
  
    const uniqueItems = [...new Set(yoloResults.map(item => item.name))];
    const weightPerItem = weight / uniqueItems.length;
  
    const items = uniqueItems.map(name => {
      const itemData = calorieDatabase.find(item => item.name.toLowerCase() === name.toLowerCase());
      const caloriesPer100g = itemData ? itemData.calories : 0;
      const calories = (caloriesPer100g * weightPerItem) / 100;
      return { name, calories: Math.round(calories) };
    });
  
    const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);
  
    const meal = await Meal.create({
      userId: req.user._id,
      mealType,
      calories: totalCalories,
      items: items.map(i => `${i.name} (${i.calories} cal)`),
      imageUrl: req.file.path,
    });
  
    res.status(201).send({ meal, predictions: items });
  };

  
export const getDailyMeals = async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const meals = await Meal.find({ userId: req.user._id, createdAt: { $gte: startOfDay } });

  const breakdown = { breakfast: 0, lunch: 0, dinner: 0, snacks: 0, other: 0 };
  let totalCalories = 0;

  meals.forEach(meal => {
    meal.items.forEach(item => {
      const [name, cal] = item.split(' (');
      const calories = parseInt(cal);
      breakdown[meal.mealType]+=calories;
      totalCalories += calories;
    });
  });

  res.send({ date: startOfDay.toISOString().split('T')[0], total: totalCalories, breakdown });
};

export const getMonthlyMeals = async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const meals = await Meal.find({ userId: req.user._id, createdAt: { $gte: thirtyDaysAgo } });

  const monthlyData = {};
  meals.forEach(meal => {
    const date = meal.createdAt.toISOString().split('T')[0];
    if (!monthlyData[date]) monthlyData[date] = 0;
    monthlyData[date] += meal.calories;
  });

  res.send(Object.entries(monthlyData).map(([date, total]) => ({ date, total })));
};
