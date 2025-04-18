"use client";
import React, {
  useState,
  useEffect,
  ChangeEvent,
  useCallback
} from "react";
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

interface ExerciseEntry {
  _id: string;
  userId: string;
  date: string;
  mealType: MealType; 
  activityName: string;
  caloriesBurned: number;
  time?: string; 
}

interface ExerciseSearchResult {
  name?: string;
  activity?: string;
  calories_per_hour?: number;
}

export default function NutritionPage() {
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [datePicker, setDatePicker] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);

  // Error Message Display
  const [errorMessage, setErrorMessage] = useState("");

  // Search Modal (Food)
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

  const [searchExerciseModal, setSearchExerciseModal] = useState(false);
  const [searchExerciseQuery, setSearchExerciseQuery] = useState("");
  const [exerciseSearchResults, setExerciseSearchResults] =
    useState<ExerciseSearchResult[]>([]);

  // Holds exercise entries for the day
  const [exerciseEntries, setExerciseEntries] = useState<ExerciseEntry[]>([]);

  // Controls the Add Exercise modal
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseCalories, setExerciseCalories] = useState(0);

  // Edit an exercise
  const [editExerciseModalOpen, setEditExerciseModalOpen] = useState(false);
  const [editExerciseEntry, setEditExerciseEntry] = useState<ExerciseEntry | null>(null);
  const [editExerciseName, setEditExerciseName] = useState("");
  const [editCaloriesBurned, setEditCaloriesBurned] = useState(0);

  const [exerciseTime, setExerciseTime] = useState("");
  const [editExerciseTime, setEditExerciseTime] = useState("");
  const [caloriesBurnedToday, setCaloriesBurnedToday] = useState(0);

  const loadDiary = useCallback(async () => {
    try {
      const profileRes  = await fetch("/api/profile");
      const profileData = await profileRes.json();
  
      const dateISO = currentDate.toISOString().split("T")[0];
  
      const diaryRes  = await fetch(`/api/diary/byDate/${dateISO}`);
      const diaryData = await diaryRes.json();
      if (!diaryRes.ok) throw new Error("Diary fetch failed");
      setDiaryEntries(diaryData.entries || []);
  
      const exRes  = await fetch(`/api/diary/exercise/byDate/${dateISO}`);
      const exData = await exRes.json();
      setExerciseEntries(exRes.ok ? exData.entries || [] : []);
  
      const caloriesBurnedToday =
        (exData.entries || []).reduce(
          (sum: number, e: ExerciseEntry) => sum + (e.caloriesBurned || 0),
          0
        );
      
      setCaloriesBurnedToday(caloriesBurnedToday); 
  
      if (profileRes.ok && profileData.user) {
        const newGoal = calculateDailyCalories(profileData.user, caloriesBurnedToday);
        setDailyGoal(newGoal);
      }
  
      setErrorMessage("");
    } catch (err) {
      console.error(err);
      setErrorMessage("Couldn’t load your diary. Please try again.");
    }
  }, [currentDate]);

  // Load user data
  useEffect(() => {
    loadDiary();
  }, [loadDiary]);

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

  async function findFood() {
    if (!searchQuery) return;

    try {
      console.log(" Searching for:", searchQuery);

      const response = await fetch(
        `/api/nutrition?query=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (response.ok) {
        setSearchResults(data.slice(0, 3));
        setErrorMessage("");
      } else {
        setErrorMessage(data.error || "Unknown error from API");
      }
    } catch (error) {
      console.error("Error searching for food:", error);
      setErrorMessage("Couldn’t search for foods right now. Please try again.");
    }
  }

  async function findExercise() {
    if (!searchExerciseQuery) return;
    try {
      const response = await fetch(
        `/api/exercise?activity=${encodeURIComponent(searchExerciseQuery)}`
      );
      const data = await response.json();

      if (response.ok) {
        setExerciseSearchResults(data.slice(0, 3));
        setErrorMessage("");
      } else {
        setErrorMessage(data.error || "Unknown error from Exercise API");
      }
    } catch (error) {
      console.error("Error searching for exercises:", error);
      setErrorMessage("Couldn’t search for exercises right now. Please try again.");
    }
  }

  // open the search EXERCISE modal
  function openSearchExercise() {
    setSearchExerciseQuery("");
    setExerciseSearchResults([]);
    setSearchExerciseModal(true);
  }

  function openSearchModal(meal: MealType) {
    setSelectedMeal(meal);
    setSearchModal(true);
    setSearchQuery("");
    setSearchResults([]);
  }
  function closeSearchModal() {
    setSearchModal(false);
  }

  function openAFModal(foodItem: FoodItem) {
    setSelectedFood(foodItem);
    setPortionSize(100);
    setAFModal(true);
  }
  function closeAFModal() {
    setSelectedFood(null);
    setAFModal(false);
  }

  // calculate macros for chosen portion size
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

  const previewMacros =
    selectedFood && getAdjustedMacros(selectedFood, portionSize);

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
      mealType:	editMealType,
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

  // Food totals
  const totalCalories = diaryEntries.reduce(
    (sum, entry) => sum + (entry.calories || 0),
    0
  );
  const totalBurned = exerciseEntries.reduce(
    (sum, entry) => sum + (entry.caloriesBurned || 0),
    0
  );
  const netCalories = totalCalories - totalBurned;
  const difference = Math.round(netCalories - dailyGoal);
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

  // function openAddExercise() {
  //   setExerciseName("Running");
  //   setExerciseCalories(200);
  //   setExerciseTime(""); 
  //   setExerciseModalOpen(true);
  // }

  function closeAddExercise() {
    setExerciseModalOpen(false);
    setExerciseName("");
    setExerciseCalories(0);
    setExerciseTime(""); 
  }

  async function confirmAddExercise() {
    if (!exerciseName || !exerciseCalories) return;

    const date = currentDate.toISOString().split("T")[0];
    const newEntry = {
      mealType: "Snacks", 
      activityName: exerciseName,
      caloriesBurned: exerciseCalories,
      time: exerciseTime
    };

    try {
      const response = await fetch(`/api/diary/exercise/byDate/${date}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });

      if (!response.ok) {
        setErrorMessage("Couldn't add exercise");
        return;
      }

      closeAddExercise();
      loadDiary();
    } catch (error) {
      console.error("Error adding exercise:", error);
      setErrorMessage("Could not add exercise. Please try again later.");
    }
  }

  async function deleteExercise(id: string) {
    try {
      const response = await fetch(`/api/diary/exercise/byID/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setErrorMessage("Delete exercise didn't work");
        return;
      }

      setExerciseEntries((prev) => prev.filter((x) => x._id !== id));
    } catch (error) {
      console.error("Error deleting exercise:", error);
      setErrorMessage("Couldn’t delete the exercise. Please try again soon.");
    }
  }

  function openEditExercise(entry: ExerciseEntry) {
    setEditExerciseEntry(entry);
    setEditExerciseName(entry.activityName);
    setEditCaloriesBurned(entry.caloriesBurned);
    setEditExerciseTime(entry.time || "");
    setEditExerciseModalOpen(true);
  }

  function closeEditExercise() {
    setEditExerciseEntry(null);
    setEditExerciseModalOpen(false);
  }

  async function updateExercise() {
    if (!editExerciseEntry) return;

    const updatedData = {
      mealType: editExerciseEntry.mealType,
      activityName: editExerciseName,
      caloriesBurned: editCaloriesBurned,
      time: editExerciseTime
    };

    try {
      const response = await fetch(`/api/diary/exercise/byID/${editExerciseEntry._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        setErrorMessage("Couldn’t update exercise");
        return;
      }

      closeEditExercise();
      loadDiary();
    } catch (error) {
      console.error("Error updating exercise:", error);
      setErrorMessage("Could not update exercise. Please try again later.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center pt-32 bg-[#d8b4f8] p-6">
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
          Daily Goal: {dailyGoal} kcal | Eaten: {Math.round(totalCalories)} kcal | Burned: {caloriesBurnedToday} kcal
        </div>
        <div className="mb-4 text-black font-semibold">{dailySummary}</div>

        <div className="grid grid-cols-6 bg-[#2a1a5e] text-white font-bold text-center py-2 rounded mb-4">
          <div>Calories (kcal)</div>
          <div>Carbs (g)</div>
          <div>Fat (g)</div>
          <div>Protein (g)</div>
          <div>Sodium (mg)</div>
          <div>Sugar (g)</div>
        </div>

        {(["Breakfast", "Lunch", "Dinner", "Snacks"] as MealType[]).map(
          (meal) => (
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
          )
        )}

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

        <h2 className="text-xl font-bold text-black mt-8">Exercises</h2>

        <button
          className="underline text-black hover:text-gray-700 mt-2 mb-2"
          onClick={openSearchExercise}
        >
          Add Exercise
        </button>

        {exerciseEntries.map((entry) => (
          <div
            key={entry._id}
            className="flex justify-between items-center ml-4 text-black mt-2"
          >
            <span>
              • {entry.activityName} {entry.time ? `@ ${entry.time}` : ""} ={" "}
              {entry.caloriesBurned} kcal burned
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => openEditExercise(entry)}
                className="text-blue-500 hover:text-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => deleteExercise(entry._id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
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

      <SearchExerciseModal
        isOpen={searchExerciseModal}
        onClose={() => setSearchExerciseModal(false)}
        onSearch={findExercise}
        query={searchExerciseQuery}
        setQuery={setSearchExerciseQuery}
        searchResults={exerciseSearchResults}
        addExerciseModal={(exercise) => {
          setExerciseName(exercise.name || exercise.activity || "");
          setExerciseCalories(exercise.calories_per_hour || 0);
          setSearchExerciseModal(false);
          setExerciseModalOpen(true);
        }}
      />

      <AddExerciseModal
        isOpen={exerciseModalOpen}
        onClose={closeAddExercise}
        exerciseName={exerciseName}
        setExerciseName={setExerciseName}
        exerciseCalories={exerciseCalories}
        setExerciseCalories={setExerciseCalories}
        exerciseTime={exerciseTime}
        setExerciseTime={setExerciseTime}
        confirmAddExercise={confirmAddExercise}
      />

      <EditExerciseModal
        isOpen={editExerciseModalOpen}
        onClose={closeEditExercise}
        editExerciseEntry={editExerciseEntry}
        editExerciseName={editExerciseName}
        setEditExerciseName={setEditExerciseName}
        editCaloriesBurned={editCaloriesBurned}
        setEditCaloriesBurned={setEditCaloriesBurned}
        editExerciseTime={editExerciseTime}
        setEditExerciseTime={setEditExerciseTime}
        handleConfirmEditExercise={updateExercise}
      />
    </div>
  );
}

function AddExerciseModal({
  isOpen,
  onClose,
  exerciseName,
  setExerciseName,
  exerciseCalories,
  setExerciseCalories,
  confirmAddExercise,
  exerciseTime,
  setExerciseTime
}: {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  setExerciseName: (val: string) => void;
  exerciseCalories: number;
  setExerciseCalories: (val: number) => void;
  exerciseTime: string;
  setExerciseTime: (val: string) => void;
  confirmAddExercise: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-5 rounded-lg shadow w-full max-w-md">
        <h2 className="text-base font-bold text-black mb-3">
          Add Exercise
        </h2>

        <label className="block text-black font-bold mb-1">Exercise Name</label>
        <input
          type="text"
          className="border p-2 w-full bg-gray-100 text-black rounded mb-4"
          value={exerciseName}
          onChange={(e) => setExerciseName(e.target.value)}
        />

        <label className="block text-black font-bold mb-1">Calories Burned</label>
        <input
          type="number"
          className="border p-2 w-full bg-gray-100 text-black rounded mb-4"
          value={exerciseCalories}
          onChange={(e) => setExerciseCalories(Number(e.target.value))}
        />

        <label className="block text-black font-bold mb-1">Time</label>
        <input
          type="time"
          className="border p-2 w-full bg-gray-100 text-black rounded mb-4"
          value={exerciseTime}
          onChange={(e) => setExerciseTime(e.target.value)}
        />

        <div className="mt-4 flex gap-2">
          <button
            onClick={confirmAddExercise}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
          >
            Add Exercise
          </button>
          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded w-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function SearchExerciseModal({
  isOpen,
  onClose,
  onSearch,
  query,
  setQuery,
  searchResults,
  addExerciseModal,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSearch: () => void;
  query: string;
  setQuery: (val: string) => void;
  searchResults: ExerciseSearchResult[];
  addExerciseModal: (ex: ExerciseSearchResult) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold text-black mb-2">Search Exercise</h2>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. running, swimming"
          className="border p-2 w-full bg-gray-100 text-black rounded mb-2"
        />

        <button
          onClick={onSearch}
          className="bg-[#2a1a5e] text-white px-4 py-2 rounded w-full mb-2"
        >
          Search
        </button>

        {searchResults.map((item, idx) => (
          <div key={idx} className="border-b py-2 text-black">
            <h3 className="font-bold">{item.name || item.activity}</h3>
            <p>Calories/hour: {item.calories_per_hour ?? 0}</p>

            <button
              onClick={() => {
                addExerciseModal(item);
              }}
              className="bg-green-500 text-white px-4 py-1 rounded mt-2"
            >
              Add
            </button>
          </div>
        ))}

        <button
          onClick={onClose}
          className="bg-red-500 text-white px-4 py-2 rounded w-full mt-4"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function EditExerciseModal({
  isOpen,
  onClose,
  editExerciseEntry,
  editExerciseName,
  setEditExerciseName,
  editCaloriesBurned,
  setEditCaloriesBurned,
  editExerciseTime,
  setEditExerciseTime,
  handleConfirmEditExercise,
}: {
  isOpen: boolean;
  onClose: () => void;
  editExerciseEntry: ExerciseEntry | null;
  editExerciseName: string;
  setEditExerciseName: (val: string) => void;
  editCaloriesBurned: number;
  setEditCaloriesBurned: (val: number) => void;
  editExerciseTime: string;
  setEditExerciseTime: (val: string) => void;
  handleConfirmEditExercise: () => void;
}) {
  if (!isOpen || !editExerciseEntry) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold text-black mb-4">Edit Exercise</h2>

        <label className="block text-black font-bold mb-1">Exercise Name</label>
        <input
          type="text"
          className="border p-2 w-full bg-gray-100 text-black rounded mb-4"
          value={editExerciseName}
          onChange={(e) => setEditExerciseName(e.target.value)}
        />

        <label className="block text-black font-bold mb-1">Calories Burned</label>
        <input
          type="number"
          className="border p-2 w-full bg-gray-100 text-black rounded mb-4"
          value={editCaloriesBurned}
          onChange={(e) => setEditCaloriesBurned(Number(e.target.value))}
        />

        <label className="block text-black font-bold mb-1">Time</label>
        <input
          type="time"
          className="border p-2 w-full bg-gray-100 text-black rounded mb-4"
          value={editExerciseTime}
          onChange={(e) => setEditExerciseTime(e.target.value)}
        />

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleConfirmEditExercise}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-black px-4 py-2 rounded w-full"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
