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
  pageCount: string;
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
  totalAssignTask: number;
  totalCreatedTask: number;
  totalCompletedTask: number;
  totalOverdueTask: number;
  totalTodayTask: number;
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
  handleSort: (columnvalue: string) => void;
  fetchTasks: (page: number) => void;
}
