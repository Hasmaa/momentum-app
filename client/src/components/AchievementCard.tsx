import React from 'react';
import {
  Box,
  Text,
  Heading,
  useColorModeValue,
  VStack,
  HStack,
  Badge,
  Progress,
  Flex,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Achievement } from '../types';
import AchievementIcon from './AchievementIcon';

const MotionBox = motion(Box);

interface AchievementCardProps {
  achievement: Achievement;
  getProgressPercentage: (achievement: Achievement) => number;
  isRecent?: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  getProgressPercentage,
  isRecent = false,
}) => {
  const {
    name,
    description,
    icon,
    rarity,
    unlockedAt,
    category,
  } = achievement;

  const isUnlocked = !!unlockedAt;
  const progressPercentage = getProgressPercentage(achievement);

  // Color scheme based on rarity
  const rarityColors = {
    common: useColorModeValue('gray.500', 'gray.400'),
    uncommon: useColorModeValue('green.500', 'green.300'),
    rare: useColorModeValue('blue.500', 'blue.300'),
    epic: useColorModeValue('purple.500', 'purple.300'),
    legendary: useColorModeValue('orange.500', 'orange.300'),
  };

  const categoryColors = {
    completion: useColorModeValue('green.100', 'green.900'),
    productivity: useColorModeValue('blue.100', 'blue.900'),
    consistency: useColorModeValue('purple.100', 'purple.900'),
    explorer: useColorModeValue('orange.100', 'orange.900'),
  };

  const categoryTextColors = {
    completion: useColorModeValue('green.800', 'green.200'),
    productivity: useColorModeValue('blue.800', 'blue.200'),
    consistency: useColorModeValue('purple.800', 'purple.200'),
    explorer: useColorModeValue('orange.800', 'orange.200'),
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const progressBgColor = useColorModeValue('gray.100', 'gray.700');
  const progressTrackColor = rarityColors[rarity];
  const boxShadow = isRecent ? 
    `0 0 0 2px ${rarityColors[rarity]}, 0 4px 12px rgba(0, 0, 0, 0.1)` : 
    isUnlocked ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none';

  // Format rarity text
  const formatRarity = (rarity: string) => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  // Format category text
  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <MotionBox
      borderWidth="1px"
      borderColor={isUnlocked ? rarityColors[rarity] : borderColor}
      borderRadius="lg"
      overflow="hidden"
      bg={bgColor}
      p={5}
      boxShadow={boxShadow}
      opacity={isUnlocked ? 1 : 0.7}
      transition="all 0.3s ease"
      initial={isRecent ? { scale: 0.9, opacity: 0 } : {}}
      animate={isRecent ? { 
        scale: 1, 
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20
        }
      } : {}}
      whileHover={{ 
        y: -4,
        boxShadow: `0 10px 20px rgba(0, 0, 0, 0.1)${isUnlocked ? `, 0 0 0 2px ${rarityColors[rarity]}` : ''}` 
      }}
      height="100%"
      position="relative"
      display="flex"
      flexDirection="column"
    >
      {/* Badges */}
      <Flex justify="space-between" mb={4}>
        <Badge
          colorScheme={isUnlocked ? {
            common: 'gray',
            uncommon: 'green',
            rare: 'blue',
            epic: 'purple',
            legendary: 'orange'
          }[rarity] : 'gray'}
          borderRadius="full"
          px={2}
          py={0.5}
          opacity={isUnlocked ? 1 : 0.5}
        >
          {formatRarity(rarity)}
        </Badge>
        
        <Badge
          bg={categoryColors[category]}
          color={categoryTextColors[category]}
          borderRadius="full"
          px={2}
          py={0.5}
        >
          {formatCategory(category)}
        </Badge>
      </Flex>

      <HStack spacing={4} align="flex-start" mb={4}>
        <Box flexShrink={0}>
          <AchievementIcon 
            icon={icon} 
            isUnlocked={isUnlocked} 
            rarity={rarity} 
            isAnimated={isRecent}
            size="3rem"
          />
        </Box>
        
        <VStack align="flex-start" spacing={1} flex="1">
          <Heading size="md" color={isUnlocked ? rarityColors[rarity] : textColor}>
            {name}
          </Heading>
          <Text fontSize="sm" color={textColor} opacity={0.8} noOfLines={2}>
            {description}
          </Text>
        </VStack>
      </HStack>

      {/* Progress bar */}
      <Box mt="auto" pt={3}>
        <Progress 
          value={progressPercentage} 
          size="sm" 
          colorScheme={{
            common: 'gray',
            uncommon: 'green',
            rare: 'blue',
            epic: 'purple',
            legendary: 'orange'
          }[rarity]} 
          borderRadius="full"
          bg={progressBgColor}
          hasStripe={isUnlocked && progressPercentage < 100}
          isAnimated={isUnlocked && progressPercentage < 100}
        />
        <Flex justify="space-between" mt={1}>
          <Text fontSize="xs" color={textColor} opacity={0.7}>
            Progress
          </Text>
          <Text fontSize="xs" fontWeight="bold" color={isUnlocked ? rarityColors[rarity] : textColor}>
            {progressPercentage}%
          </Text>
        </Flex>
      </Box>

      {/* Unlocked date */}
      {isUnlocked && (
        <Text 
          fontSize="xs" 
          color={textColor} 
          opacity={0.7} 
          mt={2} 
          textAlign="right"
        >
          Unlocked: {new Date(unlockedAt).toLocaleDateString()}
        </Text>
      )}

      {/* NEW badge for recently unlocked achievements */}
      {isRecent && (
        <MotionBox
          position="absolute"
          top="-8px"
          right="-8px"
          animate={{
            rotate: [0, 10, 0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <Badge
            colorScheme="red"
            borderRadius="full"
            px={3}
            py={1}
            transform="rotate(20deg)"
            boxShadow="md"
          >
            NEW!
          </Badge>
        </MotionBox>
      )}
    </MotionBox>
  );
};

export default AchievementCard; 