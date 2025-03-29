"use client";
import React from "react";

interface FoodItem {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  sugar: string;
}

interface MacrosPreview {
  grams: number;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  sugar: string;
}

interface AFModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMeal: string;
  selectedFood: FoodItem | null;
  portionSize: number;
  setPortionSize: (val: number) => void;
  previewMacros: MacrosPreview | null;
  handleConfirmAddFood: () => void;
}

export default function AddFoodModal({
  isOpen,
  onClose,
  selectedMeal,
  selectedFood,
  portionSize,
  setPortionSize,
  previewMacros,
  handleConfirmAddFood,
}: AFModalProps) {
  if (!isOpen || !selectedFood) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-5 rounded-lg shadow w-full max-w-md">
        <h2 className="text-base font-bold text-black mb-3">
          Add to {selectedMeal}
        </h2>

        <h3 className="text-black font-semibold mb-3">{selectedFood.name}</h3>

        {previewMacros && (
          <div className="text-sm text-black mb-4 space-y-1">
            <div>Calories: {previewMacros.calories} kcal</div>
            <div>Protein: {previewMacros.protein}g</div>
            <div>Carbs: {previewMacros.carbs}g</div>
            <div>Fat: {previewMacros.fat}g</div>
            <div>Sugar: {previewMacros.sugar}g</div>
          </div>
        )}

        <label className="block text-sm text-black mb-1">Grams</label>
        <input
          type="number"
          value={portionSize}
          onChange={(e) => setPortionSize(Number(e.target.value))}
          className="border p-2 w-full bg-gray-100 text-black rounded mb-4"
        />

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleConfirmAddFood}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
          >
            Add Food
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
