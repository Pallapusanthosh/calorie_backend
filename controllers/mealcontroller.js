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
    breakdown[meal.mealType] += meal.calories;
    totalCalories += meal.calories;
  });

  res.send({ date: startOfDay.toISOString().split('T')[0], total: totalCalories, breakdown });
};

export const getMonthlyMeals = async (req, res) => {
  // Get the current date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Calculate the start of the current month
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  // Calculate the end of the current month
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);
  
  // Get the number of days in the current month
  const daysInMonth = endOfMonth.getDate();

  // Get all meals for the current month
  const meals = await Meal.find({ 
    userId: req.user._id, 
    createdAt: { 
      $gte: startOfMonth,
      $lte: endOfMonth
    } 
  });

  // Initialize an object to store daily totals
  const dailyTotals = {};

  // Process each meal
  meals.forEach(meal => {
    const date = new Date(meal.createdAt);
    const day = date.getDate();
    const dayKey = day.toString();
    
    if (!dailyTotals[dayKey]) {
      dailyTotals[dayKey] = {
        day: day,
        total: 0,
        breakdown: { breakfast: 0, lunch: 0, dinner: 0, snacks: 0, other: 0 }
      };
    }
    
    dailyTotals[dayKey].total += meal.calories;
    dailyTotals[dayKey].breakdown[meal.mealType] += meal.calories;
  });

  // Create an array with all days of the month (1 to daysInMonth)
  const result = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dayKey = day.toString();
    if (dailyTotals[dayKey]) {
      // Day has data
      result.push({
        day: day,
        total: dailyTotals[dayKey].total,
        breakdown: dailyTotals[dayKey].breakdown
      });
    } else {
      // Day has no data
      result.push({
        day: day,
        total: 0,
        breakdown: { breakfast: 0, lunch: 0, dinner: 0, snacks: 0, other: 0 }
      });
    }
  }

  // Add month and year information
  const monthName = startOfMonth.toLocaleString('default', { month: 'long' });
  
  res.send({
    month: monthName,
    year: currentYear,
    days: result
  });
};
