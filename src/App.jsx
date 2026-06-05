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

export default function App() {
 
  const [tasks, setTasks] = useLocalStorage("vibetracker.tasks", [
    {
      id: "1",
      title: "Build Kanban Layout",
      description: "Create the four board columns and render cards.",
      type: "feature",
      status: "todo",
      assignee: TEAM[0],
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
      dueDate: null,
      createdDate: "2026-06-05",
    },
  ]);

  const emptyTask = {
    title: "",
    description: "",
    type: "feature",
    status: "todo",
    assignee: TEAM[0],
    dueDate: "",
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState(emptyTask);

  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

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

        <button
          onClick={openCreateModal}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-xl font-semibold text-white shadow-md transition hover:scale-105"
        >
          +
        </button>
      </header>

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
                  stageTasks.map((task) => (
                    <article
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => openEditModal(task)}
                      className={`cursor-pointer rounded-md border border-brand-primary/10 bg-white p-3 transition-all hover:shadow-cardHover ${
                        draggedTaskId === task.id
                          ? "scale-[0.98] opacity-50"
                          : ""
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between">
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

                      <h3 className="mb-1 text-sm font-medium text-text-primary">
                        {task.title}
                      </h3>

                      <p className="mb-3 text-xs text-text-muted">
                        {task.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-text-muted">
                        <span>{task.assignee}</span>

                        {task.dueDate && <span>{task.dueDate}</span>}
                      </div>
                    </article>
                  ))
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
            <h2 className="mb-4 text-lg font-semibold">
              {editingTask ? "Edit Task" : "New Task"}
            </h2>

            <div className="space-y-4">
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Task title"
                className="w-full rounded border p-2"
              />

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Task description"
                rows={4}
                className="w-full rounded border p-2"
              />

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded border p-2"
              >
                <option value="feature">Feature</option>
                <option value="bug">Bug</option>
              </select>

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

              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full rounded border p-2"
              />
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
