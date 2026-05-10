"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AgentMessage, AgentTask } from "@/lib/agent/types";
import { TaskList } from "./TaskList";

interface AgentPanelProps {
  darkMode: boolean;
}

type Tab = "chat" | "schedule";

const QUICK_PROMPTS = [
  "Schedule a flash sale for next Monday at 10am",
  "Generate email copy for Template Pack Pro",
  "Show all upcoming tasks",
  "Analyze my current schedule",
];

function ToolBadge({ name }: { name: string }) {
  const labels: Record<string, string> = {
    schedule_campaign: "📅 Scheduled",
    list_tasks: "📋 Listed tasks",
    cancel_task: "🗑 Cancelled",
    generate_campaign_copy: "✏️ Generated copy",
    analyze_schedule: "🔍 Analysed",
  };
  return (
    <span className="inline-block text-xs bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 mr-1">
      {labels[name] ?? name}
    </span>
  );
}

function MessageBubble({
  msg,
  dm,
}: {
  msg: AgentMessage & { toolsUsed?: string[] };
  dm: boolean;
}) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0 mt-0.5">
          AI
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        {msg.toolsUsed && msg.toolsUsed.length > 0 && (
          <div className="mb-1">
            {msg.toolsUsed.map((t) => (
              <ToolBadge key={t} name={t} />
            ))}
          </div>
        )}
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-blue-600 text-white rounded-br-sm"
              : dm
              ? "bg-slate-700 text-slate-100 rounded-bl-sm"
              : "bg-slate-100 text-slate-800 rounded-bl-sm"
          }`}
        >
          {msg.content}
        </div>
        <span className={`text-xs mt-1 ${dm ? "text-slate-500" : "text-slate-400"}`}>
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

export function AgentPanel({ darkMode: dm }: AgentPanelProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState<(AgentMessage & { toolsUsed?: string[] })[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm MarketBot — your AI marketing scheduling agent. I can schedule campaigns, generate copy, and analyse your marketing calendar. What would you like to do?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const fetchTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const res = await fetch("/api/agent/tasks");
      const data = await res.json();
      setTasks(data.tasks ?? []);
    } catch {
      // silently fail — tasks are supplemental
    } finally {
      setTasksLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && tab === "schedule") fetchTasks();
  }, [open, tab, fetchTasks]);

  async function sendMessage(text: string) {
    if (!text.trim() || sending) return;
    setError(null);

    const userMsg: AgentMessage & { toolsUsed?: string[] } = {
      role: "user",
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const history = messages.map(({ role, content, timestamp }) => ({
        role,
        content,
        timestamp,
      }));

      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), history }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Agent error");
      }

      const assistantMsg: AgentMessage & { toolsUsed?: string[] } = {
        role: "assistant",
        content: data.message,
        timestamp: new Date().toISOString(),
        toolsUsed: data.toolsUsed ?? [],
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Refresh tasks if the agent used scheduling tools
      const schedulingTools = ["schedule_campaign", "cancel_task"];
      if (data.toolsUsed?.some((t: string) => schedulingTools.includes(t))) {
        fetchTasks();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  async function cancelTask(id: string) {
    await fetch(`/api/agent/tasks/${id}`, { method: "DELETE" });
    fetchTasks();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const card = dm ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
  const muted = dm ? "text-slate-400" : "text-slate-500";

  return (
    <>
      {/* Floating action button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close MarketBot" : "Open MarketBot"}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all ${
          open
            ? "bg-slate-600 hover:bg-slate-700"
            : "bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        } text-white text-2xl`}
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* Panel */}
      {open && (
        <div
          className={`fixed bottom-24 right-6 z-40 w-[360px] max-h-[620px] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${card}`}
          style={{ height: "min(620px, calc(100vh - 120px))" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">MarketBot</p>
                <p className="text-purple-200 text-xs">AI Marketing Agent</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-200 text-xs">Live</span>
            </div>
          </div>

          {/* Tabs */}
          <div className={`flex border-b shrink-0 ${dm ? "border-slate-700" : "border-slate-200"}`}>
            {(["chat", "schedule"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs font-semibold capitalize transition ${
                  tab === t
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : muted
                }`}
              >
                {t === "chat" ? "💬 Chat" : "📅 Schedule"}
              </button>
            ))}
          </div>

          {/* Chat tab */}
          {tab === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {messages.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} dm={dm} />
                ))}
                {sending && (
                  <div className="flex justify-start mb-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0 mt-0.5">
                      AI
                    </div>
                    <div
                      className={`rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm ${
                        dm ? "bg-slate-700" : "bg-slate-100"
                      }`}
                    >
                      <span className="inline-flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                      </span>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
                    {error}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick prompts */}
              {messages.length === 1 && (
                <div className={`px-4 pb-2 flex flex-wrap gap-1.5 shrink-0 border-t ${dm ? "border-slate-700" : "border-slate-100"}`}>
                  <p className={`w-full text-xs pt-2 font-semibold ${muted}`}>Quick actions</p>
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => sendMessage(p)}
                      className={`text-xs px-2.5 py-1.5 rounded-full border transition ${
                        dm
                          ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className={`px-3 pb-3 pt-2 shrink-0 border-t ${dm ? "border-slate-700" : "border-slate-200"}`}>
                <div className={`flex gap-2 rounded-xl border px-3 py-2 ${
                  dm ? "bg-slate-700 border-slate-600" : "bg-slate-50 border-slate-200"
                }`}>
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message MarketBot… (Enter to send)"
                    disabled={sending}
                    className={`flex-1 resize-none bg-transparent text-sm outline-none placeholder-slate-400 max-h-24 ${
                      dm ? "text-slate-100" : "text-slate-800"
                    }`}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || sending}
                    className="shrink-0 w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition self-end"
                    aria-label="Send"
                  >
                    ↑
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Schedule tab */}
          {tab === "schedule" && (
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <TaskList
                tasks={tasks}
                darkMode={dm}
                onCancel={cancelTask}
                onRefresh={fetchTasks}
                loading={tasksLoading}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
