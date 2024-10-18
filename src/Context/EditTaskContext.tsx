import React, { createContext, useContext, FC, ReactNode } from "react";
import axios from "axios";
import { Task, EditTaskContextType } from "../Types/Task";
import baseURL from "../config";
import { message } from "antd";

const EditTaskContext = createContext<EditTaskContextType | undefined>(
  undefined
);

export const useEditTask = () => {
  const context = useContext(EditTaskContext);
  if (!context) {
    throw new Error("useEditTask must be used within an EditTaskProvider");
  }
  return context;
};
const loginData = localStorage.getItem("login");
const parsedLogin = loginData ? JSON.parse(loginData) : null;
const token = parsedLogin?.token || "";
export const EditTaskProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const editTask = async (
    taskId: string,
    updatedTask: Partial<Task>
  ): Promise<boolean> => {
    try {
      const response = await axios.patch(
        `${baseURL}api/task/updatetask/${taskId}`,
        updatedTask,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        message.success("Task updated successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
      console.log("Task updated successfully!", editTask);
      return true;
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        message.error("Failed to Update task.");
      } else {
        const errorMessage = error.response
          ? error.response.data.message
          : error.message || "Failed to Update task.";
        message.error(errorMessage);
      }

      console.error("Error updating task:", error);
      return false;
    }
  };

  return (
    <EditTaskContext.Provider value={{ editTask }}>
      {children}
    </EditTaskContext.Provider>
  );
};
