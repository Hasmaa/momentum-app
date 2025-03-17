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
  Icon,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Achievement } from '../types';
import AchievementIcon from './AchievementIcon';
import { FiLock } from 'react-icons/fi';

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

  // Enhanced color scheme with more vibrant colors for unlocked achievements
  const rarityColors = {
    common: {
      bg: useColorModeValue('gray.50', 'gray.800'),
      border: useColorModeValue('gray.200', 'gray.600'),
      text: useColorModeValue('gray.700', 'gray.300'),
      accent: useColorModeValue('gray.500', 'gray.400'),
    },
    uncommon: {
      bg: useColorModeValue('teal.50', 'teal.900'),
      border: useColorModeValue('teal.200', 'teal.700'),
      text: useColorModeValue('teal.800', 'teal.200'),
      accent: useColorModeValue('teal.500', 'teal.400'),
    },
    rare: {
      bg: useColorModeValue('blue.50', 'blue.900'),
      border: useColorModeValue('blue.200', 'blue.700'),
      text: useColorModeValue('blue.800', 'blue.200'),
      accent: useColorModeValue('blue.500', 'blue.400'),
    },
    epic: {
      bg: useColorModeValue('purple.50', 'purple.900'),
      border: useColorModeValue('purple.200', 'purple.700'),
      text: useColorModeValue('purple.800', 'purple.200'),
      accent: useColorModeValue('purple.500', 'purple.400'),
    },
    legendary: {
      bg: useColorModeValue('orange.50', 'orange.900'),
      border: useColorModeValue('orange.200', 'orange.700'),
      text: useColorModeValue('orange.800', 'orange.200'),
      accent: useColorModeValue('orange.500', 'orange.400'),
    },
  };

  const categoryColors = {
    completion: useColorModeValue('green.100', 'green.900'),
    productivity: useColorModeValue('blue.100', 'blue.900'),
    consistency: useColorModeValue('purple.100', 'purple.900'),
    explorer: useColorModeValue('orange.100', 'orange.900'),
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  
  const cardVariants = {
    initial: { scale: 0.98, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    },
    hover: {
      y: -4,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

  return (
    <MotionBox
      initial={isRecent ? "initial" : false}
      animate="animate"
      whileHover="hover"
      variants={cardVariants}
      borderWidth="1px"
      borderColor={isUnlocked ? rarityColors[rarity].border : 'transparent'}
      borderRadius="xl"
      overflow="hidden"
      bg={isUnlocked ? rarityColors[rarity].bg : bgColor}
      p={6}
      position="relative"
      height="100%"
      display="flex"
      flexDirection="column"
      role="group"
      transition="all 0.2s ease"
      _hover={{
        borderColor: rarityColors[rarity].border,
        boxShadow: isUnlocked ? 'lg' : 'md',
        transform: 'translateY(-2px)',
      }}
    >
      {/* Locked Overlay */}
      {!isUnlocked && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg={useColorModeValue('whiteAlpha.75', 'blackAlpha.75')}
          backdropFilter="blur(2px)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1}
          transition="opacity 0.2s"
          _groupHover={{ opacity: 0.9 }}
        >
          <Icon as={FiLock} boxSize={8} color={mutedTextColor} />
        </Box>
      )}

      {/* Header with badges */}
      <Flex justify="space-between" mb={4} align="center">
        <Badge
          colorScheme={isUnlocked ? {
            common: 'gray',
            uncommon: 'teal',
            rare: 'blue',
            epic: 'purple',
            legendary: 'orange'
          }[rarity] : 'gray'}
          px={3}
          py={1}
          borderRadius="lg"
          textTransform="uppercase"
          fontSize="xs"
          fontWeight="bold"
          letterSpacing="0.5px"
          bg={useColorModeValue(`${rarityColors[rarity].accent}20`, `${rarityColors[rarity].accent}30`)}
          color={isUnlocked ? rarityColors[rarity].text : textColor}
        >
          {rarity}
        </Badge>
        
        <Badge
          px={3}
          py={1}
          borderRadius="lg"
          bg={categoryColors[category]}
          color={textColor}
          fontSize="xs"
          fontWeight="medium"
          letterSpacing="0.5px"
        >
          {category}
        </Badge>
      </Flex>

      {/* Content */}
      <HStack spacing={4} align="flex-start" mb={4} flex="1">
        <Box 
          flexShrink={0}
          position="relative"
          transition="transform 0.2s"
          _groupHover={{ transform: 'scale(1.1) rotate(3deg)' }}
        >
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
            size="md" 
            color={isUnlocked ? rarityColors[rarity].text : textColor}
            fontWeight="bold"
            letterSpacing="tight"
            lineHeight="1.2"
          >
            {name}
          </Heading>
          <Text 
            fontSize="sm" 
            color={mutedTextColor}
            lineHeight="1.5"
            noOfLines={2}
          >
            {description}
          </Text>
        </VStack>
      </HStack>

      {/* Progress section */}
      <Box mt="auto">
        <Progress 
          value={progressPercentage} 
          size="sm" 
          colorScheme={{
            common: 'gray',
            uncommon: 'teal',
            rare: 'blue',
            epic: 'purple',
            legendary: 'orange'
          }[rarity]} 
          borderRadius="full"
          bg={useColorModeValue('gray.100', 'whiteAlpha.100')}
          hasStripe={isUnlocked && progressPercentage < 100}
          isAnimated={isUnlocked && progressPercentage < 100}
          height="6px"
        />
        <Flex justify="space-between" mt={2} align="center">
          <Text 
            fontSize="sm" 
            color={mutedTextColor}
            fontWeight="medium"
          >
            Progress
          </Text>
          <Text 
            fontSize="md" 
            fontWeight="bold" 
            color={isUnlocked ? rarityColors[rarity].accent : mutedTextColor}
          >
            {progressPercentage}%
          </Text>
        </Flex>
      </Box>

      {/* Unlock date */}
      {isUnlocked && (
        <Text 
          fontSize="xs" 
          color={mutedTextColor}
          mt={3} 
          textAlign="right"
          fontStyle="italic"
        >
          Unlocked {new Date(unlockedAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </Text>
      )}

      {/* NEW badge */}
      {isRecent && (
        <MotionBox
          position="absolute"
          top={-2}
          right={-2}
          animate={{
            rotate: [0, 10, 0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Badge
            colorScheme="red"
            variant="solid"
            borderRadius="lg"
            px={2}
            py={1}
            transform="rotate(15deg)"
            fontSize="xs"
            fontWeight="bold"
            boxShadow="md"
            letterSpacing="wider"
          >
            NEW!
          </Badge>
        </MotionBox>
      )}
    </MotionBox>
  );
};

export default AchievementCard; 