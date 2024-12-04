import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Welcome to Simple Steps</h1>
      <p className="text-lg text-gray-700 mb-6">
        Start managing your steps toward health and wellness.
      </p>
      <div className="space-x-4">
        <Link
          href="/Login"
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Log In
        </Link>
        <Link
          href="/Signup"
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
