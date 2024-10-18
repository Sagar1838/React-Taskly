import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { Task } from "../Types/Task";
import baseURL from "../config";
import { message } from "antd";
import { TaskContextType } from "../Types/Task";

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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
        setCreatedTasks([]); // Set createdTasks to empty array
        // message.warning("No created tasks found."); // Show a message to the user
      } else {
        handleErrorResponse(err);
      }
    } finally {
      setLoading(false);
    }
  };

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
        setTodayTasks([]); // Set todayTasks to empty array
        // message.warning("No tasks found for today."); // Show a message to the user
      } else {
        handleErrorResponse(err);
      }
    } finally {
      setLoading(false);
    }
  };

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

      setOverdueTasks(fetchedOverdueTasks);
    } catch (err: any) {
      if (err.response?.data?.message === "Task not found") {
        setOverdueTasks([]); // Set overdueTasks to empty array
        // message.warning("No overdue tasks found."); // Show a message to the user
      } else {
        handleErrorResponse(err);
      }
    } finally {
      setLoading(false);
    }
  };

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
        setCompletedTasks([]); // Set completedTasks to empty array
        // message.warning("No completed tasks found."); // Show a message to the user
      } else {
        handleErrorResponse(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && userId) {
      fetchTasks();
      fetchCreatedTasks();
      fetchTodayTasks();
      fetchOverdueTasks();
      fetchCompletedTasks();
    }
  }, [token, userId]);

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
        // message.warning("Task not found for duplication."); // Show a message to the user
      } else {
        handleErrorResponse(err);
      }
    } finally {
      setLoading(false);
    }
  };

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
        // message.warning("Task not found for updating status."); // Show a message to the user
      } else {
        handleErrorResponse(err);
      }
    } finally {
      setLoading(false);
    }
  };

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
        // message.warning("Task not found for deletion."); // Show a message to the user
      } else {
        handleErrorResponse(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        createdTasks,
        todayTasks,
        overdueTasks,
        completedTasks,
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

// Custom hook to use the TaskContext
export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};
