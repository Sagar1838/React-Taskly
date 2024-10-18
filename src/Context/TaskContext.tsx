import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import axios from "axios";
import { Task } from "../Types/Task";
import baseURL from "../config";
import { message } from "antd";

interface TaskContextType {
  //Store the tasks
  tasks: Task[];
  createdTasks: Task[];
  todayTasks: Task[];
  overdueTasks: Task[];
  completedTasks: Task[];
  loading: boolean;
  error: string | null;
  //Fethc the tasks
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

// Create the task context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// TaskProvider component which wraps the app and provides task data and functionality to children components
export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State to store various task lists and loading/error states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [createdTasks, setCreatedTasks] = useState<Task[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loginData = JSON.parse(localStorage.getItem("login") || "{}");
  const token = loginData.token;
  const userId = loginData.user?.id;

  // Retrieve the authentication token and userId from local storage
  const handleErrorResponse = (err: any) => {
    if (err.response) {
      const { data } = err.response;
      if (data && data.message) {
        setError(data.message);
      }
    } else {
      setError(err.message || "An error occurred");
    }
  };

  // Fetch all tasks assigned to the current user
  const fetchTasks = async () => {
    if (!token || !userId) {
      console.error("No authentication token or user ID found.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${baseURL}api/task/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Map API response data into the Task structure
      const fetchedTasks: Task[] = response.data.data.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        estimatedHours: task.estimatedHours,
        createdBy: task.createdBy,
        assignedTo: task.assignedTo.name,
        status: Array.isArray(task.status) ? task.status : [task.status],
      }));

      setTasks(fetchedTasks);
    } catch (err: any) {
      handleErrorResponse(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks created by the current user
  const fetchCreatedTasks = async () => {
    if (!token || !userId) {
      console.error("No authentication token or user ID found.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${baseURL}api/task`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          TaskCreatedBy: userId,
        },
      });
      // Check if the response is valid and update the createdTasks state
      if (response.data && Array.isArray(response.data.data)) {
        const fetchedCreatedTasks: Task[] = response.data.data.map(
          (task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            estimatedHours: task.estimatedHours,
            createdBy: task.createdBy,
            assignedTo: task.assignedTo.name,
            status: Array.isArray(task.status) ? task.status : [task.status],
          })
        );
        setCreatedTasks(fetchedCreatedTasks);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err: any) {
      if (err.response?.data?.message === "Task not found") {
        setCreatedTasks([]);
      } else {
        handleErrorResponse(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch today tasks
  const fetchTodayTasks = async () => {
    if (!token || !userId) return;

    setLoading(true);
    try {
      const response = await axios.get(`${baseURL}api/task`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { TodayTask: "" },
      });

      const fetchedTodayTasks: Task[] = Array.isArray(response.data.data)
        ? response.data.data.map((task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            estimatedHours: task.estimatedHours,
            createdBy: task.createdBy,
            assignedTo: task.assignedTo.name,
            status: Array.isArray(task.status) ? task.status : [task.status],
          }))
        : [];
      setTodayTasks(fetchedTodayTasks);
      if (fetchedTodayTasks.length === 0) {
        message.info("No tasks found for today.");
      }
    } catch (err: any) {
      if (err.response?.data?.message === "Task not found") {
        setTodayTasks([]);
      } else {
        handleErrorResponse(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch overdue tasks
  const fetchOverdueTasks = async () => {
    if (!token || !userId) return;
    setLoading(true);
    try {
      const response = await axios.get(`${baseURL}api/task`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { TaskOverDue: "" },
      });

      const fetchedOverdueTasks: Task[] = response.data.data.map(
        (task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          estimatedHours: task.estimatedHours,
          createdBy: task.createdBy,
          assignedTo: task.assignedTo.name,
          status: Array.isArray(task.status) ? task.status : [task.status],
        })
      );
      console.log("response--------", response);

      setOverdueTasks(fetchedOverdueTasks);
    } catch (err: any) {
      if (err.response?.data?.message === "Task not found") {
        setOverdueTasks([]);
      } else {
        handleErrorResponse(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch completed tasks
  const fetchCompletedTasks = async () => {
    if (!token || !userId) return;
    setLoading(true);
    try {
      const response = await axios.get(`${baseURL}api/task`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { TaskCompleted: "" },
      });

      const fetchedCompletedTasks: Task[] = response.data.data.map(
        (task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          estimatedHours: task.estimatedHours,
          createdBy: task.createdBy,
          assignedTo: task.assignedTo.name,
          status: Array.isArray(task.status) ? task.status : [task.status],
        })
      );
      setCompletedTasks(fetchedCompletedTasks);
    } catch (err: any) {
      if (err.response?.data?.message === "Task not found") {
        setCompletedTasks([]);
      } else {
        handleErrorResponse(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // On component mount, fetch all tasks and their categories
  useEffect(() => {
    if (token && userId) {
      fetchTasks();
      fetchCreatedTasks();
      fetchTodayTasks();
      fetchOverdueTasks();
      fetchCompletedTasks();
    }
  }, [token, userId]);

  // Memoize tasks to optimize re-renders
  const memoizedTasks = useMemo(() => tasks, [tasks]);
  const memoizedCreatedTasks = useMemo(() => createdTasks, [createdTasks]);
  const memoizedTodayTasks = useMemo(() => todayTasks, [todayTasks]);
  const memoizedOverdueTasks = useMemo(() => overdueTasks, [overdueTasks]);
  const memoizedCompletedTasks = useMemo(
    () => completedTasks,
    [completedTasks]
  );

  //For create duplicate task
  const duplicateTask = async (taskId: string) => {
    if (!token || !userId) return;
    setLoading(true);

    try {
      const response = await axios.post(
        `${baseURL}api/task/${taskId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        message.success("Task duplicated successfully!");
      }

      await Promise.all([
        fetchTasks(),
        fetchCreatedTasks(),
        fetchTodayTasks(),
        fetchOverdueTasks(),
        fetchCompletedTasks(),
      ]);
    } catch (err: any) {
      if (err.response?.data?.message === "Task not found") {
      } else {
        handleErrorResponse(err);
      }
    } finally {
      setLoading(false);
    }
  };

  //For update the task status
  const updateTaskStatus = async (
    taskId: string,
    newStatus: "COMPLETED" | "PENDING" | "IN_PROGRESS"
  ) => {
    if (!token || !userId) return;
    setLoading(true);

    try {
      await axios.patch(
        `${baseURL}api/task/${taskId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Task status updated successfully!");

      await Promise.all([
        fetchTasks(),
        fetchCreatedTasks(),
        fetchTodayTasks(),
        fetchOverdueTasks(),
        fetchCompletedTasks(),
      ]);
    } catch (err: any) {
      if (err.response?.data?.message === "Task not found") {
      } else {
        handleErrorResponse(err);
      }
    } finally {
      setLoading(false);
    }
  };

  //For delete the task
  const deleteTask = async (taskId: string) => {
    if (!token || !userId) return;
    setLoading(true);

    try {
      await axios.delete(`${baseURL}api/task/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Task deleted successfully!");

      await Promise.all([
        fetchTasks(),
        fetchCreatedTasks(),
        fetchTodayTasks(),
        fetchOverdueTasks(),
        fetchCompletedTasks(),
      ]);
    } catch (err: any) {
      if (err.response?.data?.message === "Task not found") {
      } else {
        handleErrorResponse(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Provide the task context to children components
  return (
    // Context provider value that will be passed to consumers
    <TaskContext.Provider
      value={{
        tasks: memoizedTasks,
        createdTasks: memoizedCreatedTasks,
        todayTasks: memoizedTodayTasks,
        overdueTasks: memoizedOverdueTasks,
        completedTasks: memoizedCompletedTasks,
        loading,
        error,
        fetchCreatedTasks,
        fetchTodayTasks,
        fetchOverdueTasks,
        fetchCompletedTasks,
        duplicateTask,
        setTasks,
        updateTaskStatus,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook to access the task context easily
export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};
