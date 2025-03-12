import React, { useState, useMemo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  SimpleGrid,
  Text,
  useColorModeValue,
  Box,
  Heading,
  Flex,
  Badge,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  Progress,
  Divider,
  InputGroup,
  InputLeftElement,
  Input,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useBreakpointValue,
  IconButton,
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement, AchievementCategory } from '../types';
import AchievementCard from './AchievementCard';

const MotionBox = motion(Box);

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  recentlyUnlocked: Achievement | null;
  getProgressPercentage: (achievement: Achievement) => number;
}

const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
  recentlyUnlocked,
  getProgressPercentage,
}) => {
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'progress' | 'name' | 'rarity'>('default');
  const [showUnlocked, setShowUnlocked] = useState<boolean | null>(null); // null = show all
  
  const columns = useBreakpointValue({ base: 1, md: 2, lg: 3 }) || 1;

  // Filter and sort achievements
  const filteredAchievements = useMemo(() => {
    return achievements
      .filter(achievement => {
        // Filter by category
        if (activeCategory !== 'all' && achievement.category !== activeCategory) {
          return false;
        }
        
        // Filter by unlock status
        if (showUnlocked === true && !achievement.unlockedAt) {
          return false;
        }
        if (showUnlocked === false && achievement.unlockedAt) {
          return false;
        }
        
        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            achievement.name.toLowerCase().includes(query) ||
            achievement.description.toLowerCase().includes(query) ||
            achievement.category.toLowerCase().includes(query) ||
            achievement.rarity.toLowerCase().includes(query)
          );
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort by selected criteria
        switch (sortBy) {
          case 'progress':
            return getProgressPercentage(b) - getProgressPercentage(a);
          case 'name':
            return a.name.localeCompare(b.name);
          case 'rarity': {
            const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
            return rarityOrder[a.rarity] - rarityOrder[b.rarity];
          }
          default:
            // Sort by unlocked first, then by most recent
            if (a.unlockedAt && !b.unlockedAt) return -1;
            if (!a.unlockedAt && b.unlockedAt) return 1;
            if (a.unlockedAt && b.unlockedAt) {
              return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
            }
            return getProgressPercentage(b) - getProgressPercentage(a);
        }
      });
  }, [achievements, activeCategory, searchQuery, sortBy, showUnlocked, getProgressPercentage]);

  // Calculate statistics
  const totalAchievements = achievements.length;
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const completionPercentage = Math.round((unlockedCount / totalAchievements) * 100);

  // Calculate the most recent achievement
  const mostRecentAchievement = useMemo(() => {
    return achievements.reduce((most, current) => {
      if (!current.unlockedAt) return most;
      if (!most?.unlockedAt) return current;
      return new Date(current.unlockedAt) > new Date(most.unlockedAt) ? current : most;
    }, null as Achievement | null);
  }, [achievements]);

  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const statsBgColor = useColorModeValue('blue.50', 'blue.900');
  const headerColor = useColorModeValue('blue.600', 'blue.200');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const progressTrackColor = useColorModeValue('blue.500', 'blue.300');
  const emptyStateColor = useColorModeValue('gray.300', 'gray.600');

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="6xl" 
      scrollBehavior="inside"
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent 
        bg={bgColor}
        boxShadow="xl"
        borderRadius="xl"
        overflow="hidden"
      >
        <ModalHeader 
          bg={useColorModeValue('blue.50', 'blue.900')}
          borderBottomWidth="1px"
          borderColor={borderColor}
          py={4}
        >
          <Flex justify="space-between" align="center" width="full">
            <Heading size="lg" color={headerColor}>Achievements</Heading>
            <HStack spacing={4}>
              <Badge 
                colorScheme="blue" 
                fontSize="md" 
                py={1} 
                px={3} 
                borderRadius="full"
              >
                {unlockedCount}/{totalAchievements}
              </Badge>
              <ModalCloseButton position="static" />
            </HStack>
          </Flex>
        </ModalHeader>

        <ModalBody p={0}>
          <Box p={6} bg={statsBgColor}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {/* Overall progress */}
              <Box>
                <Text fontWeight="bold" mb={2}>Overall Progress</Text>
                <Progress 
                  value={completionPercentage} 
                  size="lg" 
                  colorScheme="blue" 
                  borderRadius="md"
                  mb={2}
                  hasStripe
                  isAnimated
                />
                <HStack justify="space-between">
                  <Text fontSize="sm">{unlockedCount} Unlocked</Text>
                  <Text fontWeight="bold" fontSize="sm">{completionPercentage}%</Text>
                </HStack>
              </Box>
              
              {/* Most recent achievement */}
              <Box>
                <Text fontWeight="bold" mb={2}>Latest Achievement</Text>
                {mostRecentAchievement ? (
                  <HStack spacing={3}>
                    <Box boxSize="50px">
                      <AchievementCard 
                        achievement={mostRecentAchievement}
                        getProgressPercentage={getProgressPercentage}
                        isRecent={mostRecentAchievement.id === recentlyUnlocked?.id}
                      />
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold">{mostRecentAchievement.name}</Text>
                      <Text fontSize="sm">{new Date(mostRecentAchievement.unlockedAt!).toLocaleDateString()}</Text>
                    </VStack>
                  </HStack>
                ) : (
                  <Text fontSize="sm" fontStyle="italic">No achievements unlocked yet</Text>
                )}
              </Box>
            </SimpleGrid>
          </Box>
          
          <Box p={6}>
            {/* Filters and search */}
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              justify="space-between" 
              align={{ base: 'flex-start', md: 'center' }} 
              mb={6} 
              gap={4}
            >
              <InputGroup maxW={{ base: '100%', md: '300px' }}>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input 
                  placeholder="Search achievements..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  borderRadius="full"
                />
                {searchQuery && (
                  <Box position="absolute" right="8px" top="50%" transform="translateY(-50%)">
                    <IconButton
                      icon={<SmallCloseIcon />}
                      size="sm"
                      aria-label="Clear search"
                      variant="ghost"
                      onClick={() => setSearchQuery('')}
                    />
                  </Box>
                )}
              </InputGroup>

              <HStack spacing={3}>
                <Menu closeOnSelect={true}>
                  <MenuButton 
                    as={Button} 
                    rightIcon={<ChevronDownIcon />}
                    variant="outline"
                    borderRadius="full"
                    size="md"
                  >
                    {showUnlocked === null ? 'All Achievements' : 
                      showUnlocked ? 'Unlocked' : 'Locked'}
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => setShowUnlocked(null)}>All Achievements</MenuItem>
                    <MenuItem onClick={() => setShowUnlocked(true)}>Unlocked</MenuItem>
                    <MenuItem onClick={() => setShowUnlocked(false)}>Locked</MenuItem>
                  </MenuList>
                </Menu>

                <Menu closeOnSelect={true}>
                  <MenuButton 
                    as={Button} 
                    rightIcon={<ChevronDownIcon />}
                    variant="outline"
                    borderRadius="full"
                    size="md"
                  >
                    Sort: {sortBy === 'default' ? 'Default' : 
                           sortBy === 'progress' ? 'Progress' : 
                           sortBy === 'name' ? 'Name' : 'Rarity'}
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => setSortBy('default')}>Default</MenuItem>
                    <MenuItem onClick={() => setSortBy('progress')}>Progress</MenuItem>
                    <MenuItem onClick={() => setSortBy('name')}>Name</MenuItem>
                    <MenuItem onClick={() => setSortBy('rarity')}>Rarity</MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </Flex>

            {/* Categories tabs */}
            <Tabs colorScheme="blue" mb={6}>
              <TabList overflow="auto" css={{
                scrollbarWidth: 'thin',
                '&::-webkit-scrollbar': {
                  height: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: useColorModeValue('rgba(0, 0, 0, 0.2)', 'rgba(255, 255, 255, 0.2)'),
                  borderRadius: '3px',
                },
              }}>
                <Tab 
                  onClick={() => setActiveCategory('all')}
                  fontWeight={activeCategory === 'all' ? 'bold' : 'normal'}
                >
                  All
                </Tab>
                <Tab 
                  onClick={() => setActiveCategory('completion')}
                  fontWeight={activeCategory === 'completion' ? 'bold' : 'normal'}
                >
                  Completion
                </Tab>
                <Tab 
                  onClick={() => setActiveCategory('productivity')}
                  fontWeight={activeCategory === 'productivity' ? 'bold' : 'normal'}
                >
                  Productivity
                </Tab>
                <Tab 
                  onClick={() => setActiveCategory('consistency')}
                  fontWeight={activeCategory === 'consistency' ? 'bold' : 'normal'}
                >
                  Consistency
                </Tab>
                <Tab 
                  onClick={() => setActiveCategory('explorer')}
                  fontWeight={activeCategory === 'explorer' ? 'bold' : 'normal'}
                >
                  Explorer
                </Tab>
              </TabList>
              
              <TabPanels>
                <TabPanel p={0} pt={4}>
                  {filteredAchievements.length > 0 ? (
                    <SimpleGrid columns={columns} spacing={6}>
                      <AnimatePresence>
                        {filteredAchievements.map((achievement) => (
                          <MotionBox
                            key={achievement.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                          >
                            <AchievementCard 
                              achievement={achievement}
                              getProgressPercentage={getProgressPercentage}
                              isRecent={achievement.id === recentlyUnlocked?.id}
                            />
                          </MotionBox>
                        ))}
                      </AnimatePresence>
                    </SimpleGrid>
                  ) : (
                    <Flex 
                      direction="column" 
                      align="center" 
                      justify="center" 
                      py={12}
                      textAlign="center"
                    >
                      <Icon as={SearchIcon} boxSize={12} color={emptyStateColor} mb={4} />
                      <Heading size="md" color={textColor} mb={2}>No achievements found</Heading>
                      <Text color={textColor}>
                        {searchQuery ? 
                          `No achievements match "${searchQuery}"` : 
                          'Try adjusting your filters'}
                      </Text>
                      {searchQuery && (
                        <Button 
                          mt={4} 
                          onClick={() => setSearchQuery('')}
                          size="sm"
                          variant="outline"
                          colorScheme="blue"
                        >
                          Clear Search
                        </Button>
                      )}
                    </Flex>
                  )}
                </TabPanel>
                
                {/* Duplicate panel for each category */}
                {['completion', 'productivity', 'consistency', 'explorer'].map((category) => (
                  <TabPanel key={category} p={0} pt={4}>
                    {filteredAchievements.length > 0 ? (
                      <SimpleGrid columns={columns} spacing={6}>
                        <AnimatePresence>
                          {filteredAchievements.map((achievement) => (
                            <MotionBox
                              key={achievement.id}
                              layout
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.2 }}
                            >
                              <AchievementCard 
                                achievement={achievement}
                                getProgressPercentage={getProgressPercentage}
                                isRecent={achievement.id === recentlyUnlocked?.id}
                              />
                            </MotionBox>
                          ))}
                        </AnimatePresence>
                      </SimpleGrid>
                    ) : (
                      <Flex 
                        direction="column" 
                        align="center" 
                        justify="center" 
                        py={12}
                        textAlign="center"
                      >
                        <Icon as={SearchIcon} boxSize={12} color={emptyStateColor} mb={4} />
                        <Heading size="md" color={textColor} mb={2}>No achievements found</Heading>
                        <Text color={textColor}>
                          {searchQuery ? 
                            `No achievements match "${searchQuery}"` : 
                            'Try adjusting your filters'}
                        </Text>
                        {searchQuery && (
                          <Button 
                            mt={4} 
                            onClick={() => setSearchQuery('')}
                            size="sm"
                            variant="outline"
                            colorScheme="blue"
                          >
                            Clear Search
                          </Button>
                        )}
                      </Flex>
                    )}
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </Box>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
          <Button colorScheme="blue" onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AchievementsModal; 