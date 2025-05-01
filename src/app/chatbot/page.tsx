// 'use client'

// import { useState } from 'react'
// import { ChatBot } from "@/components/Chatbot"
// import ChatSidebar from '@/components/ChatSidebar'

// export default function ChatPage() {
//   const [activeChatId, setActiveChatId] = useState<string | null>(null)

//   return (
//     <div className="flex h-screen overflow-hidden bg-[#D7AAFA]"> 
//       <ChatSidebar onSelect={setActiveChatId} activeId={activeChatId} />

//       <div className="flex-1 overflow-y-auto p-4">
//         <ChatBot chatId={activeChatId ?? undefined} />
//       </div>
//     </div>
//   )
// }

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