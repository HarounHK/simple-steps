"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/Login" });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Welcome to Simple Steps
        </h1>
        <div className="flex flex-col gap-4">
          <div className="text-gray-700">
            <span className="font-bold">Name:</span> {session?.user?.name}
          </div>
          <div className="text-gray-700">
            <span className="font-bold">Email:</span> {session?.user?.email}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-6 bg-red-500 text-white font-bold w-full py-2 rounded hover:bg-red-600"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
