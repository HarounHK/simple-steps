"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    signOut({ redirect: false }).then(() => {
      router.push("/");
    });
  };

  return (
    <nav className="p-4 bg-blue-600 text-white flex justify-between items-center shadow-md">
      <Link
        href={session ? "/Home" : "/"}
        className="text-lg font-bold text-white hover:text-gray-300"
      >
        Simple Steps
      </Link>

      <div>
        {!session ? (
          <>
            <Link href="/Login" className="mr-4 text-white hover:text-gray-300">
              Login
            </Link>
            <Link href="/Signup" className="text-white hover:text-gray-300">
              Signup
            </Link>
          </>
        ) : (
          <>
            <Link href="/Home" className="mr-4 text-white hover:text-gray-300">
              Home
            </Link>
            <Link href="/Home" className="mr-4 text-white hover:text-gray-300">
              Empty
            </Link>
            <Link href="/Profile" className="mr-4 text-white hover:text-gray-300">
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}