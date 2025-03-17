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
  InputRightElement,
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement, AchievementCategory } from '../types';
import AchievementCard from './AchievementCard';
import AchievementIcon from './AchievementIcon';

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
      isCentered
    >
      <ModalOverlay backdropFilter="blur(12px)" bg="blackAlpha.700" />
      <ModalContent 
        bg={bgColor}
        boxShadow="2xl"
        borderRadius="2xl"
        overflow="hidden"
        maxH="90vh"
        mx={4}
      >
        <ModalHeader 
          bg={useColorModeValue('white', 'gray.800')}
          borderBottomWidth="1px"
          borderColor={borderColor}
          py={6}
          px={8}
        >
          <Flex justify="space-between" align="center" width="full">
            <HStack spacing={4}>
              <Heading size="lg" color={headerColor} letterSpacing="tight" fontWeight="bold">
                Achievements
              </Heading>
              <Badge 
                colorScheme="blue" 
                fontSize="sm" 
                py={1.5} 
                px={4} 
                borderRadius="full"
                variant="subtle"
                bg={useColorModeValue('blue.50', 'blue.900')}
                color={useColorModeValue('blue.600', 'blue.200')}
              >
                {unlockedCount}/{totalAchievements}
              </Badge>
            </HStack>
            <ModalCloseButton 
              position="static" 
              size="md" 
              borderRadius="full"
              _hover={{
                bg: useColorModeValue('gray.100', 'gray.700')
              }}
            />
          </Flex>
        </ModalHeader>

        <ModalBody p={0}>
          {/* Stats Section */}
          <Box p={8} bg={useColorModeValue('gray.50', 'gray.900')}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {/* Overall Progress */}
              <Box 
                bg={useColorModeValue('white', 'gray.800')} 
                p={6} 
                borderRadius="xl"
                boxShadow="md"
              >
                <Text fontWeight="bold" mb={3} fontSize="lg" letterSpacing="tight">
                  Overall Progress
                </Text>
                <Progress 
                  value={completionPercentage} 
                  size="md" 
                  colorScheme="blue" 
                  borderRadius="full"
                  mb={3}
                  hasStripe={completionPercentage < 100}
                  isAnimated={completionPercentage < 100}
                  bg={useColorModeValue('blue.50', 'blue.900')}
                  height="8px"
                />
                <HStack justify="space-between" mt={2}>
                  <Text fontSize="sm" color={textColor}>
                    {unlockedCount} Achievement{unlockedCount !== 1 ? 's' : ''} Unlocked
                  </Text>
                  <Text fontWeight="bold" fontSize="xl" color="blue.500">
                    {completionPercentage}%
                  </Text>
                </HStack>
              </Box>
              
              {/* Latest Achievement */}
              <Box 
                bg={useColorModeValue('white', 'gray.800')} 
                p={6} 
                borderRadius="xl"
                boxShadow="md"
              >
                <Text fontWeight="bold" mb={3} fontSize="lg" letterSpacing="tight">
                  Latest Achievement
                </Text>
                {mostRecentAchievement ? (
                  <HStack spacing={4} align="center">
                    <Box
                      p={4}
                      borderRadius="xl"
                      bg={useColorModeValue('blue.50', 'blue.900')}
                    >
                      <AchievementIcon 
                        icon={mostRecentAchievement.icon} 
                        rarity={mostRecentAchievement.rarity}
                        isUnlocked={true}
                        isAnimated={mostRecentAchievement.id === recentlyUnlocked?.id}
                        size="3rem"
                      />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" fontSize="lg">{mostRecentAchievement.name}</Text>
                      <Text fontSize="sm" color={textColor}>
                        Unlocked {new Date(mostRecentAchievement.unlockedAt!).toLocaleDateString()}
                      </Text>
                    </VStack>
                  </HStack>
                ) : (
                  <Flex 
                    direction="column" 
                    align="center" 
                    justify="center" 
                    py={4}
                    color={textColor}
                  >
                    <Text fontSize="lg" fontWeight="medium">No achievements yet</Text>
                    <Text fontSize="sm" mt={1}>Complete tasks to earn achievements!</Text>
                  </Flex>
                )}
              </Box>
            </SimpleGrid>
          </Box>
          
          {/* Filters Section */}
          <Box px={8} py={6}>
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              justify="space-between" 
              align={{ base: 'flex-start', md: 'center' }} 
              mb={6} 
              gap={4}
            >
              <InputGroup maxW={{ base: '100%', md: '320px' }}>
                <InputLeftElement pointerEvents="none" h="full" pl={3}>
                  <SearchIcon color="gray.400" boxSize={4} />
                </InputLeftElement>
                <Input 
                  placeholder="Search achievements..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  borderRadius="lg"
                  size="md"
                  pl={10}
                  fontSize="sm"
                  _focus={{
                    borderColor: 'blue.400',
                    boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)'
                  }}
                />
                {searchQuery && (
                  <InputRightElement h="full" pr={2}>
                    <IconButton
                      icon={<SmallCloseIcon boxSize={3} />}
                      size="sm"
                      aria-label="Clear search"
                      variant="ghost"
                      onClick={() => setSearchQuery('')}
                      borderRadius="full"
                    />
                  </InputRightElement>
                )}
              </InputGroup>

              <HStack spacing={3}>
                <Menu closeOnSelect={true}>
                  <MenuButton 
                    as={Button} 
                    rightIcon={<ChevronDownIcon />}
                    variant="outline"
                    borderRadius="lg"
                    size="md"
                    px={4}
                    borderWidth={1}
                    _hover={{
                      bg: useColorModeValue('gray.50', 'gray.700')
                    }}
                  >
                    {showUnlocked === null ? 'All Achievements' : 
                      showUnlocked ? 'Unlocked' : 'Locked'}
                  </MenuButton>
                  <MenuList borderRadius="lg" p={1}>
                    <MenuItem borderRadius="md" p={2} onClick={() => setShowUnlocked(null)}>
                      All Achievements
                    </MenuItem>
                    <MenuItem borderRadius="md" p={2} onClick={() => setShowUnlocked(true)}>
                      Unlocked
                    </MenuItem>
                    <MenuItem borderRadius="md" p={2} onClick={() => setShowUnlocked(false)}>
                      Locked
                    </MenuItem>
                  </MenuList>
                </Menu>

                <Menu closeOnSelect={true}>
                  <MenuButton 
                    as={Button} 
                    rightIcon={<ChevronDownIcon />}
                    variant="outline"
                    borderRadius="lg"
                    size="md"
                    px={4}
                    borderWidth={1}
                    _hover={{
                      bg: useColorModeValue('gray.50', 'gray.700')
                    }}
                  >
                    Sort: {sortBy === 'default' ? 'Default' : 
                           sortBy === 'progress' ? 'Progress' : 
                           sortBy === 'name' ? 'Name' : 'Rarity'}
                  </MenuButton>
                  <MenuList borderRadius="lg" p={1}>
                    <MenuItem borderRadius="md" p={2} onClick={() => setSortBy('default')}>
                      Default
                    </MenuItem>
                    <MenuItem borderRadius="md" p={2} onClick={() => setSortBy('progress')}>
                      Progress
                    </MenuItem>
                    <MenuItem borderRadius="md" p={2} onClick={() => setSortBy('name')}>
                      Name
                    </MenuItem>
                    <MenuItem borderRadius="md" p={2} onClick={() => setSortBy('rarity')}>
                      Rarity
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </Flex>

            {/* Categories */}
            <Tabs 
              colorScheme="blue" 
              mb={6}
              variant="soft-rounded"
              size="md"
            >
              <TabList 
                overflow="auto" 
                py={1}
                px={1}
                mx={-1}
                borderRadius="lg"
                bg={useColorModeValue('gray.50', 'gray.900')}
                css={{
                  scrollbarWidth: 'thin',
                  '&::-webkit-scrollbar': {
                    height: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: useColorModeValue('rgba(0, 0, 0, 0.2)', 'rgba(255, 255, 255, 0.2)'),
                    borderRadius: '2px',
                  },
                }}
              >
                <Tab 
                  onClick={() => setActiveCategory('all')}
                  fontWeight={activeCategory === 'all' ? 'bold' : 'medium'}
                  px={6}
                  py={2}
                  fontSize="sm"
                  _selected={{
                    bg: useColorModeValue('white', 'gray.800'),
                    color: useColorModeValue('blue.500', 'blue.200'),
                    boxShadow: 'md'
                  }}
                >
                  All
                </Tab>
                {['completion', 'productivity', 'consistency', 'explorer'].map((category) => (
                  <Tab 
                    key={category}
                    onClick={() => setActiveCategory(category as AchievementCategory)}
                    fontWeight={activeCategory === category ? 'bold' : 'medium'}
                    px={6}
                    py={2}
                    fontSize="sm"
                    _selected={{
                      bg: useColorModeValue('white', 'gray.800'),
                      color: useColorModeValue('blue.500', 'blue.200'),
                      boxShadow: 'md'
                    }}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Tab>
                ))}
              </TabList>
              
              <TabPanels>
                <TabPanel px={0} pt={6}>
                  {filteredAchievements.length > 0 ? (
                    <SimpleGrid 
                      columns={columns} 
                      spacing={6} 
                      minChildWidth="320px"
                    >
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
                      <Icon as={SearchIcon} boxSize={10} color={emptyStateColor} mb={4} />
                      <Heading size="lg" color={textColor} mb={2}>No achievements found</Heading>
                      <Text color={textColor} fontSize="md" mb={6}>
                        {searchQuery ? 
                          `No achievements match "${searchQuery}"` : 
                          'Try adjusting your filters'}
                      </Text>
                      {searchQuery && (
                        <Button 
                          onClick={() => setSearchQuery('')}
                          size="md"
                          variant="outline"
                          colorScheme="blue"
                          borderRadius="lg"
                          px={6}
                          fontSize="sm"
                        >
                          Clear Search
                        </Button>
                      )}
                    </Flex>
                  )}
                </TabPanel>
                
                {/* Duplicate the TabPanel for each category with the same content structure */}
                {['completion', 'productivity', 'consistency', 'explorer'].map((category) => (
                  <TabPanel key={category} px={0} pt={6}>
                    {filteredAchievements.length > 0 ? (
                      <SimpleGrid 
                        columns={columns} 
                        spacing={6} 
                        minChildWidth="320px"
                      >
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
                        <Icon as={SearchIcon} boxSize={10} color={emptyStateColor} mb={4} />
                        <Heading size="lg" color={textColor} mb={2}>No achievements found</Heading>
                        <Text color={textColor} fontSize="md" mb={6}>
                          {searchQuery ? 
                            `No achievements match "${searchQuery}"` : 
                            'Try adjusting your filters'}
                        </Text>
                        {searchQuery && (
                          <Button 
                            onClick={() => setSearchQuery('')}
                            size="md"
                            variant="outline"
                            colorScheme="blue"
                            borderRadius="lg"
                            px={6}
                            fontSize="sm"
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

        <ModalFooter 
          borderTopWidth="1px" 
          borderColor={borderColor}
          py={6}
          px={8}
        >
          <Button 
            colorScheme="blue" 
            onClick={onClose}
            size="md"
            px={6}
            borderRadius="lg"
            fontSize="sm"
            fontWeight="bold"
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AchievementsModal; 