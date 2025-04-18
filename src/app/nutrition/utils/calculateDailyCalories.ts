// Interface to remove type errors
interface UserData {
  sex: "male" | "female";
  age: number;
  height: number;
  weight: number;
  targetWeight: number;
  activityLevel: "Lightly Active" | "Active" | "Very Active";
}

export function calculateDailyCalories(
  user: UserData | null,
  caloriesBurnedToday = 0
) {
  if (!user) return 2000;
  const { sex, age, height, weight, targetWeight, activityLevel } = user;

  // Base BMR level
  let bmr;
  if (sex === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Multiplying by activity level
  let factor = 1.2;
  if (activityLevel === "Lightly Active") factor = 1.375;
  else if (activityLevel === "Active") factor = 1.55;
  else if (activityLevel === "Very Active") factor = 1.725;

  const maintenanceCalories = Math.round(bmr * factor);

  // Adjust calories based on target
  let dailyGoal = maintenanceCalories;
  if (weight > targetWeight) {
    dailyGoal = maintenanceCalories - 500;
  } else if (weight < targetWeight) {
    dailyGoal = maintenanceCalories + 500;
  }

  // Deduct calories burned through exercise
  dailyGoal -= caloriesBurnedToday;

  return dailyGoal;
}
