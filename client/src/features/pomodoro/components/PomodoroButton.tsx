import React from 'react';
import { Button, Tooltip, Icon, IconButton, Badge, HStack } from '@chakra-ui/react';
import { FaClock } from 'react-icons/fa';
import { PomodoroButtonProps } from '../types/pomodoro';
import { usePomodoroStore } from '../hooks/usePomodoroStore';

const PomodoroButton: React.FC<PomodoroButtonProps> = ({
  onClick,
  task,
  size = 'md',
  colorScheme = 'purple',
  variant = 'ghost',
  isCompact = false
}) => {
  // Check if there's a timer associated with this task
  const hasActiveTimer = usePomodoroStore(state => {
    const timer = state.timer;
    return timer && timer.taskId === task?.id && timer.isRunning;
  });
  
  // Get actual button color based on timer status
  const actualColorScheme = hasActiveTimer ? 'red' : colorScheme;
  
  if (isCompact) {
    return (
      <Tooltip label={hasActiveTimer ? "View active timer" : "Start Pomodoro timer"} placement="top" hasArrow>
        <IconButton
          icon={
            <HStack spacing={0} position="relative">
              <Icon as={FaClock} />
              {hasActiveTimer && (
                <Badge
                  position="absolute"
                  top="-8px"
                  right="-8px"
                  colorScheme="red"
                  borderRadius="full"
                  fontSize="xs"
                  minW="16px"
                  minH="16px"
                  p={0}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  •
                </Badge>
              )}
            </HStack>
          }
          aria-label={hasActiveTimer ? "View active timer" : "Start Pomodoro timer"}
          size={size}
          colorScheme={actualColorScheme}
          variant={variant}
          onClick={onClick}
        />
      </Tooltip>
    );
  }

  return (
    <Button
      leftIcon={<Icon as={FaClock} />}
      onClick={onClick}
      size={size}
      colorScheme={actualColorScheme}
      variant={variant}
    >
      {hasActiveTimer ? "Active" : "Pomodoro"}
    </Button>
  );
};

export default PomodoroButton; 