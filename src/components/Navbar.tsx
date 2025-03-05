"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") return null; 

  const handleLogout = async () => {
    signOut({ redirect: false }).then(() => {
      router.push("/");
    });
  };

  return (
    <nav className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/80 to-transparent text-white flex justify-between items-center z-50">
      <Link
        href={session ? "/home" : "/"} 
        className="text-3xl font-extrabold tracking-wide"
        style={{ color: "#1F1A5E" }}
      >
        SIMPLE STEPS
      </Link>

      {session ? (
        <div className="flex gap-6">
          <Link href="/home" className="hover:text-[#B580E4] transition">
            Home
          </Link>
          <Link href="/profile" className="hover:text-[#B580E4] transition">
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-1 rounded transition text-white"
            style={{ backgroundColor: "#1F1A5E" }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#B580E4")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1F1A5E")}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="px-4 py-1 rounded transition text-white"
          style={{ backgroundColor: "#1F1A5E" }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#B580E4")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1F1A5E")}
        >
          Sign In
        </Link>
      )}
    </nav>
  );
}