import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./Components/Login/Login";
import Main from "./Pages/Main";
import { AuthProvider } from "./Context/AuthContext";
import { TaskProvider } from "./Context/TaskContext";
import { AddTaskProvider } from "./Context/AddTaskContext";
import { EditTaskProvider } from "./Context/EditTaskContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TaskProvider>
          <AddTaskProvider>
            <EditTaskProvider>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Main />} />
              </Routes>
            </EditTaskProvider>
          </AddTaskProvider>
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
