import User from "../models/User.js";
import  callAIAgent  from "../services/aiAgentService.js";
// const { callAIAgent } = require("../Services/aiAgentService.js");

export const mealRecommendation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mealDescription } = req.body;

    const user = await User.findById(userId);

    const context = {
      goal: user.goal,
      weight_kg: user.weight,
      last_meal: mealDescription
    };

    const aiResponse = await callAIAgent("/agent/recommendation", {
      user_id: userId,
      question: mealDescription,
      context
    });

    res.json(aiResponse);
  } catch (err) {
    res.status(502).json({ error: "AI unavailable" });
  }
};
