import User from "../models/User.js";
import Meal from "../models/Meal.js";
import  callAIAgent  from "../services/aiAgentService.js";
// const { callAIAgent } = require("../Services/aiAgentService.js");

export const dailyAdvice = async (req, res) => {
  try {
    const userId =req.user.id||  "67fd9a69951cc9a31da518ee";

    const user = await User.findById(userId);
    const meals = await Meal.find({
      userId,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });

    const calories = meals.reduce((s, m) => s + (m.calories || 0), 0);

    const context = {
      goal: user.goal,
      today_calories: calories,
      target_calories: user.sessionInfo?.dailyCalories
    };

    const aiResponse = await callAIAgent("/agent/daily-advice", {
      user_id: userId,
      question: "",
      context
    });

    res.json(aiResponse);
  } catch (err) {
    console.log(err);
    res.status(502).json({ error: "AI unavailable" });
  }
};
