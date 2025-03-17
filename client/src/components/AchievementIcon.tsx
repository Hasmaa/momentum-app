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
      d="M20.2,4H17.5V3C17.5,2.45 17.05,2 16.5,2H7.5C6.95,2 6.5,2.45 6.5,3V4H3.8C3.36,4 3,4.36 3,4.8V5.7C3,7.07 3.82,8.2 5,8.55V19.8C5,20.46 5.54,21 6.2,21H17.8C18.46,21 19,20.46 19,19.8V8.55C20.18,8.2 21,7.07 21,5.7V4.8C21,4.36 20.64,4 20.2,4M19,5.7C19,6.42 18.42,7 17.7,7H6.3C5.58,7 5,6.42 5,5.7V5.6H19V5.7Z"
    />
  </Icon>
);

// Custom SVG Crown Icon
export const CrownIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M5,16L3,5L8.5,12L12,5L15.5,12L21,5L19,16H5M19,19C19,19.55 18.55,20 18,20H6C5.45,20 5,19.55 5,19V18H19V19Z"
    />
  </Icon>
);

// Custom SVG Flame Icon
const FlameIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2Z"
    />
  </Icon>
);

// Custom SVG Fire Icon
const FireIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12,24A9,9 0 0,1 3,15C3,12.37 4.95,8.43 6.44,6.25C8.43,3.38 11,2 12,2C13,2 15.57,3.38 17.56,6.25C19.05,8.43 21,12.37 21,15A9,9 0 0,1 12,24M12,4.8C11.2,4.8 9.23,6.04 7.5,8.5C6.12,10.46 4.8,13.5 4.8,15A7.2,7.2 0 0,0 12,22.2A7.2,7.2 0 0,0 19.2,15C19.2,13.5 17.88,10.46 16.5,8.5C14.77,6.04 12.8,4.8 12,4.8Z"
    />
  </Icon>
);

// Custom SVG Balance Scale Icon
const BalanceScaleIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12,3C14.21,3 16,4.79 16,7H8C8,4.79 9.79,3 12,3M12,9C13.1,9 14,9.9 14,11H10C10,9.9 10.9,9 12,9M15,17H9V23H15V17M19,7C20.11,7 21,7.9 21,9V15C21,16.1 20.1,17 19,17H17V15H19V9H17V7H19M5,7H7V9H5V15H7V17H5C3.9,17 3,16.1 3,15V9C3,7.9 3.9,7 5,7Z"
    />
  </Icon>
);

// Custom SVG Calendar Check Icon
const CalendarCheckIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M19,19H5V8H19M19,3H18V1H16V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M16.53,11.06L15.47,10L10.59,14.88L8.47,12.76L7.41,13.82L10.59,17L16.53,11.06Z"
    />
  </Icon>
);

// Custom SVG Hand Paper Icon
const HandPaperIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M13,6V11H18V7.75L22.25,12L18,16.25V13H13V18H16.25L12,22.25L7.75,18H11V13H6V16.25L1.75,12L6,7.75V11H11V6H7.75L12,1.75L16.25,6H13Z"
    />
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
      d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"
    />
  </Icon>
);

// Custom SVG Medal Icon
export const MedalIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M20,2H4V4L9.81,8.36C6.14,9.57 4.14,13.53 5.35,17.2C6.56,20.87 10.5,22.87 14.19,21.66C17.86,20.45 19.86,16.5 18.65,12.82C17.95,10.71 16.3,9.05 14.19,8.36L20,4V2M14.94,19.5L12,17.78L9.06,19.5L9.84,16.17L7.25,13.93L10.66,13.64L12,10.5L13.34,13.64L16.75,13.93L14.16,16.17L14.94,19.5Z"
    />
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
    case 'medal':
      return MedalIcon;
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
    uncommon: useColorModeValue('teal.500', 'teal.400'),
    rare: useColorModeValue('blue.500', 'blue.400'),
    epic: useColorModeValue('purple.500', 'purple.400'),
    legendary: useColorModeValue('orange.500', 'orange.400'),
  }[rarity];
  
  const bgGradient = useColorModeValue(
    `linear(to-br, ${colorScheme}, ${colorScheme}80)`,
    `linear(to-br, ${colorScheme}, ${colorScheme}60)`
  );
  
  const IconComponent = getIcon(icon);
  
  return (
    <MotionBox
      position="relative"
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
        transition: { duration: 0.2 }
      }}
    >
      {/* Base icon container */}
      <Box
        position="relative"
        borderRadius="xl"
        p={3}
        bg={useColorModeValue('white', 'gray.800')}
        boxShadow={isUnlocked ? 'lg' : 'base'}
        transition="all 0.3s ease"
      >
        {/* Icon with gradient background for unlocked state */}
        <Box
          position="relative"
          borderRadius="lg"
          overflow="hidden"
          transform={isUnlocked ? 'none' : 'scale(0.95)'}
          transition="all 0.3s ease"
        >
          <Icon 
            as={IconComponent} 
            color={isUnlocked ? colorScheme : useColorModeValue('gray.300', 'gray.600')}
            boxSize={size}
            transition="all 0.3s ease"
            opacity={isUnlocked ? 1 : 0.5}
            filter={isUnlocked ? 'none' : 'grayscale(1)'}
          />
          
          {/* Gradient overlay for unlocked achievements */}
          {isUnlocked && (
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bgGradient={bgGradient}
              opacity={0.1}
              transition="opacity 0.3s ease"
              _groupHover={{ opacity: 0.2 }}
            />
          )}
        </Box>
      </Box>

      {/* Animated ring for unlocked achievements */}
      {isUnlocked && (
        <MotionBox
          position="absolute"
          top="-2px"
          left="-2px"
          right="-2px"
          bottom="-2px"
          borderRadius="xl"
          border="2px solid"
          borderColor={colorScheme}
          opacity={0.5}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      )}

      {/* Shine effect for unlocked achievements */}
      {isUnlocked && (
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          overflow="hidden"
          borderRadius="xl"
          pointerEvents="none"
        >
          <Box
            position="absolute"
            top="-50%"
            left="-50%"
            height="200%"
            width="50%"
            bgGradient={`linear(to-r, transparent, ${colorScheme}20, transparent)`}
            transform="rotate(25deg)"
            animation={isUnlocked ? "shine 3s infinite" : "none"}
            sx={{
              "@keyframes shine": {
                "0%": { left: "-50%" },
                "100%": { left: "150%" }
              }
            }}
          />
        </Box>
      )}
    </MotionBox>
  );
};

export default AchievementIcon; 