"use client";
import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, error]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    setError(null); // clear any previous error
    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Server returned an error — show the message from the API route
        setError(data.error ?? "An unexpected error occurred. Please try again.");
        // Remove the user message that triggered the error so they can retry
        setMessages(messages);
        return;
      }

      setMessages([...newMessages, { role: "assistant", content: data.message }]);

    } catch {
      // fetch() itself failed — network issue, server down, etc.
      setError("Network error: could not reach the server. Please check your connection.");
      setMessages(messages); // roll back the optimistic user message
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">
        🤖 Sardu Campidanesu Chatbot
      </h1>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 && !error && (
          <p className="text-center text-gray-400 mt-10">
            Comincia a scrivi... / Cumintza a scriri...
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl max-w-[80%] ${
              msg.role === "user"
                ? "bg-blue-500 text-white ml-auto"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div className="bg-gray-100 text-gray-500 p-3 rounded-xl max-w-[80%] animate-pulse">
            Ispeita...
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-300 text-red-700 p-3 rounded-xl">
            <span className="text-lg leading-none mt-0.5">⚠️</span>
            <div>
              <p className="font-semibold text-sm">Error</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs underline mt-1 hover:text-red-900"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Scrivi in sardu o in italianu..."
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Invia"}
        </button>
      </div>
    </main>
  );
}
