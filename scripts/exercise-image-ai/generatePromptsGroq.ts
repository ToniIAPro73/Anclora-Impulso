import fs from "fs"
import path from "path"
import dotenv from "dotenv"
import { GroqProvider } from "../../backend/src/services/llm/groq.provider"

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, "../../backend/.env") })

const apiKey = process.env.GROQ_API_KEY || "";
const PROMPTS_FILE = "./data/prompts.json";
const EXERCISES_FILE = "./data/exercises.json";

// Use a model with higher rate limits for bulk generation
const groq = new GroqProvider(apiKey, "llama-3.1-8b-instant")

const exercises = JSON.parse(fs.readFileSync(EXERCISES_FILE, "utf8"))

async function run() {
  let prompts: any[] = [];
  
  if (fs.existsSync(PROMPTS_FILE)) {
    try {
      prompts = JSON.parse(fs.readFileSync(PROMPTS_FILE, "utf8"));
      console.log(`Loaded ${prompts.length} existing prompts.`);
    } catch (e) {
      console.log("Starting with fresh prompts file.");
    }
  }

  for (const ex of exercises) {
    // Skip if already generated
    if (prompts.find(p => p.id === ex.id)) {
      continue;
    }

    console.log("Generating prompt:", ex.name)

    try {
      const response = await groq.generateCompletion({
        messages: [
          {
            role: 'system',
            content: `
You are a fitness biomechanical expert.

Generate a clear image prompt for a fitness exercise illustration.

Requirements:

• same male athletic model
• realistic fitness style
• show start and end pose
• full body visible
• clean background
`
          },
          {
            role: 'user',
            content: `
Exercise: ${ex.name}
Equipment: ${ex.equipment}

Describe:

LEFT pose (start)
RIGHT pose (end)

Optimized for image generation.
`
          }
        ]
      })

      prompts.push({
        id: ex.id,
        name: ex.name,
        prompt: response.content
      })

      // Save progress after each successful generation to be safe
      fs.writeFileSync(PROMPTS_FILE, JSON.stringify(prompts, null, 2))
      
      // Small delay to avoid hitting rate limits too quickly
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error: any) {
      if (error.status === 429) {
        console.error(`Rate limit hit for ${ex.name}. Stopping for now. Please run again in a few minutes.`);
        console.error(error.message);
        break; 
      } else {
        console.error(`Error generating prompt for ${ex.name}:`, error.message);
      }
    }
  }

  console.log("Total prompts now available:", prompts.length)
}

run()