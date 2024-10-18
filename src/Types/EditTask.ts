import { Task } from "./Task";

export interface EditTaskContextType {
    editTask: (taskId: string, updatedTask: Partial<Task>) => Promise<boolean>;
  }
  
  export interface EditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    onSubmit: (updatedTask: Partial<Task>) => void;
  }
  