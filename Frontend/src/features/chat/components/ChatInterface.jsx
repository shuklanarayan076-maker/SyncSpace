import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Bookmark, MoreHorizontal, ArrowUp, Globe, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Typewriter = ({ text, speed = 10, onComplete }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);
            return () => clearTimeout(timeout);
        } else if (onComplete) {
            onComplete();
        }
    }, [currentIndex, text, speed, onComplete]);

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                code: ({ children }) => <code className="bg-white/10 px-1.5 py-0.5 rounded text-accent font-mono text-sm">{children}</code>,
                pre: ({ children }) => (
                    <pre className="bg-bg-secondary p-4 rounded-2xl border border-white/5 overflow-x-auto my-6 custom-scrollbar">
                        <code className="text-sm">{children}</code>
                    </pre>
                ),
                ul: ({ children }) => <ul className="list-disc pl-5 space-y-2 mb-4">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 space-y-2 mb-4">{children}</ol>,
                blockquote: ({ children }) => <blockquote className="border-l-2 border-accent pl-4 italic text-text-muted">{children}</blockquote>
            }}
        >
            {displayedText}
        </ReactMarkdown>
    );
};

const ChatInterface = ({ messages, onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            const messageToSend = input.trim();
            setInput(''); // Instant reflection: clear input immediately
            onSendMessage(messageToSend);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen max-w-4xl mx-auto w-full relative">
            {/* Header / Actions */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-md sticky top-0 z-10 w-full">
                <div className="flex items-center gap-4">
                    <h2 className="text-sm font-semibold truncate max-w-[200px] md:max-w-md">
                        {messages[0]?.content.substring(0, 40) || "New Thread"}...
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-white transition-all">
                        <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-lg text-text-muted hover:text-white transition-all">
                        <Bookmark className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-8 space-y-12 pb-40 w-full">
                {messages.map((message, i) => {
                    const isLastMessage = i === messages.length - 1;
                    const isLastAiMessage = isLastMessage && message.role === 'ai';

                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            key={i}
                            className="space-y-4 max-w-full"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                    message.role === 'user' 
                                        ? 'bg-white/10 text-white shadow-sm' 
                                        : 'bg-accent/20 text-accent border border-accent/20 shadow-sm shadow-accent/5'
                                }`}>
                                    {message.role === 'user' ? 'U' : 'P'}
                                </div>
                                <div className="flex-1 min-w-0 space-y-4">
                                    {message.role === 'user' ? (
                                        <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-white leading-relaxed">
                                            {message.content}
                                        </h3>
                                    ) : (
                                        <div className="prose prose-invert max-w-none text-[15px] md:text-base leading-relaxed text-white/90">
                                            {isLastAiMessage ? (
                                                <Typewriter text={message.content} onComplete={scrollToBottom} />
                                            ) : (
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                                                        code: ({ children }) => <code className="bg-white/10 px-1.5 py-0.5 rounded text-accent font-mono text-sm">{children}</code>,
                                                        pre: ({ children }) => (
                                                            <pre className="bg-bg-secondary p-4 rounded-2xl border border-white/5 overflow-x-auto my-6 custom-scrollbar">
                                                                <code className="text-sm">{children}</code>
                                                            </pre>
                                                        ),
                                                        ul: ({ children }) => <ul className="list-disc pl-5 space-y-2 mb-4">{children}</ul>,
                                                        ol: ({ children }) => <ol className="list-decimal pl-5 space-y-2 mb-4">{children}</ol>,
                                                        blockquote: ({ children }) => <blockquote className="border-l-2 border-accent pl-4 italic text-text-muted">{children}</blockquote>
                                                    }}
                                                >
                                                    {message.content}
                                                </ReactMarkdown>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {message.role === 'ai' && (
                                <div className="flex items-center gap-4 ml-12 pt-2">
                                    <button className="text-xs text-text-muted hover:text-white transition-colors flex items-center gap-1.5">
                                        <MoreHorizontal className="w-4 h-4" />
                                        Related
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
                {isLoading && (
                    <div className="flex items-start gap-4 ml-0">
                        <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center animate-pulse">
                            P
                        </div>
                        <div className="flex gap-1 pt-3">
                            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Fixed Bottom Input */}
            <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 bg-gradient-to-t from-bg-primary via-bg-primary to-transparent">
                <form 
                    onSubmit={handleSubmit}
                    className="max-w-3xl mx-auto relative glass-morphism p-2 rounded-3xl shadow-2xl border-white/10 shadow-black/40 focus-within:border-accent/30 focus-within:ring-4 focus-within:ring-accent/5 transition-all"
                >
                    <textarea
                        rows={1}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        placeholder="Ask a follow up..."
                        className="w-full bg-transparent border-none outline-none px-6 py-4 text-white placeholder:text-text-muted/50 resize-none max-h-40 custom-scrollbar"
                    />
                    
                    <div className="flex items-center justify-between px-4 pb-2">
                        <div className="flex items-center gap-1">
                            <button type="button" className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-full transition-all">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="w-8 h-8 bg-accent hover:bg-accent-hover disabled:bg-white/5 disabled:text-text-muted text-bg-secondary rounded-full flex items-center justify-center transition-all shadow-lg"
                        >
                            <ArrowUp className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;

