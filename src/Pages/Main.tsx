import React, { useState, lazy, Suspense } from "react";
import "./main.css";

const SideBar = lazy(() => import("../Components/SideBar/Sidebar"));
const Dashboard = lazy(() => import("../Components/Dashboard/Dashboard"));

const Main: React.FC = () => {
  const [isSidebarClosed, setIsSidebarClosed] = useState<boolean>(false);

  const handleSidebarToggle = (): void => {
    setIsSidebarClosed((prevState) => !prevState);
  };

  return (
    <div
      className={`main-container ${isSidebarClosed ? "sidebar-closed" : ""}`}
    >
      <Suspense fallback={<div></div>}>
        <SideBar isClosed={isSidebarClosed} onToggle={handleSidebarToggle} />
      </Suspense>
      <Suspense fallback={<div></div>}>
        <Dashboard isSidebarClosed={isSidebarClosed} />
      </Suspense>
    </div>
  );
};

export default Main;
