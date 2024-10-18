import { Task } from "./Task";

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