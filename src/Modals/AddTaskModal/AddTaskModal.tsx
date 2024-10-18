import { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import "./addtaskmodal.css";
import React from "react";
import { useAddTask } from "../../Context/AddTaskContext";
import { AddTaskModalProps } from "../../Types/AddTask";

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask, fetchUsers, users } = useAddTask();
  const [filteredUsers, setFilteredUsers] = useState<
    { id: string; name: string }[]
  >([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [hasFocusedInitially, setHasFocusedInitially] = useState(false);

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      assignedTo: "",
      estimatedHours: "",
      dueDate: "",
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
      await addTask({
        ...values,
        assignedTo: values.assignedTo,
        status: "PENDING",
      });
      formik.resetForm();
      onClose();
      setHasFocusedInitially(false);

    },
  });

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      if (titleInputRef.current && !hasFocusedInitially) {
        titleInputRef.current.focus();
        setHasFocusedInitially(true);
      }
    }
  }, [isOpen, fetchUsers,hasFocusedInitially]);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(
        users.filter((user) =>
          user.name.toLowerCase().startsWith(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, users]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    formik.setFieldValue("assignee", "");
  };
  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUserId = e.target.value;
    formik.setFieldValue("assignedTo", selectedUserId);
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <section className="add-task-modal">
        <div className="dash-content">
          <div className="main-title">
            <div className="container addadmin">
              <h2>Add Task Form</h2>

              <form
                id="addAdminForm"
                className="row g-3"
                onSubmit={formik.handleSubmit}
              >
                {/* Task title input */}
                <div className="col-md-6 input-container">
                  <label htmlFor="title" className="form-label">
                    Task Title:
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      ref={titleInputRef}
                      {...formik.getFieldProps("title")}
                    />
                  </div>
                  {formik.touched.title && formik.errors.title ? (
                    <div className="error">{formik.errors.title}</div>
                  ) : null}
                </div>

                {/* Description input */}
                <div className="col-md-6 input-container">
                  <label htmlFor="description" className="form-label">
                    Description:
                  </label>
                  <div className="input-group">
                    <textarea
                      id="description"
                      className="form-control"
                      {...formik.getFieldProps("description")}
                    />
                  </div>
                  {formik.touched.description && formik.errors.description ? (
                    <div className="error">{formik.errors.description}</div>
                  ) : null}
                </div>

                {/* Assignee input with search */}
                <div className="col-md-6 input-container">
                  <label htmlFor="assignedTo" className="form-label">
                    assignedTo:
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search assignee..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    <select
                      id="assignedTo"
                      className="form-control mt-2"
                      value={formik.values.assignedTo}
                      onChange={handleAssigneeChange}
                      // {...formik.getFieldProps("assignedTo")}
                    >
                      <option value="">Select Assignee</option>

                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No assignee in this list
                        </option>
                      )}
                    </select>
                  </div>
                  {formik.touched.assignedTo && formik.errors.assignedTo ? (
                    <div className="error">{formik.errors.assignedTo}</div>
                  ) : null}
                </div>

                {/* Estimated hours input */}
                <div className="col-md-6 input-container">
                  <label htmlFor="estimatedHours" className="form-label">
                    Estimated Hours:
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      id="estimatedHours"
                      {...formik.getFieldProps("estimatedHours")}
                    />
                  </div>
                  {formik.touched.estimatedHours &&
                  formik.errors.estimatedHours ? (
                    <div className="error">{formik.errors.estimatedHours}</div>
                  ) : null}
                </div>

                {/* Due date input */}
                <div className="col-md-6 input-container">
                  <label htmlFor="dueDate" className="form-label">
                    Due Date:
                  </label>
                  <div className="input-group">
                    <input
                      type="date"
                      className="form-control"
                      id="dueDate"
                      {...formik.getFieldProps("dueDate")}
                    />
                  </div>
                  {formik.touched.dueDate && formik.errors.dueDate ? (
                    <div className="error">{formik.errors.dueDate}</div>
                  ) : null}
                </div>

                {/* Submit and cancel buttons */}
                <div className="col-12 d-flex justify-content-center">
                  <button type="submit" className="submit-button">
                    Add Task
                  </button>
                  <button
                    type="button"
                    className="close-button"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AddTaskModal;
