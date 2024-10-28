import { BrowserRouter, Route, Routes } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import AppProvider from "./AppProvider";

const Login = lazy(() => import("./Components/Login/Login"));
const Main = lazy(() => import("./Pages/Main"));

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Suspense fallback={<div></div>}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Main />} />
          </Routes>
        </Suspense>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
