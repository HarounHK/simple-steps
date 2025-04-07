"use client";
import React from "react";

interface ExerciseResult {
  name?: string;
  activity?: string;
  calories_per_hour?: number;
}

interface SearchExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: () => void;
  query: string;
  setQuery: (val: string) => void;
  searchResults: ExerciseResult[];
  addExerciseModal: (ex: ExerciseResult) => void; 
}

export default function SearchExerciseModal({
  isOpen,
  onClose,
  onSearch,
  query,
  setQuery,
  searchResults,
  addExerciseModal,
}: SearchExerciseModalProps) {
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
                onClose();
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
