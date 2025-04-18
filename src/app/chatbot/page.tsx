"use client";

import { ChatBot } from "@/components/Chatbot";

export default function Chatbot() {
  return (
    <div className="min-h-screen bg-[#D7AAFA] flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-3xl">
        <ChatBot />
      </div>
    </div>
  );
}
