import { db } from "./db"

export async function seedExercises() {
  const exercises = [
    {
      id: "1",
      name: "Push-ups",
      category: "strength",
      muscle_groups: ["chest", "arms"],
      equipment: "bodyweight",
      difficulty_level: "beginner",
      description: "Classic upper body exercise",
      instructions: ["Start in plank position", "Lower body to ground", "Push back up"],
    },
    {
      id: "2",
      name: "Squats",
      category: "strength",
      muscle_groups: ["legs"],
      equipment: "bodyweight",
      difficulty_level: "beginner",
      description: "Fundamental lower body exercise",
      instructions: ["Stand with feet shoulder-width apart", "Lower hips back and down", "Return to standing"],
    },
    {
      id: "3",
      name: "Pull-ups",
      category: "strength",
      muscle_groups: ["back", "arms"],
      equipment: "bodyweight",
      difficulty_level: "intermediate",
      description: "Upper body pulling exercise",
      instructions: ["Hang from bar with overhand grip", "Pull body up until chin over bar", "Lower with control"],
    },
    {
      id: "4",
      name: "Plank",
      category: "strength",
      muscle_groups: ["core"],
      equipment: "bodyweight",
      difficulty_level: "beginner",
      description: "Core stability exercise",
      instructions: ["Start in forearm plank position", "Keep body straight", "Hold position"],
    },
    {
      id: "5",
      name: "Lunges",
      category: "strength",
      muscle_groups: ["legs"],
      equipment: "bodyweight",
      difficulty_level: "beginner",
      description: "Single-leg lower body exercise",
      instructions: ["Step forward with one leg", "Lower hips until both knees bent at 90°", "Return to start"],
    },
    {
      id: "6",
      name: "Burpees",
      category: "cardio",
      muscle_groups: ["legs", "chest", "core"],
      equipment: "bodyweight",
      difficulty_level: "intermediate",
      description: "Full body cardio exercise",
      instructions: ["Start standing", "Drop to plank", "Do push-up", "Jump feet to hands", "Jump up"],
    },
    {
      id: "7",
      name: "Dumbbell Bench Press",
      category: "strength",
      muscle_groups: ["chest", "shoulders", "arms"],
      equipment: "dumbbells",
      difficulty_level: "intermediate",
      description: "Chest pressing exercise with dumbbells",
      instructions: ["Lie on bench with dumbbells", "Press weights up", "Lower with control"],
    },
    {
      id: "8",
      name: "Deadlifts",
      category: "strength",
      muscle_groups: ["back", "legs"],
      equipment: "barbell",
      difficulty_level: "advanced",
      description: "Compound posterior chain exercise",
      instructions: ["Stand with feet hip-width", "Grip barbell", "Lift by extending hips and knees"],
    },
    {
      id: "9",
      name: "Mountain Climbers",
      category: "cardio",
      muscle_groups: ["core", "legs"],
      equipment: "bodyweight",
      difficulty_level: "beginner",
      description: "Dynamic cardio and core exercise",
      instructions: ["Start in plank position", "Alternate bringing knees to chest", "Keep core engaged"],
    },
    {
      id: "10",
      name: "Dumbbell Rows",
      category: "strength",
      muscle_groups: ["back", "arms"],
      equipment: "dumbbells",
      difficulty_level: "intermediate",
      description: "Back pulling exercise",
      instructions: ["Bend at hips with dumbbell", "Pull weight to hip", "Lower with control"],
    },
    {
      id: "11",
      name: "Shoulder Press",
      category: "strength",
      muscle_groups: ["shoulders", "arms"],
      equipment: "dumbbells",
      difficulty_level: "intermediate",
      description: "Overhead pressing exercise",
      instructions: ["Hold dumbbells at shoulder height", "Press overhead", "Lower with control"],
    },
    {
      id: "12",
      name: "Bicycle Crunches",
      category: "strength",
      muscle_groups: ["core"],
      equipment: "bodyweight",
      difficulty_level: "beginner",
      description: "Core rotation exercise",
      instructions: ["Lie on back", "Alternate elbow to opposite knee", "Keep core engaged"],
    },
  ]

  try {
    const existingExercises = await db.getAll("exercises")
    if (existingExercises.length === 0) {
      for (const exercise of exercises) {
        await db.add("exercises", exercise)
      }
      console.log("[v0] Seeded exercises successfully")
    }
  } catch (error) {
    console.error("[v0] Error seeding exercises:", error)
  }
}
