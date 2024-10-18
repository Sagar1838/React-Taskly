import React, { useState } from "react";
import SideBar from "../Components/SideBar/Sidebar";
import Dashboard from "../Components/Dashboard/Dashboard";
import "./main.css";

const Main: React.FC = () => {
  const [isSidebarClosed, setIsSidebarClosed] = useState<boolean>(false);

  const handleSidebarToggle = (): void => {
    setIsSidebarClosed((prevState) => !prevState);
  };

  return (
    <div
      className={`main-container ${isSidebarClosed ? "sidebar-closed" : ""}`}
    >
      <SideBar isClosed={isSidebarClosed} onToggle={handleSidebarToggle} />
      <Dashboard isSidebarClosed={isSidebarClosed} />
    </div>
  );
};

export default Main;
