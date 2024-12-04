"use client";

import Link from "next/link";

export default function SignupPage() {

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">Sign Up</h1>
        <form>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="Name">
              Name
            </label>
            <input
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300 text-black"
              type="text"
              id="Name"
              placeholder=""
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300 text-black"
              type="email"
              id="email"
              placeholder=""
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
              type="password"
              id="password"
              placeholder=""
            />
          </div>
          <button
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            type="submit"
          >
            Sign Up
          </button>
          <Link className="text-sm mt-3 text-right text-black" href={"/Login"}>
            Already have an account? <span className="underline">Login</span>
          </Link>
        </form>
      </div>
    </div>
  );
}
