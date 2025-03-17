import React from 'react';
import {
  IconButton,
  Box,
  useColorModeValue,
  Tooltip,
  Badge,
} from '@chakra-ui/react';
import { MedalIcon } from './AchievementIcon';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

interface AchievementsButtonProps {
  count: number;
  totalCount: number;
  hasRecentUnlock: boolean;
  onClick: () => void;
}

const AchievementsButton: React.FC<AchievementsButtonProps> = ({
  count,
  totalCount,
  hasRecentUnlock,
  onClick,
}) => {
  // Use a more subtle background that matches the app's theme
  const buttonBg = useColorModeValue('transparent', 'transparent');
  const buttonHoverBg = useColorModeValue('gray.100', 'whiteAlpha.100');
  const iconColor = useColorModeValue('blue.500', 'blue.300');
  const pulseBg = useColorModeValue('blue.400', 'blue.300');
  
  return (
    <Tooltip 
      label={`Achievements: ${count}/${totalCount}`} 
      placement="bottom"
      hasArrow
    >
      <Box position="relative">
        <IconButton
          aria-label="Achievements"
          icon={<MedalIcon boxSize="1.2rem" />}
          borderRadius="full"
          bg={buttonBg}
          color={iconColor}
          _hover={{ bg: buttonHoverBg }}
          onClick={onClick}
          size="sm"
          variant="ghost"
          colorScheme="yellow"
        />
        
        {/* Count badge */}
        <Badge
          position="absolute"
          top="-2px"
          right="-2px"
          borderRadius="full"
          bg="blue.500"
          color="white"
          fontSize="xs"
          boxSize="18px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontWeight="bold"
          zIndex={1}
          boxShadow="0 0 0 2px var(--chakra-colors-white)"
        >
          {count}
        </Badge>
        
        {/* Pulse animation for new achievements */}
        {hasRecentUnlock && (
          <MotionBox
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            borderRadius="full"
            bg={pulseBg}
            opacity={0}
            animate={{
              scale: [1, 1.5, 1.8],
              opacity: [0.7, 0.3, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 1,
            }}
            pointerEvents="none"
            zIndex={-1}
          />
        )}
      </Box>
    </Tooltip>
  );
};

export default AchievementsButton; 