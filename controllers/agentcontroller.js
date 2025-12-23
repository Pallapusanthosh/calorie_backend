import User from "../models/User.js";
import Meal from "../models/Meal.js";
// const { callAIAgent } = require("../Services/aiAgentService.js");
import  callAIAgent  from "../Services/aiAgentService.js";

export const chatAgent = async (req, res) => {
  try {
    const userId = req.user.id ;
    const { question } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const todayMeals = await Meal.find({
      userId,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });

    const todayCalories = todayMeals.reduce(
      (sum, m) => sum + (m.calories || 0),
      0
    );

    const context = {
      age: user.age,
      gender: user.gender,
      weight_kg: user.weight,
      height_cm: user.height,
      goal: user.goal,
      bmi: user.bmi,
      today_calories: todayCalories,
      diet_type: "custom", // optional future field
      protein_today: todayMeals.reduce(
        (sum, m) => sum + (m.macros?.protein || 0),
        0
      )
    };

    const aiResponse = await callAIAgent("/agent/chat", {
      user_id: userId,
      question,
      context
    });

    res.json(aiResponse);
  } catch (err) {
    res.status(502).json({ error: "AI service unavailable" });
  }
};
