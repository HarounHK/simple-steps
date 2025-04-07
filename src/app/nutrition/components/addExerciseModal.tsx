"use client";
import React, { Dispatch, SetStateAction } from "react";

interface EditExerciseEntry {
  _id: string;
  exerciseName: string;
  calories: number;
  time: string; 
}

interface EditExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  editExerciseEntry: EditExerciseEntry | null;

  editExerciseName: string;
  setEditExerciseName: Dispatch<SetStateAction<string>>;

  editCaloriesBurned: number;
  setEditCaloriesBurned: Dispatch<SetStateAction<number>>;

  editTime: string;
  setEditTime: Dispatch<SetStateAction<string>>;

  handleConfirmEditExercise: () => void;
}

export default function EditExerciseModal({
  isOpen,
  onClose,
  editExerciseEntry,
  editExerciseName,
  setEditExerciseName,
  editCaloriesBurned,
  setEditCaloriesBurned,

  editTime,
  setEditTime,

  handleConfirmEditExercise,
}: EditExerciseModalProps) {
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
          value={editTime}
          onChange={(e) => setEditTime(e.target.value)}
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
