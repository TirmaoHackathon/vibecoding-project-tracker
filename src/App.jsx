import { useState, useEffect } from "react";

/**
 * Vibecoding Project Tracker — starter scaffold.
 *
 * This file is intentionally almost empty. The boilerplate (Vite, React,
 * Tailwind) is configured for you, plus a few shared constants and a
 * localStorage helper. Everything visible on screen, you build.
 *
 * Where to start (build sequence in Phase 3):
 *   - M4  data-model    : render the four columns and the task cards below.
 *   - M5  crud-modal    : add the "+" button modal and the edit-on-click modal.
 *   - M6  tag-style     : feature vs. bug color coding (uses DESIGN.md §2 colors).
 *   - M7  task-owner    : assignee badge + "Hand off to..." dropdown.
 *   - M8  due-tint      : color cards by due date (uses DESIGN.md §2 due-state colors).
 *   - M9  context       : a curated Context briefing field on the modal.
 *   - M10 copy-prompt   : a "Copy as Prompt Context" button that serializes the task + context.
 *   - M11 anchors       : the Anchor Board above the Kanban.
 *   - M12 secret-sauce  : the one open-ended thing that makes your tracker yours.
 *
 * Search the file for `TODO M<n>` to find the right hook for each milestone.
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'feature'|'bug'} type
 * @property {'todo'|'in-progress'|'review'|'done'} status
 * @property {string} assignee
 * @property {string|null} dueDate     ISO 'YYYY-MM-DD'
 * @property {string} createdDate      ISO 'YYYY-MM-DD'
 */

// The four columns of the board, in render order.
// Use these IDs everywhere — do not invent new ones.
export const STAGES = [
  { id: "todo", label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
];

// Replace these placeholders with the three names from PRD §8 before M4.
// They become the only valid values for `Task.assignee`.
export const TEAM = ["Teammate A", "Teammate B", "Teammate C"];

export const AI_MODELS = [
  "GPT-5.5",
  "GPT-5",
  "Claude Opus",
  "Claude Sonnet",
  "Gemini 2.5 Pro",
  "Gemini 2.5 Flash",
];

/**
 * A tiny localStorage hook — survives reloads, no library needed.
 *
 * Usage:
 *   const [tasks, setTasks] = useLocalStorage('vibetracker.tasks', []);
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw != null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota or private-mode error — silently ignore for hackathon */
    }
  }, [key, value]);

  return [value, setValue];
}

function getDueProgress(task) {
  if (!task.dueDate) {
    return {
      percent: 100,
      color: "bg-due-neutral",
    };
  }

  const now = new Date();
  const due = new Date(task.dueDate);

  // Start counting 7 days before deadline
  const warningStart = new Date(due);
  warningStart.setDate(warningStart.getDate() - 7);

  // Already overdue
  if (now > due) {
    return {
      percent: 100,
      color: "bg-due-overdue",
    };
  }

  // More than a week left
  if (now < warningStart) {
    return {
      percent: 0,
      color: "bg-due-safe",
    };
  }

  const totalWindow = due - warningStart;
  const elapsedWindow = now - warningStart;

  const percent = Math.min(
    100,
    Math.max(0, (elapsedWindow / totalWindow) * 100),
  );

  let color = "bg-due-safe";

  if (percent >= 50) {
    color = "bg-due-warning";
  }

  if (percent >= 90) {
    color = "bg-due-overdue";
  }

  return {
    percent,
    color,
  };
}

export default function App() {
  const [tasks, setTasks] = useLocalStorage("vibetracker.tasks", [
    {
      id: "1",
      title: "Build Kanban Layout",
      description: "Create the four board columns and render cards.",
      type: "feature",
      status: "todo",
      assignee: TEAM[0],
      aiModel: AI_MODELS[0],
      dueDate: "2026-06-10",
      createdDate: "2026-06-05",
    },
    {
      id: "2",
      title: "Fix localStorage persistence",
      description: "Verify tasks survive page refresh.",
      type: "bug",
      status: "in-progress",
      assignee: TEAM[1],
      aiModel: AI_MODELS[0],
      dueDate: "2026-06-07",
      createdDate: "2026-06-05",
    },
    {
      id: "3",
      title: "Review UI styling",
      description: "Match DESIGN.md colors and typography.",
      type: "feature",
      status: "review",
      assignee: TEAM[2],
      aiModel: AI_MODELS[0],
      dueDate: "2026-06-08",
      createdDate: "2026-06-05",
    },
    {
      id: "4",
      title: "Prepare demo flow",
      description: "Collect screenshots and demo tasks.",
      type: "feature",
      status: "done",
      assignee: TEAM[0],
      aiModel: AI_MODELS[0],
      dueDate: null,
      createdDate: "2026-06-05",
    },
  ]);

  const [deliverables, setDeliverables] = useLocalStorage(
    "vibetracker.deliverables",
    [
      { id: "prd", label: "PRD", url: "" },
      { id: "design", label: "Design Spec", url: "" },
      { id: "demo", label: "Demo Video", url: "" },
      { id: "deploy", label: "Production URL", url: "" },
    ],
  );

  const updateDeliverable = (id, url) => {
    setDeliverables((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              url,
            }
          : item,
      ),
    );
  };

  const isValidUrl = (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const emptyTask = {
    title: "",
    description: "",
    type: "feature",
    status: "todo",
    assignee: TEAM[0],
    aiModel: AI_MODELS[0],
    dueDate: "",
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState(emptyTask);

  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  const copyTaskJson = async (task, e) => {
    if (e) {
      e.stopPropagation();
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(task, null, 2));
    } catch (err) {
      console.error("Failed to copy task JSON", err);
    }
  };
  const copyAllTasksJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(tasks, null, 2));
    } catch (err) {
      console.error("Failed to copy all tasks JSON", err);
    }
  };

  const copyTaskDescription = async (description) => {
    try {
      await navigator.clipboard.writeText(description || "");
    } catch (err) {
      console.error("Failed to copy task description", err);
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setFormData(emptyTask);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);

    setFormData({
      title: task.title,
      description: task.description,
      type: task.type,
      status: task.status,
      assignee: task.assignee,
      aiModel: task.aiModel || AI_MODELS[0],
      dueDate: task.dueDate || "",
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (!formData.title.trim()) return;

    if (editingTask) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                ...formData,
                dueDate: formData.dueDate || null,
              }
            : task,
        ),
      );
    } else {
      const newTask = {
        id: crypto.randomUUID(),
        ...formData,
        dueDate: formData.dueDate || null,
        createdDate: new Date().toISOString().slice(0, 10),
      };

      setTasks((prev) => [...prev, newTask]);
    }

    closeModal();
  };

  const handleDelete = () => {
    if (!editingTask) return;

    setTasks((prev) => prev.filter((task) => task.id !== editingTask.id));

    closeModal();
  };

  const handleDragStart = (taskId) => {
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (stageId) => {
    if (!draggedTaskId) return;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === draggedTaskId
          ? {
              ...task,
              status: stageId,
            }
          : task,
      ),
    );

    setDraggedTaskId(null);
    setDragOverStage(null);
  };

  return (
    <div className="min-h-screen bg-surface-page p-6 font-body">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-brand-primary">
            Cant-ban
          </h1>

          <p className="text-sm text-text-muted">Vibecoding Project Tracker</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={copyAllTasksJson}
            className="rounded border px-4 py-2 text-sm font-medium hover:bg-black/5"
          >
            Copy All as JSON
          </button>

          <button
            onClick={openCreateModal}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-xl font-semibold text-white shadow-md transition hover:scale-105"
          >
            +
          </button>
        </div>
      </header>

      <section className="mb-8 rounded-xl border border-brand-primary/10 bg-surface-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold">
              Anchor Deliverables
            </h2>

            <p className="text-sm text-text-muted">
              Key project outputs required for completion.
            </p>
          </div>

          <div className="text-sm text-text-muted">
            {deliverables.filter((d) => d.url.trim()).length} /{" "}
            {deliverables.length} complete
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {deliverables.map((item) => {
            const done = isValidUrl(item.url);

            return (
              <div
                key={item.id}
                className={`rounded-lg border p-4 transition ${
                  done
                    ? "border-green-300 bg-green-50"
                    : "border-brand-primary/10"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{item.label}</span>

                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      done
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {done ? "✓ Done" : "Pending"}
                  </span>
                </div>

                <input
                  type="url"
                  placeholder="Paste URL..."
                  value={item.url}
                  onChange={(e) => updateDeliverable(item.id, e.target.value)}
                  className="w-full rounded border p-2 text-sm"
                />
              </div>
            );
          })}
        </div>
      </section>

      <main className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {STAGES.map((stage) => {
          const stageTasks = tasks.filter((task) => task.status === stage.id);

          return (
            <section
              key={stage.id}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(stage.id)}
              className={`rounded-lg border p-4 transition-all duration-200 ${
                dragOverStage === stage.id
                  ? "border-brand-primary bg-brand-primary/5 shadow-md"
                  : "border-brand-primary/10 bg-surface-card"
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                  {stage.label}
                </h2>

                <span className="rounded-full bg-white px-2 py-1 text-xs text-text-muted">
                  {stageTasks.length}
                </span>
              </div>

              <div className="min-h-[150px] space-y-3">
                {stageTasks.length === 0 ? (
                  <div className="rounded-md border-2 border-dashed border-text-muted/30 p-4 text-center text-sm text-text-muted">
                    Drop a task here
                  </div>
                ) : (
                  stageTasks.map((task) => {
                    const due = getDueProgress(task);

                    return (
                      <article
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => openEditModal(task)}
                        className={`relative overflow-hidden cursor-pointer rounded-md border border-brand-primary/10 bg-white p-3 pr-6 transition-all hover:shadow-cardHover ${
                          draggedTaskId === task.id
                            ? "scale-[0.98] opacity-50"
                            : ""
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div
                            className={`rounded-full bg-brand-primary/10 p-2 px-3 mb-2 gap-2 flex items-center justify-between ${
                              task.type === "feature"
                                ? "bg-type-feature/10"
                                : "bg-type-bug/10"
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                task.type === "feature"
                                  ? "bg-type-feature"
                                  : "bg-type-bug"
                              }`}
                            />

                            <span className="font-mono text-xs capitalize text-text-muted">
                              {task.type}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => copyTaskJson(task, e)}
                              className="rounded border px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-text-muted hover:bg-black/5"
                            >
                              {/* Copy JSON */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="lucide lucide-clipboard-icon lucide-clipboard"
                              >
                                <rect
                                  width="8"
                                  height="4"
                                  x="8"
                                  y="2"
                                  rx="1"
                                  ry="1"
                                />
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <h3 className="mb-1 text-sm font-medium text-text-primary">
                          {task.title}
                        </h3>

                        <p className="mb-3 text-xs text-text-muted">
                          {task.description}
                        </p>

                        {task.dueDate && (
                          <div className="absolute right-0 top-0 h-full w-2 overflow-hidden rounded-r-md bg-black/10">
                            <div
                              className={`absolute bottom-0 left-0 w-full transition-all duration-300 ${due.color}`}
                              style={{ height: `${due.percent}%` }}
                            />
                          </div>
                        )}

                        <div className="space-y-2 text-xs text-text-muted">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="lucide lucide-user-icon lucide-user"
                              >
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                              {task.assignee}
                            </span>

                            {task.dueDate && (
                              <span className="inline-flex gap-1 items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  class="lucide lucide-clock-icon lucide-clock"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="M12 6v6l4 2" />
                                </svg>
                                {task.dueDate}
                              </span>
                            )}
                          </div>

                          <div>
                            <span className="rounded-full bg-brand-primary/10 px-2 py-1 text-[10px] font-medium text-brand-primary">
                              {task.aiModel}
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingTask ? "Edit Task" : "New Task"}
              </h2>

              {editingTask && (
                <div className="flex gap-2">
                  <button
                    onClick={() => copyTaskDescription(formData.description)}
                    className="rounded border px-3 py-2 text-sm font-medium hover:bg-black/5"
                  >
                    Copy Description
                  </button>

                  <button
                    onClick={() => copyTaskJson(editingTask)}
                    className="rounded border px-3 py-2 text-sm font-medium hover:bg-black/5"
                  >
                    Copy JSON
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-hash-icon lucide-hash"
                >
                  <line x1="4" x2="20" y1="9" y2="9" />
                  <line x1="4" x2="20" y1="15" y2="15" />
                  <line x1="10" x2="8" y1="3" y2="21" />
                  <line x1="16" x2="14" y1="3" y2="21" />
                </svg>

                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Task title"
                  className="w-full rounded border p-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Description (Markdown Supported)
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={`# Goal

- Requirement 1
- Requirement 2

**Notes**
`}
                  rows={8}
                  className="w-full rounded border p-2 font-mono text-sm"
                />
              </div>
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-captions-icon lucide-captions"
                >
                  <rect width="18" height="14" x="3" y="5" rx="2" ry="2" />
                  <path d="M7 15h4M15 15h2M7 11h2M13 11h4" />
                </svg>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full rounded border p-2"
                >
                  <option value="feature">Feature</option>
                  <option value="bug">Bug</option>
                </select>
              </div>
              <div className="flex gap-1 items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-captions-icon lucide-captions"
                >
                  <rect width="18" height="14" x="3" y="5" rx="2" ry="2" />
                  <path d="M7 15h4M15 15h2M7 11h2M13 11h4" />
                </svg>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded border p-2"
                >
                  {STAGES.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-1 items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-user-icon lucide-user"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <select
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  className="w-full rounded border p-2"
                >
                  {TEAM.map((member) => (
                    <option key={member} value={member}>
                      {member}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-1 items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-astroid-icon lucide-astroid"
                >
                  <path d="M12.983 21.186a1 1 0 0 1-1.966 0 10 10 0 0 0-8.203-8.203 1 1 0 0 1 0-1.966 10 10 0 0 0 8.203-8.203 1 1 0 0 1 1.966 0 10 10 0 0 0 8.203 8.203 1 1 0 0 1 0 1.966 10 10 0 0 0-8.203 8.203" />
                </svg>
                <select
                  name="aiModel"
                  value={formData.aiModel}
                  onChange={handleChange}
                  className="w-full rounded border p-2"
                >
                  {AI_MODELS.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-1 items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-clock-icon lucide-clock"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full rounded border p-2"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <div>
                {editingTask && (
                  <button
                    onClick={handleDelete}
                    className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={closeModal}
                  className="rounded border px-4 py-2"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  className="rounded bg-brand-primary px-4 py-2 text-white"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
