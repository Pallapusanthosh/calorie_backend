import axios from "axios";

const client = axios.create({
  baseURL: process.env.AI_AGENT_URL, 
  timeout: 12000
});

export default async function callAIAgent(endpoint, payload, retries = 2) {
  try {
    const res = await client.post(endpoint, payload);
    return res.data;
  } catch (err) {
    if (retries > 0) {
      return callAIAgent(endpoint, payload, retries - 1);
    }
    throw err;
  }
}

