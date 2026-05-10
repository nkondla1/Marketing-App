"use client";

import type { AgentTask, TaskStatus } from "@/lib/agent/types";

const TYPE_LABELS: Record<AgentTask["type"], string> = {
  email_campaign: "Email",
  social_post: "Social",
  flash_sale: "Flash Sale",
  newsletter: "Newsletter",
  product_launch: "Launch",
  discount_code: "Discount",
  content_post: "Content",
};

const STATUS_STYLES: Record<TaskStatus, string> = {
  pending: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  completed: "bg-slate-100 text-slate-600",
  cancelled: "bg-red-100 text-red-600",
};

const TYPE_COLORS: Record<AgentTask["type"], string> = {
  email_campaign: "bg-purple-100 text-purple-700",
  social_post: "bg-sky-100 text-sky-700",
  flash_sale: "bg-orange-100 text-orange-700",
  newsletter: "bg-pink-100 text-pink-700",
  product_launch: "bg-emerald-100 text-emerald-700",
  discount_code: "bg-yellow-100 text-yellow-700",
  content_post: "bg-indigo-100 text-indigo-700",
};

interface TaskListProps {
  tasks: AgentTask[];
  darkMode: boolean;
  onCancel: (id: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function TaskList({ tasks, darkMode: dm, onCancel, onRefresh, loading }: TaskListProps) {
  const pending = tasks.filter((t) => t.status === "pending");
  const rest = tasks.filter((t) => t.status !== "pending");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
        Loading schedule…
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-3">📅</div>
        <p className={`text-sm font-medium ${dm ? "text-slate-300" : "text-slate-600"}`}>
          No tasks scheduled yet
        </p>
        <p className={`text-xs mt-1 ${dm ? "text-slate-500" : "text-slate-400"}`}>
          Ask MarketBot to schedule a campaign
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${dm ? "text-slate-400" : "text-slate-500"}`}>
          {pending.length} upcoming · {rest.length} past
        </span>
        <button
          onClick={onRefresh}
          className={`text-xs px-2 py-1 rounded ${dm ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}
        >
          Refresh
        </button>
      </div>

      {pending.length > 0 && (
        <div className="space-y-2">
          <p className={`text-xs font-bold uppercase tracking-wider ${dm ? "text-slate-400" : "text-slate-500"}`}>
            Upcoming
          </p>
          {pending.map((task) => (
            <TaskCard key={task.id} task={task} dm={dm} onCancel={onCancel} />
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <div className="space-y-2">
          <p className={`text-xs font-bold uppercase tracking-wider ${dm ? "text-slate-400" : "text-slate-500"}`}>
            Past / Cancelled
          </p>
          {rest.map((task) => (
            <TaskCard key={task.id} task={task} dm={dm} onCancel={onCancel} />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCard({
  task,
  dm,
  onCancel,
}: {
  task: AgentTask;
  dm: boolean;
  onCancel: (id: string) => void;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        dm ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${TYPE_COLORS[task.type]}`}>
              {TYPE_LABELS[task.type]}
            </span>
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${STATUS_STYLES[task.status]}`}>
              {task.status}
            </span>
          </div>
          <p className={`text-sm font-semibold truncate ${dm ? "text-slate-100" : "text-slate-800"}`}>
            {task.title}
          </p>
          <p className={`text-xs mt-0.5 ${dm ? "text-slate-400" : "text-slate-500"}`}>
            {formatDate(task.scheduledAt)}
          </p>
        </div>
        {task.status === "pending" && (
          <button
            onClick={() => onCancel(task.id)}
            className="shrink-0 text-xs px-2 py-1 rounded border border-red-300 text-red-500 hover:bg-red-50 transition"
          >
            Cancel
          </button>
        )}
      </div>
      {task.description && (
        <p className={`text-xs mt-2 line-clamp-2 ${dm ? "text-slate-400" : "text-slate-500"}`}>
          {task.description}
        </p>
      )}
    </div>
  );
}
