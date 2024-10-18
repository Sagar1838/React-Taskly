import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { Task, User, AddTaskContextType } from "../Types/Task";
import { message } from "antd";
import baseURL from "../config";

const AddTaskContext = createContext<AddTaskContextType | undefined>(undefined);

export const AddTaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [users, setUsers] = useState<User[]>([]);

  const loginData = localStorage.getItem("login");
  const parsedLogin = loginData ? JSON.parse(loginData) : null;
  const token = parsedLogin?.token || "";

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${baseURL}api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (Array.isArray(response.data.data)) {
        setUsers(
          response.data.data.map((user: any) => ({
            id: user.id,
            name: user.name,
          }))
        );
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to fetch users.");
    }
  };

  const addTask = async (task: Partial<Task>) => {
    try {
      const response = await axios.post(`${baseURL}api/task`, task, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 201) {
        message.success("Task added successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("Error adding task:", error);
      message.error("Failed to add task.");
    }
  };

  return (
    <AddTaskContext.Provider value={{ addTask, fetchUsers, users }}>
      {children}
    </AddTaskContext.Provider>
  );
};

export const useAddTask = (): AddTaskContextType => {
  const context = useContext(AddTaskContext);
  if (!context) {
    throw new Error("useAddTask must be used within an AddTaskProvider");
  }
  return context;
};
