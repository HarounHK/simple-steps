"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { calculateDailyCalories } from "./utils/calculateDailyCalories";
import SearchModal from "./components/searchModal";
import AddFoodModal from "./components/addFoodModal";
import EditFoodModal from "./components/editFoodModal";

// Type definitions to stop deployment type errors
type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snacks";

interface DiaryEntry {
  _id: string;
  mealType: MealType;
  foodName: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
}

interface FoodItem {
  id?: string;
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  sugar: string;
}

export default function NutritionPage() {
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [datePicker, setDatePicker] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);

  // Error Message Display
  const [errorMessage, setErrorMessage] = useState("");

  // Search Modal
  const [searchModal, setSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<MealType>("Breakfast");

  // AddFood modal
  const [AFModal, setAFModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [portionSize, setPortionSize] = useState(100);

  // EditFood modal
  const [EFModal, setEFModal] = useState(false);
  const [editEntry, setEditEntry] = useState<DiaryEntry | null>(null);
  const [editPortion, setEditPortion] = useState(0);
  const [editFoodName, setEditFoodName] = useState("");
  const [editMealType, setEditMealType] = useState<MealType>("Breakfast");

  // Load user data
  useEffect(() => {
    loadDiary();
  }, [currentDate]);

  // Fetch the user profile and load diary entries
  async function loadDiary() {
    try {
      // Loading User Profile
      const profileResponse = await fetch("/api/profile");
      const dataProfile = await profileResponse.json();

      if (profileResponse.ok && dataProfile.user) {
        const newGoal = calculateDailyCalories(dataProfile.user);
        setDailyGoal(newGoal);
      } else {
        console.error("Error loading Profile data.");
      }

      // Loading daily diary
      const dateParam = currentDate.toISOString().split("T")[0];
      const diaryResponse = await fetch(`/api/diary/byDate/${dateParam}`);
      const dataDiary = await diaryResponse.json();

      if (!diaryResponse.ok) {
        throw new Error("Failed to fetch diary");
      }
      setDiaryEntries(dataDiary.entries || []);
      setErrorMessage("");
    } catch (error) {
      console.error("Error loading diary data:", error);
      setErrorMessage("Couldn’t load your diary right now. Please try again later.");
    }
  }

  // Shift date by days
  function handleChangeDate(days: number) {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  }

  // open/close datepicker
  function handleCalendarClick() {
    setDatePicker((prev) => !prev);
  }

  function handleDateInputChange(e: ChangeEvent<HTMLInputElement>) {
    const chosenDate = new Date(e.target.value);
    if (!isNaN(chosenDate.getTime())) {
      setCurrentDate(chosenDate);
      setDatePicker(false);
    }
  }

  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Handles Food Search
  async function findFood() {
    if (!searchQuery) return;

    try {
      const response = await fetch(`/api/nutrition?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (response.ok){
        setSearchResults(data.slice(0, 3));
        setErrorMessage("");
      }

    } catch (error) {
      console.error("Error searching for food:", error);
      setErrorMessage("Couldn’t search for foods right now. Please try again.");
    }
  }

  // Open/Close Search Modal
  function openSearchModal(meal: MealType) {
    setSelectedMeal(meal);
    setSearchModal(true);
    setSearchQuery("");
    setSearchResults([]);
  }
  function closeSearchModal() {
    setSearchModal(false);
  }

  // Open/Close AddFood Modal
  function openAFModal(foodItem: FoodItem) {
    setSelectedFood(foodItem);
    setPortionSize(100);
    setAFModal(true);
  }
  function closeAFModal() {
    setSelectedFood(null);
    setAFModal(false);
  }

  // Calculate macros for chosen portion size
  function getAdjustedMacros(food: FoodItem, grams: number) {
    const factor = grams / 100;
    return {
      name: food.name,
      grams,
      calories: (parseFloat(food.calories) * factor).toFixed(2),
      protein: (parseFloat(food.protein) * factor).toFixed(2),
      carbs: (parseFloat(food.carbs) * factor).toFixed(2),
      fat: (parseFloat(food.fat) * factor).toFixed(2),
      sugar: (parseFloat(food.sugar) * factor).toFixed(2),
    };
  }

  const previewMacros = selectedFood && getAdjustedMacros(selectedFood, portionSize);

  // Save new entry to DB
  async function addFood() {
    if (!selectedFood || !previewMacros) return;

    const newEntry = {
      mealType: selectedMeal,
      foodName: previewMacros.name,
      grams: previewMacros.grams,
      calories: parseFloat(previewMacros.calories),
      protein: parseFloat(previewMacros.protein),
      carbs: parseFloat(previewMacros.carbs),
      fat: parseFloat(previewMacros.fat),
      sugar: parseFloat(previewMacros.sugar),
    };

    const date = currentDate.toISOString().split("T")[0];

    try {
      const response = await fetch(`/api/diary/byDate/${date}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });

      if (!response.ok) {
        setErrorMessage("couldn’t save food");
        return;
      }

      closeAFModal();
      loadDiary();
    } catch (error) {
      console.error("Error saving entry:", error);
      setErrorMessage("Couldn’t add this food. Please try again later.");
    }
  }

  // Handles Deleting Entry
  async function deleteEntry(id: string) {
    if (!id) return;

    try {
      const response = await fetch(`/api/diary/byID/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setErrorMessage("Delete didnt work");
        return;
      }

      setDiaryEntries((prev) => prev.filter((x) => x._id !== id));
    } catch (error) {
      console.error("Error deleting entry:", error);
      setErrorMessage("Couldn’t delete the entry. Please try again soon.");
    }
  }

  // Open/Close Edit Modal
  function openEFModal(entry: DiaryEntry) {
    setEditEntry(entry);
    setEditPortion(entry.grams);
    setEditFoodName(entry.foodName);
    setEditMealType(entry.mealType);
    setEFModal(true);
  }
  function closeEFModal() {
    setEditEntry(null);
    setEFModal(false);
  }

  async function updateEntry() {
    if (!editEntry) return;

    const updatedData = {
      mealType: editMealType,
      foodName: editFoodName,
      grams: editPortion,
      calories: editEntry.calories,
      protein: editEntry.protein,
      carbs: editEntry.carbs,
      fat: editEntry.fat,
      sugar: editEntry.sugar,
    };

    try {
      const response = await fetch(`/api/diary/byID/${editEntry._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        console.log("update failed");
        setErrorMessage("couldn’t update entry");
        return;
      }

      closeEFModal();
      loadDiary();
    } catch (error) {
      console.error("Error updating entry:", error);
      setErrorMessage("Could not update this entry. Please try again later.");
    }
  }

  // Counts daily calories
  const totalCalories = diaryEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0);

  const difference = Math.round(totalCalories - dailyGoal);
  let dailySummary = "";

  if (difference > 0) {
    dailySummary = `You are OVER your daily goal by ${difference} kcal.`;
  } else if (difference < 0) {
    dailySummary = `You are UNDER your daily goal by ${Math.abs(difference)} kcal.`;
  } else {
    dailySummary = "You hit your daily calorie goal.";
  }

  // splits entries by meal
  const mealEntries: Record<MealType, DiaryEntry[]> = {
    Breakfast: diaryEntries.filter((e) => e.mealType === "Breakfast"),
    Lunch: diaryEntries.filter((e) => e.mealType === "Lunch"),
    Dinner: diaryEntries.filter((e) => e.mealType === "Dinner"),
    Snacks: diaryEntries.filter((e) => e.mealType === "Snacks"),
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#d8b4f8] p-6">
      {errorMessage && (
        <div className="mb-4 text-red-700 font-bold">{errorMessage}</div>
      )}

      <div className="max-w-3xl w-full bg-white p-6 rounded-md shadow-lg">
        
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-[#2a1a5e]">
            Your Food Diary For:
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleChangeDate(-1)}
              className="bg-[#2a1a5e] hover:bg-[#1f0e4f] text-white px-4 py-1 rounded"
            >
              ←
            </button>
            <span className="text-lg font-bold text-[#2a1a5e]">
              {formattedDate}
            </span>
            <button
              onClick={() => handleChangeDate(1)}
              className="bg-[#2a1a5e] hover:bg-[#1f0e4f] text-white px-4 py-1 rounded"
            >
              →
            </button>
            <button
              onClick={handleCalendarClick}
              className="bg-gray-300 hover:bg-gray-400 text-black px-2 py-1 rounded"
            >
              📅
            </button>
          </div>
        </div>

        {datePicker && (
          <div className="mb-4">
            <input
              type="date"
              className="border p-2 bg-gray-100 text-black rounded"
              onChange={handleDateInputChange}
            />
          </div>
        )}

        <div className="mb-4 text-[#2a1a5e] font-bold">
          Daily Goal: {dailyGoal} kcal | Eaten: {Math.round(totalCalories)} kcal
        </div>
        <div className="mb-4 text-black font-semibold">
          {dailySummary}
        </div>

        <div className="grid grid-cols-6 bg-[#2a1a5e] text-white font-bold text-center py-2 rounded mb-4">
          <div>Calories (kcal)</div>
          <div>Carbs (g)</div>
          <div>Fat (g)</div>
          <div>Protein (g)</div>
          <div>Sodium (mg)</div>
          <div>Sugar (g)</div>
        </div>

        {(["Breakfast", "Lunch", "Dinner", "Snacks"] as MealType[]).map((meal) => (
          <div key={meal} className="mb-6">
            <h2 className="text-xl font-bold text-black">{meal}</h2>
            {mealEntries[meal].map((entry) => (
              <div
                key={entry._id}
                className="flex justify-between items-center ml-4 text-black mt-2"
              >
                <span>
                  • {entry.foodName} ({entry.grams}g) = {entry.calories} kcal
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEFModal(entry)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteEntry(entry._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-2">
              <button
                className="underline text-black hover:text-gray-700"
                onClick={() => openSearchModal(meal)}
              >
                Add Food
              </button>
            </div>
          </div>
        ))}

        <div className="mt-8">
          <table className="w-full text-center border-collapse border border-gray-300 bg-white">
            <thead>
              <tr className="bg-gray-100 text-black">
                <th className="border border-gray-300 py-2">Totals</th>
                <th className="border border-gray-300 py-2">
                  {Math.round(totalCalories)} kcal
                </th>
                <th className="border border-gray-300 py-2">–</th>
                <th className="border border-gray-300 py-2">–</th>
                <th className="border border-gray-300 py-2">–</th>
                <th className="border border-gray-300 py-2">–</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>

      <SearchModal
        isOpen={searchModal}
        onClose={closeSearchModal}
        onSearch={findFood}
        query={searchQuery}
        setQuery={setSearchQuery}
        searchResults={searchResults}
        selectedMeal={selectedMeal}
        openAFModal={openAFModal}
      />

      <AddFoodModal
        isOpen={AFModal}
        onClose={closeAFModal}
        selectedMeal={selectedMeal}
        selectedFood={selectedFood}
        portionSize={portionSize}
        setPortionSize={setPortionSize}
        previewMacros={previewMacros}
        handleConfirmAddFood={addFood}
      />

      <EditFoodModal
        isOpen={EFModal}
        onClose={closeEFModal}
        editEntry={editEntry}
        editMealType={editMealType}
        setEditMealType={setEditMealType}
        editFoodName={editFoodName}
        setEditFoodName={setEditFoodName}
        editPortion={editPortion}
        setEditPortion={setEditPortion}
        handleConfirmEdit={updateEntry}
      />
    </div>
  );
}
