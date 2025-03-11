import React, { useState } from 'react';
import { Box, HStack, Text, Select } from '@chakra-ui/react';

interface TodoProps {
  todo: Todo;
  onDelete: (id: string) => void;
  onUpdate: (todo: Todo) => void;
  view: 'list' | 'board';
}

const Todo: React.FC<TodoProps> = ({ todo, onDelete, onUpdate, view }) => {
  const [status, setStatus] = useState<Todo['status']>(todo.status);

  const handleStatusChange = (newStatus: Todo['status']) => {
    setStatus(newStatus);
    onUpdate({ ...todo, status: newStatus });
  };

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      bg="white"
      shadow="sm"
      mb={2}
    >
      <HStack justify="space-between" mb={2}>
        {/* ... existing title and delete button code ... */}
      </HStack>
      
      <Text mb={4}>{todo.description}</Text>
      
      {/* Only show status selector in list view */}
      {view === 'list' && (
        <Select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as Todo['status'])}
          mb={2}
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </Select>
      )}
      
      {/* ... rest of the component ... */}
    </Box>
  );
};

export default Todo; 