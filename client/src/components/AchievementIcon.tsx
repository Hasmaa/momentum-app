import React from 'react';
import { Box, Icon, useColorModeValue } from '@chakra-ui/react';
import { 
  StarIcon, 
  CheckCircleIcon, 
  SunIcon, 
  CalendarIcon,
  TimeIcon,
  CopyIcon,
  WarningIcon,
  RepeatIcon,
  SettingsIcon,
  CheckIcon
} from '@chakra-ui/icons';
import { motion } from 'framer-motion';
import { Achievement, AchievementRarity } from '../types';

const MotionBox = motion(Box);

interface AchievementIconProps {
  icon: string;
  rarity?: AchievementRarity;
  isUnlocked?: boolean;
  size?: string | number;
  isAnimated?: boolean;
}

// Custom SVG Trophy Icon
export const TrophyIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M18,5H6A1,1 0 0,0 5,6A1,1 0 0,0 6,7H18A1,1 0 0,0 19,6A1,1 0 0,0 18,5M12,7V14.5L9.5,11.7L8.1,12L12,16.5L16,12L14.6,11.7L12,14.5V7"/>
  </Icon>
);

// Custom SVG Crown Icon
export const CrownIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12,2L15.09,8.09L22,9.9L17,14.5L18.18,21.18L12,18.09L5.82,21.18L7,14.5L2,9.9L8.91,8.09L12,2M12,6L10.5,9L7,9.87L9.5,12.13L8.97,15.5L12,13.89L15.03,15.5L14.5,12.13L17,9.87L13.5,9L12,6Z"/>
  </Icon>
);

// Custom SVG Flame Icon
const FlameIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
  </Icon>
);

// Custom SVG Fire Icon
const FireIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2M14.5 17.5C14.22 17.74 13.76 18 13.4 18.1C12.28 18.5 11.16 17.94 10.5 17.28C11.69 17 12.4 16.12 12.61 15.23C12.78 14.43 12.46 13.77 12.33 13C12.21 12.26 12.23 11.63 12.5 10.94C12.69 11.32 12.89 11.7 13.13 12C13.9 13 15.11 13.44 15.37 14.8C15.41 14.94 15.43 15.08 15.43 15.23C15.46 16.05 15.1 16.95 14.5 17.5H14.5Z"/>
  </Icon>
);

// Custom SVG Balance Scale Icon
const BalanceScaleIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12,3C14.21,3 16,4.79 16,7C16,7.73 15.81,8.41 15.46,9H18C18.95,9 19.75,9.67 19.95,10.56C21.96,18.57 22,18.78 22,19C22,20.1 21.1,21 20,21H4C2.9,21 2,20.1 2,19C2,18.78 2.04,18.57 4.05,10.56C4.25,9.67 5.05,9 6,9H8.54C8.19,8.41 8,7.73 8,7C8,4.79 9.79,3 12,3M12,5C10.9,5 10,5.9 10,7C10,8.1 10.9,9 12,9C13.1,9 14,8.1 14,7C14,5.9 13.1,5 12,5M6,11C5.78,11 5.59,11.5 5.05,13.2L4.05,16.2C3.5,17.91 3.5,17.97 3.5,18H20.5C20.5,17.97 20.5,17.91 19.95,16.2L18.95,13.2C18.41,11.5 18.22,11 18,11H6Z"/>
  </Icon>
);

// Custom SVG Calendar Check Icon
const CalendarCheckIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M19,19H5V8H19M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M16.53,11.06L15.47,10L10.59,14.88L8.47,12.76L7.41,13.82L10.59,17L16.53,11.06Z"/>
  </Icon>
);

// Custom SVG Hand Paper Icon
const HandPaperIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M13,6V11H18V7.75L22.25,12L18,16.25V13H13V18H16.25L12,22.25L7.75,18H11V13H6V16.25L1.75,12L6,7.75V11H11V6H7.75L12,1.75L16.25,6H13Z"/>
  </Icon>
);

// Custom SVG Layer Group Icon
const LayerGroupIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,10.5A1.5,1.5 0 0,0 10.5,12A1.5,1.5 0 0,0 12,13.5A1.5,1.5 0 0,0 13.5,12A1.5,1.5 0 0,0 12,10.5M7.5,10.5A1.5,1.5 0 0,0 6,12A1.5,1.5 0 0,0 7.5,13.5A1.5,1.5 0 0,0 9,12A1.5,1.5 0 0,0 7.5,10.5M16.5,10.5A1.5,1.5 0 0,0 15,12A1.5,1.5 0 0,0 16.5,13.5A1.5,1.5 0 0,0 18,12A1.5,1.5 0 0,0 16.5,10.5Z"/>
  </Icon>
);

// Custom SVG Award Icon
const AwardIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M20,12V4H4V12H20M21,3A1,1 0 0,1 22,4V12A1,1 0 0,1 21,13H17V20H15V13H9V20H7V13H3A1,1 0 0,1 2,12V4A1,1 0 0,1 3,3H21M5,5H7V7H5V5M5,9H7V11H5V9M9,5H11V7H9V5M9,9H11V11H9V9M13,5H15V7H13V5M13,9H15V11H13V9Z"/>
  </Icon>
);

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'star':
      return StarIcon;
    case 'check-circle':
      return CheckCircleIcon;
    case 'trophy':
      return TrophyIcon;
    case 'crown':
      return CrownIcon;
    case 'flame':
      return FlameIcon;
    case 'balance-scale':
      return BalanceScaleIcon;
    case 'calendar-check':
      return CalendarCheckIcon;
    case 'fire':
      return FireIcon;
    case 'sun':
      return SunIcon;
    case 'hand-paper':
      return HandPaperIcon;
    case 'copy':
      return CopyIcon;
    case 'layer-group':
      return LayerGroupIcon;
    case 'award':
      return AwardIcon;
    default:
      return StarIcon;
  }
};

const AchievementIcon: React.FC<AchievementIconProps> = ({
  icon,
  rarity = 'common',
  isUnlocked = false,
  size = '2.5rem',
  isAnimated = false
}) => {
  // Define colors based on rarity and unlock status
  const colorScheme = {
    common: useColorModeValue('gray.500', 'gray.400'),
    uncommon: useColorModeValue('green.500', 'green.400'),
    rare: useColorModeValue('blue.500', 'blue.400'),
    epic: useColorModeValue('purple.500', 'purple.400'),
    legendary: useColorModeValue('orange.500', 'orange.400'),
  }[rarity];
  
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const lockedColor = useColorModeValue('gray.300', 'gray.600');
  const glow = useColorModeValue(`0 0 15px ${colorScheme}`, `0 0 20px ${colorScheme}`);
  
  const IconComponent = getIcon(icon);
  
  return (
    <MotionBox
      position="relative"
      borderRadius="full"
      p={3}
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={bgColor}
      boxShadow={isUnlocked ? glow : 'none'}
      transition="all 0.3s ease"
      initial={isAnimated ? { scale: 0, rotate: -180 } : {}}
      animate={isAnimated ? { 
        scale: 1,
        rotate: 0,
        transition: {
          type: "spring",
          stiffness: 260,
          damping: 20
        }
      } : {}}
      whileHover={{ 
        scale: 1.1, 
        boxShadow: isUnlocked ? glow : 'none'
      }}
    >
      <Icon 
        as={IconComponent} 
        color={isUnlocked ? colorScheme : lockedColor}
        boxSize={size}
        opacity={isUnlocked ? 1 : 0.7}
      />
      
      {/* Animated outer ring for unlocked achievements */}
      {isUnlocked && (
        <MotionBox
          position="absolute"
          top="-8px"
          right="-8px"
          bottom="-8px"
          left="-8px"
          borderRadius="full"
          border="2px solid"
          borderColor={colorScheme}
          opacity={0.8}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      )}
    </MotionBox>
  );
};

export default AchievementIcon; 