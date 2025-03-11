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
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
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

const MotionBox = motion(Box);

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const cardBg = useColorModeValue('white', 'gray.800');
  const shineBg = useColorModeValue(
    'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)',
    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
  );

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
    <MotionBox
      p={4}
      bg={cardBg}
      borderRadius="md"
      boxShadow="sm"
      position="relative"
      overflow="hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ scale: 1 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
        y: -2
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
      sx={{
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '200%',
          height: '100%',
          background: shineBg,
          transform: 'translateX(-100%)',
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'none',
          zIndex: 1,
        },
        '&:hover::before': {
          transform: 'translateX(50%)',
        }
      }}
    >
      <Box position="relative" zIndex={2}>
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
            transition="color 0.2s"
            _hover={{ color: 'blue.500' }}
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
            as={motion.div}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, staggerChildren: 0.1 }}
          >
            <Tooltip label="Previous status">
              <IconButton
                as={motion.button}
                whileHover={{ 
                  scale: 1.1,
                  rotate: -10 
                }}
                whileTap={{ scale: 0.95 }}
                size="sm"
                icon={<FiArrowLeft />}
                aria-label="Move to previous status"
                variant="ghost"
                onClick={() => handleStatusChange(getPrevStatus(task.status))}
              />
            </Tooltip>

            <Tooltip label="Next status">
              <IconButton
                as={motion.button}
                whileHover={{ 
                  scale: 1.1,
                  rotate: 10 
                }}
                whileTap={{ scale: 0.95 }}
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
                  as={motion.button}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  size="sm"
                  icon={<FiMoreVertical />}
                  variant="ghost"
                  onClick={onOpen}
                />
              </Tooltip>
              <MenuList>
                <MenuItem 
                  icon={<FiEdit2 />} 
                  onClick={() => setIsEditing(true)}
                  _hover={{ bg: 'blue.50' }}
                >
                  Edit
                </MenuItem>
                <MenuItem 
                  icon={<FiStar />} 
                  onClick={() => onEdit({ ...task, priority: task.priority === 'high' ? 'medium' : 'high' })}
                  _hover={{ bg: 'yellow.50' }}
                >
                  Toggle Priority
                </MenuItem>
                <MenuItem 
                  icon={<FiTrash2 />} 
                  onClick={() => onDelete(task.id)}
                  _hover={{ bg: 'red.50' }}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Fade>
      </Box>
    </MotionBox>
  );
};

export default TaskCard; 