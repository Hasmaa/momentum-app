import React from 'react';
import { Button, Tooltip, Icon, IconButton } from '@chakra-ui/react';
import { FaClock } from 'react-icons/fa';
import { PomodoroButtonProps } from '../types/pomodoro';

const PomodoroButton: React.FC<PomodoroButtonProps> = ({
  onClick,
  task,
  size = 'md',
  colorScheme = 'purple',
  variant = 'ghost',
  isCompact = false
}) => {
  if (isCompact) {
    return (
      <Tooltip label="Start Pomodoro timer" placement="top" hasArrow>
        <IconButton
          icon={<Icon as={FaClock} />}
          aria-label="Start Pomodoro timer"
          size={size}
          colorScheme={colorScheme}
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
      colorScheme={colorScheme}
      variant={variant}
    >
      Pomodoro
    </Button>
  );
};

export default PomodoroButton; 