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
  const [totalCreatedTask, setCreatedtotalTask] = useState<number>(0);
  const [totalCompletedTask, setCompletedtotalTask] = useState<number>(0);
  const [totalOverdueTask, setOverdueTotalTask] = useState<number>(0);
  const [totalTodayTask, setTodayTotalTasks] = useState<number>(0);
  const [totalAssignTask, setTotalAssignTask] = useState<number>(0);
  const loginData = JSON.parse(localStorage.getItem("login") || "{}");
  const token = loginData.token;
  const userId = loginData.user?.id;

  const [currentPage, setCurrentPage] = useState<number>(1); // State for current page
  const [totalPages, setTotalPages] = useState<number>(1); // State for total pages
  const itemsPerPage = 5;
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("ASC");
  const combinedSort = `${sortColumn}=${sortOrder}`;
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

  const fetchTasks = async (newpage: number, combinedSort: string = "") => {
    if (!token || !userId) {
      console.error("No authentication token or user ID found.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseURL}api/task/${userId}?${combinedSort}`,
        {
          headers: { Authorization: `Bearer ${token} ` },
          params: {
            page: currentPage,
            limit: itemsPerPage,
          },
        }
      );
      // console.log("assignTo Me API", response.data);

      const totalAssignTask = response?.data?.totalTask;
      setTotalAssignTask(totalAssignTask);
      if (response.data && Array.isArray(response.data.result)) {
        const fetchedTasks: Task[] = response.data.result.map((task: any) => ({
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
        setTotalPages(Math.ceil(totalAssignTask / itemsPerPage));
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err: any) {
      setTotalAssignTask(0);

      handleErrorResponse(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCreatedTasks = async (
    newpage: number,
    combinedSort: string = ""
  ) => {
    if (!token || !userId) {
      console.error("No authentication token or user ID found.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${baseURL}api/task?${combinedSort}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          TaskCreatedBy: userId,
          page: currentPage,
          limit: itemsPerPage,
        },
      });
      console.log("task created---", response.data.data.pageCount);
      //console.log("task created Me API", response.data);
      const totalCreatedTask = response?.data?.data?.totalTask;
      setCreatedtotalTask(totalCreatedTask);
      if (response.data && Array.isArray(response.data.data.result)) {
        const fetchedCreatedTasks: Task[] = response.data.data.result.map(
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
        setTotalPages(Math.ceil(totalAssignTask / itemsPerPage));
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err: any) {
      if (err.response?.data?.message === "Task not found") {
        setCreatedTasks([]);
        setCreatedtotalTask(0);
      } else {
        handleErrorResponse(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch today tasks

  const fetchTodayTasks = async (
    newpage: number,
    combinedSort: string = ""
  ) => {
    if (!token || !userId) return;

    setLoading(true);
    try {
      const response = await axios.get(`${baseURL}api/task?${combinedSort}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          TodayTask: "",
          page: currentPage,
          limit: itemsPerPage,
        },
      });

      // console.log("today task",response.data)
      const totalTodayTask = response?.data?.data?.totalTask;
      setTodayTotalTasks(totalTodayTask);
      if (response.data && Array.isArray(response.data.data.result)) {
        const fetchedTodayTasks: Task[] = response.data.data.result.map(
          (task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            estimatedHours: task.estimatedHours,
            createdBy: task.createdBy,
            assignedTo: task.assignedTo?.name || "Unassigned", // Fallback
            status: Array.isArray(task.status) ? task.status : [task.status],
          })
        );
        setTodayTasks(fetchedTodayTasks);
        setTotalPages(Math.ceil(totalAssignTask / itemsPerPage));
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err: any) {
      // Log detailed error
      if (err?.response?.data?.message === "Task not found") {
        setTodayTasks([]);
        setTodayTotalTasks(0);
      } else {
        handleErrorResponse(err);
        console.error("Error fetching today's tasks:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch overdue tasks

  const fetchOverdueTasks = async (
    newpage: number,
    combinedSort: string = ""
  ) => {
    if (!token || !userId) return;
    setLoading(true);
    try {
      const response = await axios.get(`${baseURL}api/task?${combinedSort}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          TaskOverDue: "",
          page: currentPage,
          limit: itemsPerPage,
          // createdAt: "DESC",
        },
      });

      const totalOverdueTask = response?.data?.data?.totalTask;
      setOverdueTotalTask(totalOverdueTask);
      if (response.data && Array.isArray(response.data.data.result)) {
        const fetchedOverdueTasks: Task[] = response.data.data.result.map(
          //  const fetchedOverdueTasks: Task[] = response.data.data.result.map(
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
        setTotalPages(Math.ceil(totalAssignTask / itemsPerPage));
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err: any) {
      if (err?.response?.data?.message === "Task not found") {
        setOverdueTasks([]);
        setOverdueTotalTask(0);
      } else {
        handleErrorResponse(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch completed tasks

  const fetchCompletedTasks = async (
    newpage: number,
    combinedSort: string = ""
  ) => {
    if (!token || !userId) return;
    setLoading(true);
    try {
      const response = await axios.get(`${baseURL}api/task?${combinedSort}`, {
        headers: { Authorization: `Bearer ${token} ` },
        params: {
          TaskCompleted: "",
          page: currentPage,
          limit: itemsPerPage,
          // createdAt: "DESC",
        },
      });

      const totalCompletedTask = response?.data?.data?.totalTask;
      setCompletedtotalTask(totalCompletedTask);
      if (response.data && Array.isArray(response.data.data.result)) {
        const fetchedCompletedTasks: Task[] = response.data.data.result.map(
          // const fetchedCompletedTasks: Task[] = response.data.data.result.map(
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
        setTotalPages(Math.ceil(totalAssignTask / itemsPerPage));
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err: any) {
      if (err.response?.data?.message === "Task not found") {
        setCompletedTasks([]);
        setCompletedtotalTask(0);
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
      fetchTasks(currentPage, combinedSort);
      fetchCreatedTasks(currentPage, combinedSort);
      fetchTodayTasks(currentPage, combinedSort);
      fetchOverdueTasks(currentPage, combinedSort);
      fetchCompletedTasks(currentPage, combinedSort);
    }
  }, [token, userId, currentPage]);

  // Memoize tasks to optimize re-renders
  // const memoizedTasks = useMemo(() => tasks, [tasks]);
  // const memoizedCreatedTasks = useMemo(() => createdTasks, [createdTasks]);
  // const memoizedTodayTasks = useMemo(() => todayTasks, [todayTasks]);
  // const memoizedOverdueTasks = useMemo(() => overdueTasks, [overdueTasks]);
  // const memoizedCompletedTasks = useMemo(
  //   () => completedTasks,
  //   [completedTasks]
  // );

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
        fetchTasks(currentPage, combinedSort),
        fetchCreatedTasks(currentPage, combinedSort),
        fetchTodayTasks(currentPage, combinedSort),
        fetchOverdueTasks(currentPage, combinedSort),
        fetchCompletedTasks(currentPage, combinedSort),
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
        fetchTasks(currentPage, combinedSort),
        fetchCreatedTasks(currentPage, combinedSort),
        fetchTodayTasks(currentPage, combinedSort),
        fetchOverdueTasks(currentPage, combinedSort),
        fetchCompletedTasks(currentPage, combinedSort),
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
        fetchTasks(currentPage, combinedSort),
        fetchCreatedTasks(currentPage, combinedSort),
        fetchTodayTasks(currentPage, combinedSort),
        fetchOverdueTasks(currentPage, combinedSort),
        fetchCompletedTasks(currentPage, combinedSort),
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
  const handlePageClick = (data: { selected: any }, combinedSort: string) => {
    const newpage = data.selected + 1;
    setCurrentPage(newpage); // Pages are 0-based, so add 1
    fetchTasks(newpage, combinedSort);
    fetchCreatedTasks(newpage, combinedSort);
    fetchTodayTasks(newpage, combinedSort);
    fetchOverdueTasks(newpage, combinedSort);
    fetchCompletedTasks(newpage, combinedSort);
  };

  const handleSort = (columnvalue: string) => {
    const newOrder = sortOrder === "ASC" ? "DESC" : "ASC";
    const combinedSort = `${columnvalue}=${newOrder}`;
    setSortColumn(columnvalue);
    setSortOrder(newOrder);

    // Fetch tasks with the new sort
    fetchTasks(currentPage, combinedSort);
    fetchCreatedTasks(currentPage, combinedSort);
    fetchTodayTasks(currentPage, combinedSort);
    fetchOverdueTasks(currentPage, combinedSort);
    fetchCompletedTasks(currentPage, combinedSort);
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
        totalAssignTask: totalAssignTask,
        totalCreatedTask: totalCreatedTask,
        totalCompletedTask: totalCompletedTask,
        totalOverdueTask: totalOverdueTask,
        totalTodayTask: totalTodayTask,
        fetchTasks,
        currentPage,
        totalPages,
        // handlePageChange,
        handleSort,
        // setPageNumber: handleSetPageNumber,
        // pageCount,
        handlePageClick,
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
