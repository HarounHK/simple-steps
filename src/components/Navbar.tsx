"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  if (status === "loading") return null;

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/dexcom/logout", { method: "POST" });
      const data = await res.json();
      console.log("Logout response:", data);
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      signOut({ redirect: false }).then(() => router.push("/"));
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent text-white shadow-lg">
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center"> */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link
          href={session ? "/home" : "/"}
          className="text-3xl font-extrabold tracking-wide"
          style={{ color: "#1F1A5E" }}
        >
          SIMPLE STEPS
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 items-center">
          {session ? (
            <>
              <Link href="/home" className="hover:text-[#B580E4] transition">Home</Link>
              <Link href="/glucose" className="hover:text-[#B580E4] transition">Glucose</Link>
              <Link href="/chatbot" className="hover:text-[#B580E4] transition">Chatbot</Link>
              <Link href="/nutrition" className="hover:text-[#B580E4] transition">Nutrition</Link>
              <Link href="/profile" className="hover:text-[#B580E4] transition">Profile</Link>
              <button
                onClick={handleLogout}
                className="px-4 py-1 rounded text-white"
                style={{ backgroundColor: "#1F1A5E" }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#B580E4"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#1F1A5E"}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1 rounded text-white"
              style={{ backgroundColor: "#1F1A5E" }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#B580E4"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#1F1A5E"}
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="focus:outline-none">
            <svg className="w-6 h-6 text-[#1F1A5E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          {session ? (
            <>
              <Link href="/home" onClick={toggleMenu} className="block hover:text-[#B580E4]">Home</Link>
              <Link href="/glucose" onClick={toggleMenu} className="block hover:text-[#B580E4]">Glucose</Link>
              <Link href="/chatbot" onClick={toggleMenu} className="block hover:text-[#B580E4]">Chatbot</Link>
              <Link href="/nutrition" onClick={toggleMenu} className="block hover:text-[#B580E4]">Nutrition</Link>
              <Link href="/profile" onClick={toggleMenu} className="block hover:text-[#B580E4]">Profile</Link>
              <button
                onClick={() => {
                  toggleMenu();
                  handleLogout();
                }}
                className="block w-full text-left px-4 py-2 rounded bg-[#1F1A5E] text-white"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" onClick={toggleMenu} className="block hover:text-[#B580E4]">Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
}
