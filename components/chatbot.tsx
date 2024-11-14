'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Keyboard, Send, X } from 'lucide-react'

type Message = {
  role: 'user' | 'bot'
  content: string
}

export default function KeyboardChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: 'Hello! I\'m your keyboard expert. How can I help you choose the perfect mechanical keyboard?' }
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { role: 'user', content: input }])
      // Here you would typically send the user's message to your backend API
      // and get a response. For this example, we'll just echo a simple response.
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: `Thank you for your question about "${input}". As a keyboard expert, I'd be happy to provide more information. Could you tell me more about your preferences, such as switch type (linear, tactile, or clicky) and your primary use case (gaming, typing, or both)?`
        }])
      }, 1000)
      setInput('')
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-16 h-16 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Keyboard className="w-8 h-8" />
        </Button>
      )}
      {isOpen && (
        <div className="bg-white border border-border rounded-lg shadow-xl w-80 sm:w-96 h-[32rem] flex flex-col">
          <div className="p-4 border-b border-border flex justify-between items-center bg-primary text-primary-foreground">
            <h2 className="text-lg font-semibold">Keyboard Expert</h2>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-primary-foreground hover:bg-primary/90">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="flex-grow p-4 bg-white">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <span
                  className={`inline-block p-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.content}
                </span>
              </div>
            ))}
          </ScrollArea>
          <div className="p-4 border-t border-border bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex space-x-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about keyboards..."
                className="flex-grow"
              />
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}