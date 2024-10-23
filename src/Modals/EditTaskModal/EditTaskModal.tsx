import React, { useState, useEffect, useRef, FC } from "react";
import { useEditTask } from "../../Context/EditTaskContext";
import { useAddTask } from "../../Context/AddTaskContext";
import { Task } from "../../Types/Task";
import { EditTaskModalProps } from "../../Types/EditTask";
import { useFormik } from "formik";
import "./edittaskmodal.css";

const EditTaskModal: FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onSubmit,
}) => {
  const { editTask } = useEditTask();
  const { fetchUsers, users } = useAddTask();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [hasFocusedInitially, setHasFocusedInitially] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const formik = useFormik({
    initialValues: {
      title: task ? task.title : "",
      description: task ? task.description : "",
      assignedTo: task ? task.assignedTo : "",
      estimatedHours: task ? task.estimatedHours : "",
      dueDate: task ? task.dueDate : "",
    },
    validate: (values) => {
      const errors: {
        title?: string;
        description?: string;
        assignedTo?: string;
        estimatedHours?: string;
        dueDate?: string;
      } = {};

      const getRemainingHoursToday = (): number => {
        const now = new Date();
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const remainingTime = endOfDay.getTime() - now.getTime();
        return Math.floor(remainingTime / (1000 * 60 * 60));
      };
      if (!values.title || values.title.trim() === "") {
        errors.title = "Task title is required";
      } else if (values.title.length < 3 || values.title.length > 25) {
        errors.title = "Title must be between 3 to 25 characters";
      }

      if (!values.description || values.description.trim() === "") {
        errors.description = "Description is required";
      } else if (
        values.description.length < 10 ||
        values.description.length > 250
      ) {
        errors.description = "Description must be between 10 to 250 characters";
      }

      if (!values.assignedTo) {
        errors.assignedTo = "Assignee is required";
      }

      if (!values.estimatedHours) {
        errors.estimatedHours = "Estimated hours are required";
      } else if (isNaN(Number(values.estimatedHours))) {
        errors.estimatedHours = "Estimated hours must be a number";
      } else if (Number(values.estimatedHours) >= 185) {
        errors.estimatedHours = "Estimated hours must be less than 185";
      } else {
        const today = new Date();
        const selectedDate = new Date(values.dueDate);
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        const remainingHoursToday = getRemainingHoursToday();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        let maxEstimatedHours = 0;

        if (selectedDate.getTime() === today.getTime()) {
          maxEstimatedHours = remainingHoursToday;
        } else if (selectedDate.getTime() === tomorrow.getTime()) {
          maxEstimatedHours = remainingHoursToday + 24;
        }

        if (
          maxEstimatedHours > 0 &&
          Number(values.estimatedHours) > maxEstimatedHours
        ) {
          errors.estimatedHours = `Estimated hours must be less than or equal to ${maxEstimatedHours}`;
        }
      }

      if (!values.dueDate) {
        errors.dueDate = "Due date is required";
      } else {
        const today = new Date();
        const selectedDate = new Date(values.dueDate);
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          errors.dueDate = "Due date cannot be in the past";
        }
      }

      return errors;
    },
    onSubmit: async (values) => {
      const updatedTask: Partial<Task> = {
        ...values,
      };

      const success = await editTask(task?.id || "", updatedTask);
      if (success) {
        onSubmit(updatedTask);
        onClose();
      }
    },
  });

  const formikRef = useRef(formik);
  useEffect(() => {
    if (task) {
      formikRef.current.setValues({
        title: task.title.trim(),
        description: task.description.trim(),
        assignedTo: task.assignedTo,
        estimatedHours: task.estimatedHours,
        dueDate: task.dueDate,
      });
    }
  }, [task]);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      if (titleInputRef.current && !hasFocusedInitially) {
        titleInputRef.current.focus();
        setHasFocusedInitially(true);
      }
    }
  }, [isOpen, fetchUsers, hasFocusedInitially]);

  useEffect(() => {
    setFilteredUsers(
      searchTerm
        ? users.filter((user) =>
            user.name.toLowerCase().startsWith(searchTerm.toLowerCase())
          )
        : users
    );
  }, [searchTerm, users]);

  const handleUserSelection = (userId: string) => {
    const selectedUser = users.find((user) => user.id === userId);
    if (selectedUser) {
      formik.setFieldValue("assignedTo", selectedUser.id);
      setSearchTerm(selectedUser.name);
      setShowDropdown(false);
    }
  };

  return isOpen ? (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Task</h2>
        <form onSubmit={formik.handleSubmit}>
          <div className="modal-field">
            <label>Title</label>
            <input
              type="text"
              {...formik.getFieldProps("title")}
              placeholder="Task Title"
              ref={titleInputRef}
            />
            {formik.touched.title && formik.errors.title && (
              <div className="error">{formik.errors.title}</div>
            )}
          </div>
          <div className="modal-field">
            <label>Description</label>
            <textarea
              {...formik.getFieldProps("description")}
              placeholder="Task Description"
            />
            {formik.touched.description && formik.errors.description && (
              <div className="error">{formik.errors.description}</div>
            )}
          </div>
          <div className="modal-field">
            <label>Assigned To</label>
            <div className="assignee-container">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  formik.getFieldProps("assignedTo");
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search assignee..."
              />
              {showDropdown && (
                <ul className="dropdown-list">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <li
                        key={user.id}
                        className="dropdown-item"
                        onClick={() => handleUserSelection(user.id)}
                      >
                        {user.name}
                      </li>
                    ))
                  ) : (
                    <li className="no-results">No users available</li>
                  )}
                </ul>
              )}
            </div>
            {formik.touched.assignedTo && formik.errors.assignedTo && (
              <div className="error">{formik.errors.assignedTo}</div>
            )}
          </div>
          <div className="modal-field">
            <label>Estimated Hours</label>
            <input
              type="text"
              {...formik.getFieldProps("estimatedHours")}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value) || value === "") {
                  formik.setFieldValue("estimatedHours", value);
                }
              }}
              placeholder="Estimated Hours"
            />
            {formik.touched.estimatedHours && formik.errors.estimatedHours && (
              <div className="error">{formik.errors.estimatedHours}</div>
            )}
          </div>
          <div className="modal-field">
            <label>Due Date</label>
            <input type="date" {...formik.getFieldProps("dueDate")} />
            {formik.touched.dueDate && formik.errors.dueDate && (
              <div className="error">{formik.errors.dueDate}</div>
            )}
          </div>
          <div className="modal-buttons">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
};

export default EditTaskModal;
