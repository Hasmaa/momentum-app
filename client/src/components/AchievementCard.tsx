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
  useTheme,
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
  
  const theme = useTheme();
  const isUnlocked = !!unlockedAt;
  const progressPercentage = getProgressPercentage(achievement);

  // Refined color scheme based on rarity - more subdued for enterprise look
  const rarityColors = {
    common: useColorModeValue('gray.600', 'gray.400'),
    uncommon: useColorModeValue('teal.600', 'teal.400'),
    rare: useColorModeValue('blue.600', 'blue.400'),
    epic: useColorModeValue('purple.600', 'purple.400'),
    legendary: useColorModeValue('orange.600', 'orange.400'),
  };

  // More subtle category colors for enterprise look
  const categoryColors = {
    completion: useColorModeValue('green.50', 'green.900'),
    productivity: useColorModeValue('blue.50', 'blue.900'),
    consistency: useColorModeValue('purple.50', 'purple.900'),
    explorer: useColorModeValue('orange.50', 'orange.900'),
  };

  const categoryTextColors = {
    completion: useColorModeValue('green.700', 'green.200'),
    productivity: useColorModeValue('blue.700', 'blue.200'),
    consistency: useColorModeValue('purple.700', 'purple.200'),
    explorer: useColorModeValue('orange.700', 'orange.200'),
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const progressBgColor = useColorModeValue('gray.100', 'gray.700');
  
  // More subtle box shadow for a refined look
  const boxShadow = isRecent ? 
    `0 0 0 1px ${rarityColors[rarity]}, 0 4px 8px rgba(0, 0, 0, 0.08)` : 
    isUnlocked ? '0 2px 4px rgba(0, 0, 0, 0.06)' : 'none';

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
      borderRadius="md"
      overflow="hidden"
      bg={bgColor}
      p={4}
      boxShadow={boxShadow}
      opacity={isUnlocked ? 1 : 0.85}
      transition="all 0.2s ease"
      initial={isRecent ? { scale: 0.98, opacity: 0 } : {}}
      animate={isRecent ? { 
        scale: 1, 
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 25
        }
      } : {}}
      whileHover={{ 
        y: -2,
        boxShadow: `0 6px 12px rgba(0, 0, 0, 0.06)${isUnlocked ? `, 0 0 0 1px ${rarityColors[rarity]}` : ''}` 
      }}
      height="100%"
      position="relative"
      display="flex"
      flexDirection="column"
    >
      {/* Header section with badges */}
      <Flex justify="space-between" mb={3} align="center">
        <Badge
          colorScheme={isUnlocked ? {
            common: 'gray',
            uncommon: 'teal',
            rare: 'blue',
            epic: 'purple',
            legendary: 'orange'
          }[rarity] : 'gray'}
          borderRadius="sm"
          px={2}
          py={0.5}
          opacity={isUnlocked ? 1 : 0.7}
          fontSize="xs"
          fontWeight="medium"
          textTransform="uppercase"
          letterSpacing="0.5px"
        >
          {formatRarity(rarity)}
        </Badge>
        
        <Badge
          bg={categoryColors[category]}
          color={categoryTextColors[category]}
          borderRadius="sm"
          px={2}
          py={0.5}
          fontSize="xs"
          fontWeight="medium"
          textTransform="uppercase"
          letterSpacing="0.5px"
        >
          {formatCategory(category)}
        </Badge>
      </Flex>

      {/* Content section */}
      <HStack spacing={4} align="flex-start" mb={3}>
        <Box flexShrink={0} pt={1}>
          <AchievementIcon 
            icon={icon} 
            isUnlocked={isUnlocked} 
            rarity={rarity} 
            isAnimated={isRecent}
            size="2.5rem"
          />
        </Box>
        
        <VStack align="flex-start" spacing={1} flex="1">
          <Heading 
            size="sm" 
            color={isUnlocked ? rarityColors[rarity] : textColor}
            fontWeight="600"
            letterSpacing="-0.2px"
            lineHeight="1.3"
          >
            {name}
          </Heading>
          <Text 
            fontSize="xs" 
            color={textColor} 
            opacity={0.85} 
            noOfLines={2}
            lineHeight="1.4"
            fontWeight="normal"
          >
            {description}
          </Text>
        </VStack>
      </HStack>

      {/* Progress section */}
      <Box mt="auto" pt={2}>
        <Progress 
          value={progressPercentage} 
          size="xs" 
          colorScheme={{
            common: 'gray',
            uncommon: 'teal',
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
          <Text 
            fontSize="xs" 
            color={textColor} 
            opacity={0.7}
            fontWeight="normal"
          >
            Progress
          </Text>
          <Text 
            fontSize="xs" 
            fontWeight="medium" 
            color={isUnlocked ? rarityColors[rarity] : textColor}
          >
            {progressPercentage}%
          </Text>
        </Flex>
      </Box>

      {/* Unlocked date - more subtle and professional */}
      {isUnlocked && (
        <Text 
          fontSize="2xs" 
          color={textColor} 
          opacity={0.6} 
          mt={2} 
          textAlign="right"
          fontStyle="italic"
          letterSpacing="0.1px"
        >
          Unlocked: {new Date(unlockedAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </Text>
      )}

      {/* More subtle NEW indicator for recently unlocked achievements */}
      {isRecent && (
        <MotionBox
          position="absolute"
          top="-6px"
          right="-6px"
          animate={{
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          <Badge
            colorScheme="red"
            variant="solid"
            borderRadius="sm"
            px={2}
            py={0.5}
            transform="rotate(15deg)"
            boxShadow="sm"
            fontSize="2xs"
            letterSpacing="0.5px"
            fontWeight="bold"
          >
            NEW
          </Badge>
        </MotionBox>
      )}
    </MotionBox>
  );
};

export default AchievementCard; 