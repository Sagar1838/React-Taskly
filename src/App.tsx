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



// import { BrowserRouter, Route, Routes } from "react-router-dom";
// import React, { Suspense, lazy, useState } from "react";
// import { AuthProvider } from "./Context/AuthContext";
// import { TaskProvider } from "./Context/TaskContext";
// import { AddTaskProvider } from "./Context/AddTaskContext";
// import { EditTaskProvider } from "./Context/EditTaskContext";
// import AddTaskModal from "./Modals/AddTaskModal/AddTaskModal";
// const Login = lazy(() => import("./Components/Login/Login"));
// const Main = lazy(() => import("./Pages/Main"));

// function App() {
//   const [isaddModalOpen, setIsaddModalOpen] = useState(false);
//   const handleAddOpenModal = () => {
//     setIsaddModalOpen(true);
//   };
//   const handleaddCloseModal = () => {
//     setIsaddModalOpen(false);
//   };
//   return (
//     // <BrowserRouter>
//     //   <AuthProvider>
//     //     <TaskProvider>
//     //       <AddTaskProvider>
//     //         <EditTaskProvider>
//     //           <Suspense fallback={<div></div>}>
//     //             <Routes>
//     //               <Route path="/" element={<Login />} />
//     //               <Route path="/dashboard" element={<Main />} />
//     //             </Routes>
//     //           </Suspense>
//     //         </EditTaskProvider>
//     //       </AddTaskProvider>
//     //     </TaskProvider>
//     //   </AuthProvider>
//     // </BrowserRouter>
//     <div>
//       <AddTaskProvider>
//         <h1>hello</h1>
//         <div className="add-task-container">
//           <button className="add-task-btn" onClick={handleAddOpenModal}>
//             + Add Task
//           </button>
//         </div>
//         {isaddModalOpen && (
//           <AddTaskModal
//             isOpen={isaddModalOpen}
//             onClose={handleaddCloseModal}
//             onSubmit={(taskData) => {
//               handleaddCloseModal();
//             }}
//           />
//         )}
//       </AddTaskProvider>
//     </div>
//   );
// }

// export default App;
