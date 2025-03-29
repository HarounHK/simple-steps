"use client";
import React from "react";

// Type definitions to stop type errors
interface SearchResult {
  id?: string;
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  sugar: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: () => void;
  query: string;
  setQuery: (val: string) => void;
  searchResults: SearchResult[];
  selectedMeal: string;
  openAFModal: (item: SearchResult) => void;
}

export default function SearchModal({
  isOpen,
  onClose,
  onSearch,
  query,
  setQuery,
  searchResults,
  selectedMeal,
  openAFModal,
}: SearchModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold text-black mb-2">
          Search Food ({selectedMeal})
        </h2>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type food name..."
          className="border p-2 w-full bg-gray-100 text-black rounded mb-2"
        />

        <button
          onClick={onSearch}
          className="bg-[#2a1a5e] text-white px-4 py-2 rounded w-full mb-2"
        >
          Search
        </button>

        {searchResults.map((item) => (
          <div key={item.id} className="border-b py-2 text-black">
            <h3 className="font-bold">{item.name}</h3>
            <p>Calories (per 100g): {item.calories}</p>
            <p>Protein: {item.protein} g</p>
            <p>Carbs: {item.carbs} g</p>
            <p>Fat: {item.fat} g</p>
            <p>Sugar: {item.sugar} g</p>

            <button
              onClick={() => {
                onClose();
                openAFModal(item);
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
