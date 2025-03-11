import React, { useState } from 'react';
import {
  Box,
  HStack,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Fade,
  Input,
  Tooltip
} from '@chakra-ui/react';
import { Task, TaskStatus } from '../types';
import { 
  FiEdit2, 
  FiTrash2, 
  FiCheck, 
  FiClock, 
  FiPlay,
  FiMoreVertical,
  FiArrowRight,
  FiArrowLeft,
  FiStar
} from 'react-icons/fi';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onEdit({ ...task, title: editedTitle });
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setEditedTitle(task.title);
      setIsEditing(false);
    }
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    onStatusChange(task.id, newStatus);
  };

  const getNextStatus = (current: TaskStatus): TaskStatus => {
    switch (current) {
      case 'pending': return 'in-progress';
      case 'in-progress': return 'completed';
      case 'completed': return 'pending';
    }
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus => {
    switch (current) {
      case 'pending': return 'completed';
      case 'in-progress': return 'pending';
      case 'completed': return 'in-progress';
    }
  };

  return (
    <Box
      p={4}
      bg="white"
      borderRadius="md"
      boxShadow="sm"
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition="all 0.2s"
      _hover={{ boxShadow: 'md' }}
    >
      {isEditing ? (
        <Input
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onBlur={() => {
            onEdit({ ...task, title: editedTitle });
            setIsEditing(false);
          }}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <Text 
          onDoubleClick={() => setIsEditing(true)}
          cursor="pointer"
        >
          {task.title}
        </Text>
      )}

      <Fade in={isHovered} unmountOnExit>
        <HStack 
          position="absolute" 
          top={2} 
          right={2} 
          spacing={1}
        >
          <Tooltip label="Previous status">
            <IconButton
              size="sm"
              icon={<FiArrowLeft />}
              aria-label="Move to previous status"
              variant="ghost"
              onClick={() => handleStatusChange(getPrevStatus(task.status))}
            />
          </Tooltip>

          <Tooltip label="Next status">
            <IconButton
              size="sm"
              icon={<FiArrowRight />}
              aria-label="Move to next status"
              variant="ghost"
              onClick={() => handleStatusChange(getNextStatus(task.status))}
            />
          </Tooltip>

          <Menu isOpen={isOpen} onClose={onClose}>
            <Tooltip label="More actions">
              <MenuButton
                as={IconButton}
                size="sm"
                icon={<FiMoreVertical />}
                variant="ghost"
                onClick={onOpen}
              />
            </Tooltip>
            <MenuList>
              <MenuItem icon={<FiEdit2 />} onClick={() => setIsEditing(true)}>
                Edit
              </MenuItem>
              <MenuItem 
                icon={<FiStar />} 
                onClick={() => onEdit({ ...task, priority: task.priority === 'high' ? 'medium' : 'high' })}
              >
                Toggle Priority
              </MenuItem>
              <MenuItem icon={<FiTrash2 />} onClick={() => onDelete(task.id)}>
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Fade>
    </Box>
  );
};

export default TaskCard; 