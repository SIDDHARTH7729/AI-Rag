'use client'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import * as React from "react"

interface Doc {
    pageContent?: string;
    metadata?: {
        loc?: {
            pageNumber?: number
        };
        source?: string;
    }
}

interface IMessage {
    role: 'user' | 'assistant';
    content?: string;
    documents?: Doc[]
}

const ChatComponent: React.FC = () => {
    const [message, setMessage] = React.useState<string>('')
    const [messages, setMessages] = React.useState<IMessage[]>([])
    const messagesEndRef = React.useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    React.useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSetChatMessage = async () => {
        if (!message.trim()) return;
        
        const userMessage = message;
        setMessage(''); // Clear input immediately
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        
        try {
            const res = await fetch(`http://localhost:8000/chat?message=${encodeURIComponent(userMessage)}`)
            const data = await res.json()
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: data?.message,
                    documents: data?.documents
                }
            ])
        } catch (error) {
            console.error('Error sending message:', error)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSetChatMessage()
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Messages Container - Fixed height with scroll */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 min-h-0">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Start a conversation by typing a message below...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                                        msg.role === 'user'
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                                    }`}
                                >
                                    <div className="whitespace-pre-wrap break-words leading-relaxed">
                                        {msg.content}
                                    </div>
                                    {msg.documents && msg.documents.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-300/50 text-xs">
                                            <p className="font-semibold mb-2 text-gray-600">📄 Sources:</p>
                                            <div className="space-y-1">
                                                {msg.documents.map((doc, docIndex) => (
                                                    <div key={docIndex} className="flex items-center gap-1 text-gray-500">
                                                        {doc.metadata?.source && (
                                                            <span className="italic">
                                                                {doc.metadata.source}
                                                                {doc.metadata.loc?.pageNumber && ` (Page ${doc.metadata.loc.pageNumber})`}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Container - Fixed at bottom */}
            <div className="border-t border-gray-200/50 p-4 bg-white/50 backdrop-blur-sm">
                <div className="flex gap-3">
                    <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        type="text"
                        className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl bg-white/80 backdrop-blur-sm"
                        placeholder="Ask me anything about your documents..."
                    />
                    <Button
                        onClick={handleSetChatMessage}
                        disabled={!message.trim()}
                        className="px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        Send
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ChatComponent