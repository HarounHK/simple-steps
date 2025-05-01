'use client'

import { useEffect, useState } from 'react'

export default function ChatSidebar({
  onSelect,
  activeId,
}: {
  onSelect: (id: string) => void
  activeId: string | null
}) {
  const [chats, setChats] = useState<{ _id: string; title: string }[]>([])

  useEffect(() => {
    fetch('/api/chat/list')
      .then((res) => res.json())
      .then((data) => setChats(data.chats || []))
  }, [])

  return (
    <aside className="bg-[#D7AAFA] text-black w-64 pt-20 px-4 border-r border-gray-300 h-screen overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Chats</h2>

      <button
        className="mb-4 w-full bg-[#2a1a5e] hover:bg-[#1f0e4f] text-white text-sm font-medium py-2 px-3 rounded-lg shadow transition"
        onClick={() => onSelect('new')}
      >
        New Chat
      </button>

      {chats.map((chat) => (
        <button
          key={chat._id}
          onClick={() => onSelect(chat._id)}
          className={`block text-left w-full px-3 py-2 rounded-lg mb-2 transition ${
            chat._id === activeId
              ? 'bg-purple-200 font-semibold text-purple-900'
              : 'hover:bg-purple-100 text-black'
          }`}
        >
          {chat.title}
        </button>
      ))}
    </aside>
  )
}
