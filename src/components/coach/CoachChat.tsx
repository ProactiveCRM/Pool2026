'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { sendCoachMessage, ChatMessage } from '@/lib/actions/coach-chat';
import { COACH_GREETING } from '@/lib/prompts/coach-system';
import ReactMarkdown from 'react-markdown';

export function CoachChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: COACH_GREETING },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const result = await sendCoachMessage(userMessage, messages);

            if (result.success && result.response) {
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: result.response! },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: `Sorry, I encountered an issue: ${result.error}. Please try again!`,
                    },
                ]);
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Oops! Something went wrong. Please try again.',
                },
            ]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const suggestedQuestions = [
        'How do I improve my break?',
        'Best way to play safe?',
        'Give me a practice drill',
        'How do I read the table?',
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)]">
            {/* Chat Messages */}
            <ScrollArea
                ref={scrollRef}
                className="flex-1 pr-4"
            >
                <div className="space-y-4 pb-4">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                        >
                            {message.role === 'assistant' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                            )}
                            <Card
                                className={`max-w-[80%] p-4 ${message.role === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-card'
                                    }`}
                            >
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown>{message.content}</ReactMarkdown>
                                </div>
                            </Card>
                            {message.role === 'user' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                    <User className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3 justify-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-primary" />
                            </div>
                            <Card className="p-4 bg-card">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Thinking...</span>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Suggested Questions (show only at start) */}
            {messages.length === 1 && (
                <div className="py-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Try asking:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {suggestedQuestions.map((q) => (
                            <Button
                                key={q}
                                variant="outline"
                                size="sm"
                                onClick={() => setInput(q)}
                                className="text-xs"
                            >
                                {q}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="pt-4 border-t border-border">
                <div className="flex gap-2">
                    <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask your pool coach anything..."
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()}>
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
