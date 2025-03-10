// Task priority levels
enum TaskPriority {
  Low = "low",
  Medium = "medium",
  High = "high",
}

// Task status
enum TaskStatus {
  Todo = "todo",
  InProgress = "in-progress",
  Done = "done",
}

// Task interface
interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

class TaskManager {
  private tasks: Task[] = [];
  private static instance: TaskManager;

  private constructor() {}

  // Get singleton instance
  public static getInstance(): TaskManager {
    if (!TaskManager.instance) {
      TaskManager.instance = new TaskManager();
    }
    return TaskManager.instance;
  }

  // Create a new task
  public createTask(
    title: string,
    priority: TaskPriority = TaskPriority.Medium,
    description?: string,
    dueDate?: Date,
    tags: string[] = []
  ): Task {
    // Generate ID
    const id = this.generateId();

    // Get current date
    const now = new Date();

    // Create task object
    const task: Task = {
      id,
      title,
      description,
      priority,
      status: TaskStatus.Todo,
      dueDate,
      createdAt: now,
      updatedAt: now,
      tags,
    };

    // Add to tasks array
    this.tasks.push(task);

    // Log creation
    console.log(`Task created: ${title}`);

    return task;
  }

  // Generate a unique ID
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  // Get all tasks
  public getAllTasks(): Task[] {
    return [...this.tasks];
  }

  // Get task by ID
  public getTaskById(id: string): Task | null {
    // Find task by ID
    const task = this.tasks.find((task) => task.id === id);

    if (!task) {
      console.log(`Task not found: ${id}`);
      return null;
    }

    return task;
  }

  // Update task status
  public updateTaskStatus(id: string, status: TaskStatus): boolean {
    // Find task by ID
    const task = this.getTaskById(id);

    if (!task) {
      return false;
    }

    // Update status
    task.status = status;
    task.updatedAt = new Date();

    console.log(`Task status updated: ${task.title} -> ${status}`);
    return true;
  }

  // Update task priority
  public updateTaskPriority(id: string, priority: TaskPriority): boolean {
    // Find task by ID
    const task = this.getTaskById(id);

    if (!task) {
      return false;
    }

    // Update priority
    task.priority = priority;
    task.updatedAt = new Date();

    console.log(`Task priority updated: ${task.title} -> ${priority}`);
    return true;
  }

  // Delete task
  public deleteTask(id: string): boolean {
    // Find task index
    const index = this.tasks.findIndex((task) => task.id === id);

    if (index === -1) {
      console.log(`Task not found: ${id}`);
      return false;
    }

    // Remove task
    const deletedTask = this.tasks.splice(index, 1)[0];
    console.log(`Task deleted: ${deletedTask.title}`);
    return true;
  }

  // Get tasks by status
  public getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks.filter((task) => task.status === status);
  }

  // Get tasks by priority
  public getTasksByPriority(priority: TaskPriority): Task[] {
    return this.tasks.filter((task) => task.priority === priority);
  }

  // Get overdue tasks
  public getOverdueTasks(): Task[] {
    const now = new Date();
    return this.tasks.filter(
      (task) =>
        task.status !== TaskStatus.Done && task.dueDate && task.dueDate < now
    );
  }

  // Add tag to task
  public addTagToTask(id: string, tag: string): boolean {
    // Find task by ID
    const task = this.getTaskById(id);

    if (!task) {
      return false;
    }

    // Check if tag already exists
    if (!task.tags.includes(tag)) {
      task.tags.push(tag);
      task.updatedAt = new Date();
      console.log(`Tag added to task: ${task.title} -> ${tag}`);
    }

    return true;
  }

  // Get tasks by tag
  public getTasksByTag(tag: string): Task[] {
    return this.tasks.filter((task) => task.tags.includes(tag));
  }
}

// Example usage
const taskManager = TaskManager.getInstance();

// Create tasks
const task1 = taskManager.createTask(
  "Complete project",
  TaskPriority.High,
  "Finish the project by the deadline",
  new Date("2023-12-31"),
  ["work", "important"]
);

const task2 = taskManager.createTask(
  "Buy groceries",
  TaskPriority.Medium,
  "Get items for dinner",
  new Date("2023-10-15"),
  ["personal"]
);

// Update task status
taskManager.updateTaskStatus(task1.id, TaskStatus.InProgress);

// Add tag
taskManager.addTagToTask(task2.id, "shopping");

// Get all tasks
const allTasks = taskManager.getAllTasks();
console.log("All tasks:", allTasks);

// Get high priority tasks
const highPriorityTasks = taskManager.getTasksByPriority(TaskPriority.High);
console.log("High priority tasks:", highPriorityTasks);

// Delete a task
taskManager.deleteTask(task2.id);
