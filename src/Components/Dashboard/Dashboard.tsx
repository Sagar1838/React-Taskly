import React, { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTaskContext } from "../../Context/TaskContext";
import Login from "../Login/Login";
import AddTaskModal from "../../Modals/AddTaskModal/AddTaskModal";
import { Task } from "../../Types/Task";
import EditTaskModal from "../../Modals/EditTaskModal/EditTaskModal";
import {
  FaUsers,
  FaTasks,
  FaCalendarTimes,
  FaCheckCircle,
  FaClipboardList,
  FaEdit,
  FaTrash,
  FaInfoCircle,
  FaCopy,
} from "react-icons/fa";
import "./dashboard.css";
import { ClipLoader } from "react-spinners";
import TaskDetailsModal from "../../Modals/TaskDetailModal/TaskDetailsModal";
import { message } from "antd";
import ReactPaginate from "react-paginate";

interface DashboardProps {
  isSidebarClosed: boolean;
}

const Dashboard: FC<DashboardProps> = ({ isSidebarClosed }) => {
  const auth = localStorage.getItem("login");
  const navigate = useNavigate();
  const {
    tasks,
    loading,
    createdTasks,
    todayTasks,
    overdueTasks,
    completedTasks,
    totalAssignTask,
    totalCreatedTask,
    totalCompletedTask,
    totalOverdueTask,
    totalTodayTask,
    duplicateTask,
    updateTaskStatus,
    deleteTask,
    handleSort,
    handlePageClick,
  } = useTaskContext();
  const [isaddModalOpen, setIsaddModalOpen] = useState(false);
  const [iseditModalOpen, setIseditModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [displayedTasks, setDisplayedTasks] = useState(tasks);
  const tasksPerPage = 5;
  const [selectedTask, setSelectedTask] = useState<null | any>(null);
  const [selectedCard, setSelectedCard] = useState<string>("assigned");
  const [displayLabel, setDisplayLabel] = useState<string>("Assigned By");
  const [noTasksMessage, setNoTasksMessage] = useState<string | null>(null);
  const [count, setCount] = useState<number>(2);
  useEffect(() => {
    if (!auth) {
      navigate("/");
    }
  }, [auth, navigate]);

  useEffect(() => {
    switch (selectedCard) {
      case "assigned":
        setDisplayedTasks(tasks);
        setNoTasksMessage(
          tasks.length === 0 ? "No tasks found for assigned tasks." : null
        );
        break;
      case "today":
        setDisplayedTasks(todayTasks);
        setNoTasksMessage(
          todayTasks.length === 0 ? "No tasks found for today's tasks." : null
        );
        break;
      case "overdue":
        setDisplayedTasks(overdueTasks);
        setNoTasksMessage(
          overdueTasks.length === 0 ? "No overdue tasks found." : null
        );
        break;
      case "completed":
        setDisplayedTasks(completedTasks);
        setNoTasksMessage(
          completedTasks.length === 0 ? "No completed tasks found." : null
        );
        break;
      case "created":
        setDisplayedTasks(createdTasks);
        setNoTasksMessage(
          createdTasks.length === 0 ? "No tasks found that you created." : null
        );
        break;
      default:
        setDisplayedTasks(tasks);
    }
  }, [
    tasks,
    todayTasks,
    overdueTasks,
    completedTasks,
    createdTasks,
    selectedCard,
  ]);

  const loginData = localStorage.getItem("login");
  const parsedLogin = loginData ? JSON.parse(loginData) : null;
  const userId = parsedLogin?.user?.id || "";

  const handleFetchTodayTasks = async () => {
    setDisplayedTasks(todayTasks);
    setNoTasksMessage(
      todayTasks.length === 0 ? "No tasks found for today's tasks." : null
    );
    setCurrentPage(1);
  };

  const handleFetchOverdueTasks = async () => {
    setDisplayedTasks(overdueTasks);
    setNoTasksMessage(
      overdueTasks.length === 0 ? "No overdue tasks found." : null
    );
    setCurrentPage(1);
  };

  const handleFetchCompletedTasks = async () => {
    setDisplayedTasks(completedTasks);
    setNoTasksMessage(
      completedTasks.length === 0 ? "No completed tasks found." : null
    );
    setCurrentPage(1);
  };

  const handleFetchCreatedTasks = async () => {
    setDisplayedTasks(createdTasks);
    setNoTasksMessage(
      createdTasks.length === 0 ? "No tasks found that you created." : null
    );
    setCurrentPage(1);
  };
  const handleCardClick = (cardType: string) => {
    setSelectedCard(cardType);
    if (cardType === "assigned") {
      setDisplayLabel("Assigned By");
      setDisplayedTasks(tasks);
      setNoTasksMessage(
        tasks.length === 0 ? "No tasks found for assigned tasks." : null
      );
      setCount(totalAssignTask / tasksPerPage);
    } else if (cardType === "today") {
      setDisplayLabel("Assigned By");
      handleFetchTodayTasks();
      setCount(totalTodayTask / tasksPerPage);
    } else if (cardType === "overdue") {
      setDisplayLabel("Assigned By");
      handleFetchOverdueTasks();
      setCount(totalOverdueTask / tasksPerPage);
    } else if (cardType === "completed") {
      setDisplayLabel("Assigned By");
      handleFetchCompletedTasks();
      setCount(totalCompletedTask / tasksPerPage);
    } else if (cardType === "created") {
      setDisplayLabel("Assigned To");
      handleFetchCreatedTasks();
      setCount(totalCreatedTask / tasksPerPage);
    }
    setCurrentPage(1);
  };

  const handleShowTaskDetails = (task: any) => {
    setSelectedTask(task);
  };

  const handleCloseTaskDetailsModal = () => {
    setSelectedTask(null);
  };

  const handleAddOpenModal = () => {
    setCurrentTask(null);
    setIsaddModalOpen(true);
  };

  const handleEditOpenModal = (task: Task, taskId: string) => {
    const taskToDuplicate = displayedTasks.find((t) => t.id === taskId);
    if (taskToDuplicate && taskToDuplicate.createdBy.id === userId) {
      // if (task.createdBy.id === userId) {
      setCurrentTask(task);
      setIseditModalOpen(true);
    } else {
      message.error("You do not have permission to update this task.");
    }
  };

  const handleaddCloseModal = () => {
    setIsaddModalOpen(false);
    setCurrentTask(null);
  };

  const handleeditCloseModal = () => {
    setIseditModalOpen(false);
    setCurrentTask(null);
  };

  const handleDuplicateTask = async (taskId: string) => {
    const taskToDuplicate = displayedTasks.find((t) => t.id === taskId);
    if (taskToDuplicate && taskToDuplicate.createdBy.id === userId) {
      await duplicateTask(taskId);
      updateTasksForSelectedCard();
    } else {
      message.error("You do not have permission to Copy this task.");
    }
  };

  const handleStatusChange = (
    taskId: string,
    newStatus: "COMPLETED" | "PENDING" | "IN_PROGRESS"
  ) => {
    updateTaskStatus(taskId, newStatus);
    updateTasksForSelectedCard();
  };

  const totalPages = Math.ceil(displayedTasks.length / tasksPerPage);
  const startIndex = (currentPage - 1) * tasksPerPage;
  const currentTasks = displayedTasks.slice(
    startIndex,
    startIndex + tasksPerPage
  );

  const handleDeleteTask = async (taskId: string) => {
    const taskToDelete = displayedTasks.find((t) => t.id === taskId);
    if (taskToDelete && taskToDelete.createdBy.id === userId) {
      await deleteTask(taskId);
      updateTasksForSelectedCard();
    } else {
      message.error("You do not have permission to delete this task.");
    }
  };

  const updateTasksForSelectedCard = () => {
    switch (selectedCard) {
      case "assigned":
        setDisplayedTasks(tasks);
        setNoTasksMessage(
          tasks.length === 0 ? "No tasks found for assigned tasks." : null
        );
        break;
      case "today":
        setDisplayedTasks(todayTasks);
        setNoTasksMessage(
          todayTasks.length === 0 ? "No tasks found for today's tasks." : null
        );
        break;
      case "overdue":
        setDisplayedTasks(overdueTasks);
        setNoTasksMessage(
          overdueTasks.length === 0 ? "No overdue tasks found." : null
        );
        break;
      case "completed":
        setDisplayedTasks(completedTasks);
        setNoTasksMessage(
          completedTasks.length === 0 ? "No completed tasks found." : null
        );
        break;
      case "created":
        setDisplayedTasks(createdTasks);
        setNoTasksMessage(
          createdTasks.length === 0 ? "No tasks found that you created." : null
        );
        break;
      default:
        setDisplayedTasks(tasks);
    }
  };
  const formatDate = (dateString: string): string => {
    const dateParts = dateString.split("-");
    return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
  };

  type SortState = {
    estimatedHours: "ASC" | "DESC";
    dueDate: "ASC" | "DESC";
    createdAt: "ASC" | "DESC";
  };

  const [sortState, setSortState] = useState<SortState>({
    estimatedHours: "ASC",
    dueDate: "ASC",
    createdAt: "ASC",
  });

  const handleColumnSort = (columnValue: keyof SortState) => {
    const newOrder = sortState[columnValue] === "ASC" ? "DESC" : "ASC";
    setSortState((prevState) => ({
      ...prevState,
      [columnValue]: newOrder,
    }));

    handleSort(columnValue);
  };
  return (
    <>
      {auth ? (
        <>
          <div
            className={`dashboard-container ${
              isSidebarClosed ? "expanded" : ""
            }`}
          >
            <section className="dashboard">
              <div className="dash-content">
                <div className="overview">
                  <div className="title">
                    <i className="uil-dashboard"></i>
                    <span className="text">Tasks</span>
                  </div>
                  <div className="cards-container">
                    <div
                      className={`card ${
                        selectedCard === "assigned" ? "selected" : ""
                      }`}
                      onClick={() => handleCardClick("assigned")}
                    >
                      <FaUsers className="card-icon" />
                      <span className="text">Tasks assigned to you</span>
                      <span className="number">{totalAssignTask}</span>
                    </div>
                    <div
                      className={`card ${
                        selectedCard === "today" ? "selected" : ""
                      }`}
                      onClick={() => handleCardClick("today")}
                    >
                      <FaTasks className="card-icon" />
                      <span className="text">Today's tasks</span>
                      <span className="number">{totalTodayTask}</span>
                    </div>
                    <div
                      className={`card ${
                        selectedCard === "overdue" ? "selected" : ""
                      }`}
                      onClick={() => handleCardClick("overdue")}
                    >
                      <FaCalendarTimes className="card-icon" />
                      <span className="text">Task Overdue</span>
                      <span className="number">{totalOverdueTask}</span>
                    </div>
                    <div
                      className={`card ${
                        selectedCard === "completed" ? "selected" : ""
                      }`}
                      onClick={() => handleCardClick("completed")}
                    >
                      <FaCheckCircle className="card-icon" />
                      <span className="text">Task Completed</span>
                      <span className="number">{totalCompletedTask}</span>
                    </div>
                    <div
                      className={`card ${
                        selectedCard === "created" ? "selected" : ""
                      }`}
                      onClick={() => handleCardClick("created")}
                    >
                      <FaClipboardList className="card-icon" />
                      <span className="text">Task Created by you</span>
                      <span className="number">{totalCreatedTask}</span>
                    </div>
                  </div>
                </div>
                <div className="add-task-container">
                  <button className="add-task-btn" onClick={handleAddOpenModal}>
                    + Add Task
                  </button>
                </div>
                <div className="activity">
                  <div className="title">
                    <i className="uil-info-circle"></i>
                    <span className="text">Task List</span>
                  </div>
                  <div className="table-responsive">
                    <table className="task-table">
                      <thead>
                        <tr>
                          <th>Task Name</th>
                          <th
                            onClick={() => handleColumnSort("estimatedHours")}
                            className="sortable-header"
                          >
                            Estimated Hours{" "}
                            {sortState["estimatedHours"] === "ASC" ? "▲" : "▼"}
                          </th>
                          <th
                            onClick={() => handleColumnSort("dueDate")}
                            className="sortable-header"
                          >
                            Due On {sortState["dueDate"] === "ASC" ? "▲" : "▼"}
                          </th>
                          <th
                            onClick={() => handleColumnSort("createdAt")}
                            className="sortable-header"
                          >
                            {displayLabel}{" "}
                            {sortState["createdAt"] === "ASC" ? "▲" : "▼"}
                          </th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentTasks.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="no-tasks-message">
                              {noTasksMessage || "No tasks available."}
                            </td>
                          </tr>
                        ) : (
                          currentTasks.map((task) => (
                            <tr key={task.id}>
                              <td>{task.title}</td>
                              <td>{task.estimatedHours}</td>
                              <td>{formatDate(task.dueDate)}</td>
                              {/* <td>{task?.createdBy?.name}</td> */}
                              <td>
                                {selectedCard === "created"
                                  ? task.assignedTo
                                  : task.createdBy?.name}
                              </td>
                              <td>
                                <select
                                  value={task.status[0]}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      task.id,
                                      e.target.value as
                                        | "COMPLETED"
                                        | "PENDING"
                                        | "IN_PROGRESS"
                                    )
                                  }
                                >
                                  <option value="PENDING">Pending</option>
                                  <option value="COMPLETED">Completed</option>
                                  <option value="IN_PROGRESS">
                                    In Progress
                                  </option>
                                </select>
                              </td>
                              <td>
                                <button
                                  className="edit-btn"
                                  onClick={() =>
                                    handleEditOpenModal(task, task.id)
                                  }
                                >
                                  <FaEdit title="Edit" />
                                </button>
                                <button
                                  className="delete-btn"
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  <FaTrash title="Delete" />
                                </button>
                                <button
                                  onClick={() => handleShowTaskDetails(task)}
                                >
                                  <FaInfoCircle title="Info" />
                                </button>
                                <button
                                  onClick={() => handleDuplicateTask(task.id)}
                                >
                                  <FaCopy title="Copy" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <ReactPaginate
                    previousLabel={"Previous"}
                    nextLabel={"Next"}
                    breakLabel={"..."}
                    pageCount={count}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={count}
                    onPageChange={handlePageClick}
                    containerClassName={"pagination"}
                    activeClassName={"active"}
                    pageLinkClassName={"page-link"}
                    previousLinkClassName={handlePageClick}
                    nextLinkClassName={handlePageClick}
                    breakLinkClassName={"break-link"}
                  />
                </div>
              </div>
            </section>
          </div>
          {isaddModalOpen && (
            <AddTaskModal
              isOpen={isaddModalOpen}
              onClose={handleaddCloseModal}
              onSubmit={(taskData) => {
                handleaddCloseModal();
              }}
            />
          )}
          <EditTaskModal
            isOpen={iseditModalOpen}
            onClose={handleeditCloseModal}
            task={currentTask}
            onSubmit={(taskData) => {
              handleeditCloseModal();
            }}
          />
          {selectedTask && (
            <TaskDetailsModal
              isOpen={!!selectedTask}
              onClose={handleCloseTaskDetailsModal}
              task={selectedTask}
            />
          )}
          <div className={`overlay ${loading ? "active" : ""}`}>
            <div className="loader-container">
              <ClipLoader size={50} color={"#3b82f6"} loading={loading} />
            </div>
          </div>
        </>
      ) : (
        <Login />
      )}
    </>
  );
};

export default Dashboard;
