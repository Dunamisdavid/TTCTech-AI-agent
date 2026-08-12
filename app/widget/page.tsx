"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
    role: "user" | "assistant";
    text: string;
    time: string;
}

export default function WidgetPage() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            text: "Hi, I'm TTC AI. Ask me about INSTED, AEROFLO, or TTC's engineering services.",
            time: currentTime(),
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    function currentTime() {
        return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, loading]);

    useEffect(() => {
        window.parent.postMessage(
            {
                type: "ttc-widget-resize",
                isOpen: isOpen,
            },
            "*"
        );
    }, [isOpen]);

    useEffect(() => {
        document.documentElement.style.background = "transparent";
        document.body.style.background = "transparent";
    }, []);

    async function sendMessage() {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        const userMsg: Message = { role: "user", text: trimmed, time: currentTime() };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: trimmed }),
            });
            const data = await res.json();

            const replyText = res.ok
                ? data.reply
                : "Something went wrong on my end. Please try again.";

            setMessages((prev) => [...prev, { role: "assistant", text: replyText, time: currentTime() }]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", text: "I couldn't reach the server. Please try again.", time: currentTime() },
            ]);
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) {
        return (
            <div className="flex h-screen items-end justify-end p-4">
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105"
                    style={{
                        background: "linear-gradient(90deg, #3B72C4, #E8763B)",
                        fontFamily: "'Space Grotesk', sans-serif",
                    }}
                >
                    <span className="h-2 w-2 rounded-full bg-white/90" />
                    Ask TTC AI
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-screen items-end justify-end p-4">
            <div
                className="flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border shadow-2xl"
                style={{ background: "#14171C", borderColor: "#262B33", height: "600px" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                    <div className="flex items-center gap-2">
                        <span
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                            style={{ background: "linear-gradient(135deg, #3B72C4, #E8763B)", fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                            TTC
                        </span>
                        <div>
                            <p className="text-sm font-semibold" style={{ color: "#EDEFF2", fontFamily: "'Space Grotesk', sans-serif" }}>
                                TTC AI Assistant
                            </p>
                            <p className="flex items-center gap-1 text-xs" style={{ color: "#8B93A1", fontFamily: "'JetBrains Mono', monospace" }}>
                                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                                online
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-lg leading-none"
                        style={{ color: "#8B93A1" }}
                        aria-label="Close chat"
                    >
                        ×
                    </button>
                </div>

                {/* Thermal gradient hairline — signature element */}
                <div className="h-[2px] w-full" style={{ background: "linear-gradient(90deg, #3B72C4, #E8763B)" }} />

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                            <div
                                className="max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed"
                                style={{
                                    background: msg.role === "user" ? "#1F242B" : "#1A1D22",
                                    color: "#EDEFF2",
                                    fontFamily: "'Inter', sans-serif",
                                    border: msg.role === "user" ? "1px solid #3B72C440" : "1px solid #262B33",
                                }}
                            >
                                <ReactMarkdown
                                    components={{
                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                        ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>,
                                        ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>,
                                        strong: ({ children }) => <strong className="font-semibold" style={{ color: "#F5F0E8" }}>{children}</strong>,
                                    }}
                                >
                                    {msg.text}
                                </ReactMarkdown>
                            </div>
                            <span className="mt-1 text-[10px]" style={{ color: "#5A6270", fontFamily: "'JetBrains Mono', monospace" }}>
                                {msg.time}
                            </span>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex items-start">
                            <div className="rounded-xl px-3 py-2 text-sm" style={{ background: "#1A1D22", color: "#8B93A1" }}>
                                <span className="inline-flex gap-1">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:150ms]" />
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:300ms]" />
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="flex items-center gap-2 border-t px-3 py-3" style={{ borderColor: "#262B33" }}>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Ask about INSTED, AEROFLO..."
                        className="flex-1 rounded-lg border-none px-3 py-2 text-sm outline-none"
                        style={{ background: "#1A1D22", color: "#EDEFF2", fontFamily: "'Inter', sans-serif" }}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-white disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #3B72C4, #E8763B)" }}
                        aria-label="Send message"
                    >
                        →
                    </button>
                </div>
            </div>
        </div>
    );
}