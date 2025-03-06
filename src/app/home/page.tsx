"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#D7AAFA] text-white">
      <h1 className="text-4xl font-bold text-[#1F1A5E] mb-4">
        Welcome, {session.user?.name}!
      </h1>
      <p className="text-lg text-gray-900">
        Homepage.
      </p>
    </div>
  );
}