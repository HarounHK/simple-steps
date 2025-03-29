'use client'

import { useState } from 'react'
import { Chat } from '@/components/ui/chat'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const suggestions = [
  'Give me a low-carb dinner idea that helps manage glucose levels.',
  'What are signs of hypoglycemia and how do I treat it quickly?',
  'Explain how exercise affects blood sugar for people with Type 1 diabetes.',
]

export function ChatBot() {
  const [messages, setMessages] = useState([{id: '0',role: 'system',content: 'How can I help you today?',},])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Submita user input and fetch AI reply
  const handleSubmit = async (event?: { preventDefault?: () => void }) => {
    if (event?.preventDefault) event.preventDefault()

    if (!input.trim()) return

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setIsGenerating(true)

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })

      const data = await res.json()

      const aiMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply || 'No response.',
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Something went wrong.',
        },
      ])
    }

    setInput('')
    setIsGenerating(false)
  }

  const handleSuggestionClick = (text: string) => {
    setInput(text)
  }

  return (
    <Card className='w-full max-w-3xl mx-auto shadow-lg border rounded-2xl'>
      <CardContent className='p-4 sm:p-6 text-black space-y-6'>
        {messages.length <= 1 && (
          <div className='space-y-4 text-center'>
            <h2 className='text-xl font-bold'>
              Try these prompts <span className='ml-1 animate-pulse'>✨</span>
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto'>
              {suggestions.map((s, i) => (
                <Button
                  key={i}
                  variant='outline'
                  className='text-sm font-normal justify-start whitespace-normal h-auto p-4 text-left'
                  onClick={() => handleSuggestionClick(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        )}

        <Chat
          messages={messages}
          input={input}
          handleInputChange={(e) => setInput(e.target.value)}
          handleSubmit={handleSubmit}
          isGenerating={isGenerating}
          stop={() => {}}
          append={() => {}}
          suggestions={suggestions} 
        />
      </CardContent>
    </Card>
  )
}
