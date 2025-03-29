"use client";
import React, { Dispatch, SetStateAction } from "react";

// Type definitions to stop type errors
type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snacks";

interface EditEntry {
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

interface EditFoodModalInterface {
  isOpen: boolean;
  onClose: () => void;
  editEntry: EditEntry | null;
  editMealType: MealType;
  setEditMealType: Dispatch<SetStateAction<MealType>>;
  editFoodName: string;
  setEditFoodName: (val: string) => void;
  editPortion: number;
  setEditPortion: (val: number) => void;
  handleConfirmEdit: () => void;
}

// Function for editing food entries
export default function EditFoodModal({
  isOpen,
  onClose,
  editEntry,
  editMealType,
  setEditMealType,
  editFoodName,
  setEditFoodName,
  editPortion,
  setEditPortion,
  handleConfirmEdit,
}: EditFoodModalInterface) {
  if (!isOpen || !editEntry) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold text-black mb-3">
          Edit Entry ({editEntry.mealType})
        </h2>

        <label className="block text-black font-bold mb-1">Meal Type</label>
        <select
          className="border p-2 w-full bg-gray-100 text-black rounded mb-4"
          value={editMealType}
          onChange={(e) => setEditMealType(e.target.value as MealType)}
        >
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
          <option value="Snacks">Snacks</option>
        </select>

        <label className="block text-black font-bold mb-1">Food Name</label>
        <input
          type="text"
          className="border p-2 w-full bg-gray-100 text-black rounded mb-4"
          value={editFoodName}
          onChange={(e) => setEditFoodName(e.target.value)}
        />

        <label className="block text-black font-bold mb-1">Portion (g)</label>
        <input
          type="number"
          className="border p-2 w-full bg-gray-100 text-black rounded mb-4"
          value={editPortion}
          onChange={(e) => setEditPortion(Number(e.target.value))}
        />

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleConfirmEdit}
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
