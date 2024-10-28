import { AuthProvider } from "./Context/AuthContext";
import { TaskProvider } from "./Context/TaskContext";
import { AddTaskProvider } from "./Context/AddTaskContext";
import { EditTaskProvider } from "./Context/EditTaskContext";

function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TaskProvider>
        <AddTaskProvider>
          <EditTaskProvider>{children}</EditTaskProvider>
        </AddTaskProvider>
      </TaskProvider>
    </AuthProvider>
  );
}

export default AppProvider;