import React from "react";
import { Modal } from "antd"; 

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: {
    title: string;
    description: string;
    estimatedHours: string;
    dueDate: string;
    createdBy: { name: string };
    status: string;
  } | null;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  onClose,
  task,
}) => {
  if (!task) return null;

  return (
    <Modal title="Task Details" visible={isOpen} onCancel={onClose} footer={null}>
      <div>
        <h3>{task.title}</h3>
        <p><strong>Description:</strong> {task.description}</p>
        <p><strong>Estimated Hours:</strong> {task.estimatedHours}</p>
        <p><strong>Due Date:</strong> {task.dueDate}</p>
        <p><strong>Assigned By:</strong> {task.createdBy.name}</p>
        <p><strong>Status:</strong> {task.status}</p>
      </div>
    </Modal>
  );
};

export default TaskDetailsModal;
