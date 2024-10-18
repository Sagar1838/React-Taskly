export interface AuthContextType {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}


export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  estimatedHours: string;
  dueDate: string;
  status: string;
  createdBy: TaskCreatedBy;
  createdAt: string;
  updatedAt: string;
  deleteAt: string | null;
}

export interface TaskCreatedBy {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  deleteAt: string | null;
}

export interface TaskAssignTo {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  deleteAt: string | null;
}

export interface TaskContextType {
  tasks: Task[];
  createdTasks: Task[];
  todayTasks: Task[];
  overdueTasks: Task[];
  completedTasks: Task[];
  loading: boolean;
  error: string | null;
  fetchCreatedTasks: () => Promise<void>;
  fetchTodayTasks: () => Promise<void>;
  fetchOverdueTasks: () => Promise<void>;
  fetchCompletedTasks: () => Promise<void>;
  duplicateTask: (taskId: string) => Promise<void>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  updateTaskStatus: (
    taskId: string,
    newStatus: "COMPLETED" | "PENDING" | "IN_PROGRESS"
  ) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

export interface User {
  id: string;
  name: string;
}

export interface AddTaskContextType {
  addTask: (task: Partial<Task>) => Promise<void>;
  users: User[];
  fetchUsers: () => Promise<void>;
}

export interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    taskTitle: string,
    description: string,
    assignedTo: string,
    estimatedTime: string,
    dueDate: string
  ) => void;
}

export interface EditTaskContextType {
  editTask: (taskId: string, updatedTask: Partial<Task>) => Promise<boolean>;
}

export interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSubmit: (updatedTask: Partial<Task>) => void;
}
