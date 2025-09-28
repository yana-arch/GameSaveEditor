import React, { useState, useRef, useEffect } from 'react';
import { useAiApi } from '../hooks/useAiApi';
import { RobotIcon, MinimizeIcon, CloseIcon, SendIcon } from './icons';
import type { RpgData } from '../types';

// Simple markdown-to-html converter for basic formatting in chat
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italics
        .replace(/`(.*?)`/g, '<code class="bg-gray-800 text-yellow-300 px-1 py-0.5 rounded">$1</code>') // Inline code
        .replace(/\n/g, '<br />'); // Newlines

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

interface AiChatProps {
    rpgData: RpgData;
    isInEditor?: boolean;
}

export const AiChat: React.FC<AiChatProps> = ({ rpgData, isInEditor = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [quickPrompts, setQuickPrompts] = useState<boolean>(false);
    const { generate, loading, error } = useAiApi();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Generate default context prompt when chat opens
    const generateDefaultPrompt = () => {
        let context = "Here is the current state of my RPG game save data:\n\n";
        if (rpgData.characters && rpgData.characters.length > 0) {
            context += `Characters:\n${rpgData.characters.map(c => `- ${c.name} (Lvl ${c.level}, HP ${c.hp})`).join('\n')}\n\n`;
        }
        if (rpgData.gold) {
            context += `Gold: ${rpgData.gold}\n\n`;
        }
        context += "Based on this, suggest some interesting things I could try to do next in the game, or powerful character builds I could aim for.";
        setInputValue(context);
        setQuickPrompts(false);
        inputRef.current?.focus();
    };

    const sendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        try {
            await generate(inputValue.trim());
        } catch (err) {
            // Error handling is done in useAiApi hook
        }
    };

    // Listen for AI responses from the API
    useEffect(() => {
        if (error) {
            const errorMessage: Message = {
                id: crypto.randomUUID(),
                role: 'ai',
                content: `Error: ${error}`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        }
        // Note: The useAiApi hook handles loading and response states
        // We would ideally need to modify the hook to provide a callback or better state management
    }, [error]);

    // Temporary mock for demonstration - in a real implementation this would integrate with the actual API response
    const handleSend = async () => {
        const userMessage = inputValue.trim();
        if (!userMessage) return;

        const message: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: userMessage,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, message]);
        setInputValue('');

        try {
            // Send to AI API
            await generate(userMessage);

            // Since useAiApi doesn't directly expose the response text, we'll show a placeholder for now
            setTimeout(() => {
                const aiResponse: Message = {
                    id: crypto.randomUUID(),
                    role: 'ai',
                    content: "AI response would appear here when properly integrated.",
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, aiResponse]);
            }, 1500);
        } catch (err) {
            const errorMessage: Message = {
                id: crypto.randomUUID(),
                role: 'ai',
                content: `Error: ${err instanceof Error ? err.message : 'Unknown error occurred'}`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!isInEditor) {
        return null; // Only show in editor context
    }

    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-4 right-4 z-40 group bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
                    aria-label="Open AI Chat"
                >
                    <RobotIcon className="w-6 h-6" />
                    <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        AI
                    </div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className={`fixed bottom-4 right-4 z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl transition-all duration-300 ${
                    isMinimized ? 'w-80 h-12' : 'w-96 h-96'
                }`}>
                    {/* Chat Header */}
                    <div className="bg-gray-700/50 px-4 py-3 rounded-t-lg border-b border-gray-600 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <RobotIcon className="w-5 h-5 text-blue-400" />
                            <h3 className="text-white font-semibold text-sm">AI Game Assistant</h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="p-1 text-gray-400 hover:text-white transition-colors"
                                aria-label={isMinimized ? 'Maximize' : 'Minimize'}
                            >
                                <MinimizeIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsMinimized(false);
                                }}
                                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                aria-label="Close"
                            >
                                <CloseIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Chat Body */}
                    {!isMinimized && (
                        <>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 max-h-64 space-y-3">
                                {messages.length === 0 ? (
                                    <div className="text-center text-gray-400 text-sm py-8">
                                        <RobotIcon className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                                        <p>Start a conversation with the AI assistant!</p>
                                        <button
                                            onClick={generateDefaultPrompt}
                                            className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
                                        >
                                            Generate a prompt based on your save data
                                        </button>
                                    </div>
                                ) : (
                                    messages.map(message => (
                                        <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                                                message.role === 'user'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-700/50 text-gray-200 border border-gray-600'
                                            }`}>
                                                <div className={message.role === 'ai' ? 'prose prose-sm prose-invert max-w-none' : ''}>
                                                    {message.role === 'ai' ? (
                                                        <SimpleMarkdown text={message.content} />
                                                    ) : (
                                                        message.content
                                                    )}
                                                </div>
                                                <div className={`text-xs mt-1 opacity-70 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                                                    {formatTime(message.timestamp)}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="border-t border-gray-600 p-3">
                                <div className="flex gap-2">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Ask about character builds, quest ideas, or game strategies..."
                                        className="flex-1 bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm"
                                        disabled={loading}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={loading || !inputValue.trim()}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white rounded-md p-2 transition-colors flex-shrink-0"
                                        aria-label="Send message"
                                    >
                                        {loading ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <SendIcon className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                {!inputValue && (
                                    <button
                                        onClick={generateDefaultPrompt}
                                        className="mt-2 text-xs text-gray-400 hover:text-blue-400 transition-colors"
                                    >
                                        Generate prompt from save data
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};
