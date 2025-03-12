import { useColorModeValue, Box, useMergeRefs } from '@chakra-ui/react';
import { useDroppable } from '@dnd-kit/core';
import React from 'react';
import { DroppableProps } from './Dashboard';

// Update the Droppable component
export const Droppable = React.forwardRef<HTMLDivElement, DroppableProps>(({ children, id }, ref) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: id,
    }
  });

  const bg = useColorModeValue('gray.50', 'gray.700');
  const hoverBg = useColorModeValue('blue.50', 'blue.700');
  const borderColor = useColorModeValue('blue.200', 'blue.500');

  return (
    <Box
      ref={useMergeRefs(setNodeRef, ref)}
      height="100%"
      minHeight="200px"
      transition="all 0.2s"
      bg={isOver ? hoverBg : bg}
      borderRadius="lg"
      display="flex"
      flexDirection="column"
      flex="1"
      borderWidth="2px"
      borderStyle="dashed"
      borderColor={isOver ? borderColor : 'transparent'}
      position="relative"
      role="region"
      aria-label={`${id} column`}
      mb={4}
      sx={{
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '-2px',
          borderRadius: 'lg',
          bg: isOver ? 'blackAlpha.50' : 'transparent',
          transition: 'all 0.2s',
          pointerEvents: 'none',
          zIndex: 1,
        },
        '& > *': {
          position: 'relative',
          zIndex: 2,
        }
      }}
    >
      {children}
    </Box>
  );
});
