import React, { useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
  useColorModeValue,
  Slide,
  Button,
  HStack,
  VStack,
  useToken,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { motion } from 'framer-motion';
import { Achievement } from '../types';
import AchievementIcon from './AchievementIcon';
import confetti from 'canvas-confetti';

const MotionBox = motion(Box);

// Define a shimmer animation
const shimmer = keyframes`
  0% { background-position: -40rem 0 }
  100% { background-position: 40rem 0 }
`;

interface AchievementPopupProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const AchievementPopup: React.FC<AchievementPopupProps> = ({
  achievement,
  onClose,
}) => {
  const [blue500] = useToken('colors', ['blue.500']);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Background and text colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const shimmerColor = useColorModeValue(
    'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)',
    'linear-gradient(90deg, rgba(26,32,44,0) 0%, rgba(66,82,114,0.4) 50%, rgba(26,32,44,0) 100%)'
  );
  
  // Launch confetti when achievement is shown
  useEffect(() => {
    if (achievement) {
      // Define colors based on achievement rarity
      const colors = {
        common: ['#cccccc', '#999999'],
        uncommon: ['#70c97f', '#2da53c'],
        rare: ['#63b3ed', '#3182ce'],
        epic: ['#b794f4', '#805ad5'],
        legendary: ['#fbd38d', '#ed8936'],
      }[achievement.rarity] || ['#63b3ed', '#3182ce'];
      
      // Configure and launch confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
        colors,
        startVelocity: 30,
        gravity: 0.5,
        ticks: 200,
        shapes: ['circle', 'square'],
      });
      
      // Try to play achievement sound if available
      try {
        const audio = new Audio('/achievement_sound.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => {
          console.log('Audio play error (sound file may not exist):', e);
        });
      } catch (e) {
        console.log('Audio creation error:', e);
      }
      
      // Auto-close after 6 seconds
      timeoutRef.current = setTimeout(() => {
        onClose();
      }, 6000);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [achievement, onClose]);
  
  if (!achievement) return null;
  
  return (
    <Slide
      direction="bottom"
      in={!!achievement}
      style={{ zIndex: 10 }}
    >
      <Box
        position="fixed"
        bottom="30px"
        right="30px"
        width="380px"
        maxWidth="calc(100vw - 60px)"
      >
        <MotionBox
          bg={bgColor}
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.15)"
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          p={5}
          position="relative"
          overflow="hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 25
            }
          }}
          whileHover={{ scale: 1.02 }}
        >
          {/* Achievement unlocked header */}
          <Heading 
            size="md" 
            mb={4} 
            textAlign="center"
            color={useColorModeValue('blue.600', 'blue.300')}
            position="relative"
            _after={{
              content: '""',
              position: 'absolute',
              bottom: '-10px',
              left: '50%',
              width: '40px',
              height: '3px',
              bg: 'blue.400',
              transform: 'translateX(-50%)',
              borderRadius: 'full'
            }}
          >
            Achievement Unlocked!
          </Heading>
          
          <HStack spacing={5} align="center" mb={4}>
            <AchievementIcon 
              icon={achievement.icon} 
              rarity={achievement.rarity} 
              isUnlocked={true} 
              isAnimated={true}
              size="3rem"
            />
            
            <VStack align="start" spacing={0}>
              <Text 
                fontWeight="bold" 
                fontSize="lg" 
                color={textColor}
              >
                {achievement.name}
              </Text>
              <Text 
                fontSize="sm" 
                color={textColor} 
                opacity={0.8}
              >
                {achievement.description}
              </Text>
            </VStack>
          </HStack>
          
          {/* Animated particles */}
          <MotionBox
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            pointerEvents="none"
            overflow="hidden"
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <MotionBox
                key={i}
                position="absolute"
                height={`${Math.random() * 6 + 2}px`}
                width={`${Math.random() * 6 + 2}px`}
                borderRadius="full"
                bg={blue500}
                top={`${Math.random() * 100}%`}
                left={`${Math.random() * 100}%`}
                opacity={Math.random() * 0.5 + 0.3}
                animate={{
                  y: [0, -Math.random() * 20 - 10],
                  x: [0, (Math.random() - 0.5) * 20],
                  opacity: [0.7, 0],
                }}
                transition={{
                  duration: Math.random() * 1.5 + 1,
                  repeat: Infinity,
                  repeatType: "loop",
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </MotionBox>
          
          <Button 
            colorScheme="blue" 
            variant="outline" 
            size="sm" 
            onClick={onClose}
            width="full"
            borderRadius="full"
            mt={2}
            position="relative"
            overflow="hidden"
            _after={{
              content: '""',
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              backgroundImage: shimmerColor,
              backgroundSize: '40rem 100%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: '-40rem 0',
              animation: `${shimmer} 3s infinite linear`,
            }}
          >
            Awesome!
          </Button>
          
          {/* Glow effect */}
          <MotionBox
            position="absolute"
            top="-10%"
            left="-10%"
            right="-10%"
            bottom="-10%"
            background={`radial-gradient(circle, ${blue500}10 0%, transparent 70%)`}
            opacity={0.5}
            pointerEvents="none"
            zIndex={-1}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </MotionBox>
      </Box>
    </Slide>
  );
};

export default AchievementPopup; 