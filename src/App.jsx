import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState(() => {
  const savedTasks = localStorage.getItem("kanbanTasks");
  return savedTasks
    ? JSON.parse(savedTasks)
    : {
        todo: [],
        inProgress: [],
        done: []
      };
});

  const [newTask, setNewTask] = useState("");

  useEffect(() => {
  localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
}, [tasks]);

  const handleAddTask = () => {
    if (!newTask.trim()) return;

    const task = {
  id: Date.now(),
  title: newTask,
  editing: false
};

    setTasks({
      ...tasks,
      todo: [...tasks.todo, task]
    });

    setNewTask("");
  };

  const moveTask = (task, from, to) => {
    setTasks({
      ...tasks,
      [from]: tasks[from].filter((t) => t.id !== task.id),
      [to]: [...tasks[to], task]
    });
  };

  useEffect(() => {
  const sparkle = (e) => {
    const star = document.createElement("div");
    star.className = "sparkle";
    star.style.left = e.pageX + "px";
    star.style.top = e.pageY + "px";
    document.body.appendChild(star);

    setTimeout(() => {
      star.remove();
    }, 400);
  };

  window.addEventListener("mousemove", sparkle);

  return () => {
    window.removeEventListener("mousemove", sparkle);
  };
}, []);

  return (
  <div className="app-container">
    <h1>Kanban Task Manager</h1>

    <div className="add-task">
      <input
        type="text"
        placeholder="Enter new task..."
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
      />
      <button onClick={handleAddTask}>Add</button>
    </div>

    <DragDropContext
      onDragEnd={(result) => {
        const { source, destination } = result;

        if (!destination) return;

        const sourceCol = source.droppableId;
        const destCol = destination.droppableId;

        const sourceTasks = [...tasks[sourceCol]];
        const movedTask = sourceTasks[source.index];

        sourceTasks.splice(source.index, 1);

        const destTasks = [...tasks[destCol]];
        destTasks.splice(destination.index, 0, movedTask);

        setTasks({
          ...tasks,
          [sourceCol]: sourceTasks,
          [destCol]: destTasks
        });
      }}
    >
      <div className="columns">
        {["todo", "inProgress", "done"].map((columnKey) => (
          <Droppable key={columnKey} droppableId={columnKey}>
            {(provided) => (
              <div
                className="column"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <h2>
                  {columnKey === "todo"
                    ? "Todo"
                    : columnKey === "inProgress"
                    ? "In Progress"
                    : "Done"}
                </h2>

                {tasks[columnKey].map((task, index) => (
                  <Draggable
                    key={task.id}
                    draggableId={task.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <div
  className="task-card"
  ref={provided.innerRef}
  {...provided.draggableProps}
  {...provided.dragHandleProps}
>
  {task.editing ? (
  <input
    value={task.title}
    autoFocus
    onChange={(e) => {
      const updated = tasks[columnKey].map((t) =>
        t.id === task.id ? { ...t, title: e.target.value } : t
      );
      setTasks({
        ...tasks,
        [columnKey]: updated
      });
    }}
    onBlur={() => {
      const updated = tasks[columnKey].map((t) =>
        t.id === task.id ? { ...t, editing: false } : t
      );
      setTasks({
        ...tasks,
        [columnKey]: updated
      });
    }}
  />
) : (
  <span
    onDoubleClick={() => {
      const updated = tasks[columnKey].map((t) =>
        t.id === task.id ? { ...t, editing: true } : t
      );
      setTasks({
        ...tasks,
        [columnKey]: updated
      });
    }}
  >
    {task.title}
  </span>
)}
  <button
    className="delete-btn"
    onClick={() => {
      const updated = tasks[columnKey].filter(
        (t) => t.id !== task.id
      );
      setTasks({
        ...tasks,
        [columnKey]: updated
      });
    }}
  >
    ✕
  </button>
</div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  </div>
);
}

export default App;