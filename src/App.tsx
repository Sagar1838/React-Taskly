import { BrowserRouter, Route, Routes } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import { AuthProvider } from "./Context/AuthContext";
import { TaskProvider } from "./Context/TaskContext";
import { AddTaskProvider } from "./Context/AddTaskContext";
import { EditTaskProvider } from "./Context/EditTaskContext";

const Login = lazy(() => import("./Components/Login/Login"));
const Main = lazy(() => import("./Pages/Main"));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TaskProvider>
          <AddTaskProvider>
            <EditTaskProvider>
              <Suspense fallback={<div></div>}>
                <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/dashboard" element={<Main />} />
                </Routes>
              </Suspense>
            </EditTaskProvider>
          </AddTaskProvider>
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
