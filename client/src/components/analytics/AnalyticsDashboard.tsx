import React, { useMemo } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  useColorModeValue,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Badge,
  Divider,
  HStack,
  VStack,
  Grid,
  GridItem,
  Circle,
  useBreakpointValue,
} from '@chakra-ui/react';
import { 
  FiBarChart2, 
  FiCalendar, 
  FiPieChart, 
  FiClock, 
  FiTrendingUp, 
  FiCheckCircle,
  FiAlertCircle,
  FiActivity,
  FiStar
} from 'react-icons/fi';
import CompletionTrendChart from './CompletionTrendChart';
import ProductivityHeatmap from './ProductivityHeatmap';
import PriorityDistribution from './PriorityDistribution';
import TaskStatusBreakdown from './TaskStatusBreakdown';
import TimeOfDayChart from './TimeOfDayChart';
import StreakVisualization from './StreakVisualization';
import { Task } from '../../types';

interface AnalyticsDashboardProps {
  tasks: Task[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tasks }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardShadow = useColorModeValue('sm', 'dark-lg');
  const headingColor = useColorModeValue('blue.600', 'blue.300');
  const gradientBg = useColorModeValue(
    'linear-gradient(120deg, #f6f9fc 0%, #eef1f5 100%)',
    'linear-gradient(120deg, #2d3748 0%, #1a202c 100%)'
  );
  const accentGradient = useColorModeValue(
    'linear-gradient(120deg, #4299E1 0%, #3182CE 100%)',
    'linear-gradient(120deg, #63B3ED 0%, #4299E1 100%)'
  );
  const tabSize = useBreakpointValue({ base: 'sm', md: 'md' });
  
  // Derived statistics for the dashboard header
  const stats = useMemo(() => {
    const completedTasks = tasks.filter(task => task.status === 'completed');
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks.length / totalTasks) * 100) 
      : 0;
    
    // Calculate tasks completed in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const recentlyCompleted = completedTasks.filter(task => {
      if (!task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      return completedDate >= oneWeekAgo;
    });
    
    const previousWeekCompleted = completedTasks.filter(task => {
      if (!task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      return completedDate >= twoWeeksAgo && completedDate < oneWeekAgo;
    });
    
    // Calculate week-over-week change
    const weeklyChange = previousWeekCompleted.length > 0
      ? ((recentlyCompleted.length - previousWeekCompleted.length) / previousWeekCompleted.length) * 100
      : 0;
    
    // High priority tasks completed
    const highPriorityCompleted = completedTasks.filter(task => 
      task.priority === 'high'
    ).length;
    
    // Most productive day
    const dayCompletions: Record<string, number> = {};
    completedTasks.forEach(task => {
      if (task.completedAt) {
        const day = new Date(task.completedAt).toLocaleDateString('en-US', { weekday: 'long' });
        dayCompletions[day] = (dayCompletions[day] || 0) + 1;
      }
    });
    
    let mostProductiveDay = { day: 'N/A', count: 0 };
    Object.entries(dayCompletions).forEach(([day, count]) => {
      if (count > mostProductiveDay.count) {
        mostProductiveDay = { day, count };
      }
    });
    
    return {
      totalTasks,
      completedTasks: completedTasks.length,
      pendingTasks: tasks.filter(task => task.status === 'pending').length,
      inProgressTasks: tasks.filter(task => task.status === 'in-progress').length,
      completionRate,
      recentlyCompleted: recentlyCompleted.length,
      weeklyChange,
      highPriorityCompleted,
      mostProductiveDay
    };
  }, [tasks]);
  
  // Generate insights based on the data
  const insights = useMemo(() => {
    const insights = [];
    
    // Completion rate insight
    if (stats.completionRate > 75) {
      insights.push({
        text: `Great job! Your completion rate of ${stats.completionRate}% is excellent.`,
        type: 'success'
      });
    } else if (stats.completionRate < 30) {
      insights.push({
        text: `Your task completion rate is ${stats.completionRate}%. Try focusing on smaller, achievable tasks.`,
        type: 'warning'
      });
    }
    
    // Weekly progress insight
    if (stats.weeklyChange > 20) {
      insights.push({
        text: `Impressive! You've increased your productivity by ${Math.abs(Math.round(stats.weeklyChange))}% this week.`,
        type: 'success'
      });
    } else if (stats.weeklyChange < -20) {
      insights.push({
        text: `You completed ${Math.abs(Math.round(stats.weeklyChange))}% fewer tasks this week than last week.`,
        type: 'warning'
      });
    }
    
    // Most productive day
    if (stats.mostProductiveDay.day !== 'N/A') {
      insights.push({
        text: `${stats.mostProductiveDay.day} appears to be your most productive day.`,
        type: 'info'
      });
    }
    
    // High priority insight
    if (stats.highPriorityCompleted > 5) {
      insights.push({
        text: `You've tackled ${stats.highPriorityCompleted} high-priority tasks! Great focus on what matters.`,
        type: 'success'
      });
    }
    
    return insights;
  }, [stats]);
  
  return (
    <Box p={{ base: 3, md: 6 }}>
      {/* Hero Header Section */}
      <Box 
        bg={accentGradient} 
        borderRadius="xl" 
        p={{ base: 5, md: 8 }} 
        mb={8}
        color="white"
        boxShadow="xl"
      >
        <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="space-between">
          <Box mb={{ base: 5, md: 0 }}>
            <Heading size="xl" fontWeight="extrabold" mb={2}>
              Your Productivity Dashboard
            </Heading>
            <Text fontSize="lg" opacity={0.9}>
              Insights and analytics to boost your productivity
            </Text>
          </Box>
          <HStack spacing={4}>
            <Stat 
              bg="whiteAlpha.200" 
              p={3} 
              borderRadius="md" 
              minW="150px"
              backdropFilter="blur(10px)"
            >
              <StatLabel fontSize="xs">Completion Rate</StatLabel>
              <StatNumber fontSize="2xl">{stats.completionRate}%</StatNumber>
              <StatHelpText fontSize="xs">
                {stats.weeklyChange !== 0 && (
                  <>
                    <StatArrow type={stats.weeklyChange > 0 ? 'increase' : 'decrease'} />
                    {Math.abs(Math.round(stats.weeklyChange))}% vs last week
                  </>
                )}
              </StatHelpText>
            </Stat>
            <Stat 
              bg="whiteAlpha.200" 
              p={3} 
              borderRadius="md" 
              minW="150px"
              backdropFilter="blur(10px)"
              display={{ base: 'none', lg: 'block' }}
            >
              <StatLabel fontSize="xs">Tasks This Week</StatLabel>
              <StatNumber fontSize="2xl">{stats.recentlyCompleted}</StatNumber>
              <StatHelpText fontSize="xs">
                Completed in last 7 days
              </StatHelpText>
            </Stat>
          </HStack>
        </Flex>
      </Box>
      
      {/* Key Metrics Section */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={5} mb={8}>
        <EnhancedStatCard 
          title="Total Tasks" 
          value={stats.totalTasks.toString()}
          subtext={`${stats.pendingTasks} pending, ${stats.inProgressTasks} in progress`}
          icon={FiBarChart2}
          color="blue"
        />
        <EnhancedStatCard 
          title="Completed" 
          value={stats.completedTasks.toString()}
          subtext={`${stats.completionRate}% completion rate`}
          icon={FiCheckCircle}
          color="green"
        />
        <EnhancedStatCard 
          title="Last Week" 
          value={stats.recentlyCompleted.toString()}
          subtext={stats.weeklyChange > 0 
            ? `↑ ${Math.abs(Math.round(stats.weeklyChange))}% increase` 
            : stats.weeklyChange < 0 
              ? `↓ ${Math.abs(Math.round(stats.weeklyChange))}% decrease`
              : 'Same as last week'}
          icon={FiTrendingUp}
          color="purple"
        />
        <EnhancedStatCard 
          title="High Priority" 
          value={stats.highPriorityCompleted.toString()}
          subtext="Completed high-priority tasks"
          icon={FiAlertCircle}
          color="red"
        />
      </SimpleGrid>
      
      {/* Insights Section */}
      {insights.length > 0 && (
        <Card 
          bg={gradientBg} 
          borderRadius="lg" 
          mb={8} 
          boxShadow={cardShadow}
          borderWidth="1px"
          borderColor={borderColor}
        >
          <CardHeader pb={0}>
            <Flex align="center">
              <Icon as={FiStar} color="yellow.400" mr={2} />
              <Heading size="md">Key Insights</Heading>
            </Flex>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {insights.map((insight, index) => (
                <InsightCard key={index} text={insight.text} type={insight.type} />
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>
      )}
      
      {/* Main Charts Section */}
      <Tabs 
        variant="soft-rounded" 
        colorScheme="blue" 
        isLazy
        size={tabSize}
        mb={4}
      >
        <TabList mb={5} overflowX="auto" py={2} css={{
          '&::-webkit-scrollbar': { height: '8px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: borderColor, borderRadius: '8px' }
        }}>
          <Tab gap={2}><Icon as={FiTrendingUp} /> Productivity Trends</Tab>
          <Tab gap={2}><Icon as={FiClock} /> Time Analysis</Tab>
          <Tab gap={2}><Icon as={FiPieChart} /> Task Breakdown</Tab>
        </TabList>
        
        <TabPanels>
          {/* Productivity Trends Tab */}
          <TabPanel px={0}>
            <Grid 
              templateColumns={{ base: "repeat(1, 1fr)", lg: "repeat(4, 1fr)" }}
              gap={5}
            >
              <GridItem colSpan={{ base: 1, lg: 2 }}>
                <Card 
                  bg={cardBg} 
                  borderRadius="lg" 
                  shadow={cardShadow} 
                  h="100%"
                  borderWidth="1px"
                  borderColor={borderColor}
                  position="relative"
                  overflow="hidden"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: accentGradient,
                  }}
                >
                  <CardHeader pb={0}>
                    <Flex align="center" justify="space-between">
                      <Heading size="md">Completion Trends</Heading>
                      <Circle size="8" bg="blue.50" color="blue.500">
                        <Icon as={FiActivity} />
                      </Circle>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <Text fontSize="sm" color="gray.500" mb={3}>
                      Your task completion patterns over the last month
                    </Text>
                    <CompletionTrendChart tasks={tasks} />
                  </CardBody>
                </Card>
              </GridItem>
              
              <GridItem colSpan={{ base: 1, lg: 2 }}>
                <Card 
                  bg={cardBg} 
                  borderRadius="lg" 
                  shadow={cardShadow} 
                  h="100%"
                  borderWidth="1px"
                  borderColor={borderColor}
                  position="relative"
                  overflow="hidden"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, purple.400, pink.400)',
                  }}
                >
                  <CardHeader pb={0}>
                    <Flex align="center" justify="space-between">
                      <Heading size="md">Productivity Calendar</Heading>
                      <Circle size="8" bg="purple.50" color="purple.500">
                        <Icon as={FiCalendar} />
                      </Circle>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <Text fontSize="sm" color="gray.500" mb={3}>
                      Heatmap of your productive days over the last 3 months
                    </Text>
                    <ProductivityHeatmap tasks={tasks} />
                  </CardBody>
                </Card>
              </GridItem>
              
              <GridItem colSpan={{ base: 1, lg: 4 }}>
                <Card 
                  bg={cardBg} 
                  borderRadius="lg" 
                  shadow={cardShadow}
                  borderWidth="1px"
                  borderColor={borderColor}
                  position="relative"
                  overflow="hidden"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, orange.400, yellow.400)',
                  }}
                >
                  <CardHeader pb={0}>
                    <Flex align="center" justify="space-between">
                      <Heading size="md">Streak Performance</Heading>
                      <Circle size="8" bg="orange.50" color="orange.500">
                        <Icon as={FiTrendingUp} />
                      </Circle>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <Text fontSize="sm" color="gray.500" mb={3}>
                      Your consistency in completing tasks day after day
                    </Text>
                    <StreakVisualization tasks={tasks} />
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </TabPanel>
          
          {/* Time Analysis Tab */}
          <TabPanel px={0}>
            <Grid 
              templateColumns={{ base: "repeat(1, 1fr)", lg: "repeat(2, 1fr)" }}
              gap={5}
            >
              <GridItem>
                <Card 
                  bg={cardBg} 
                  borderRadius="lg" 
                  shadow={cardShadow}
                  borderWidth="1px"
                  borderColor={borderColor}
                  position="relative"
                  overflow="hidden"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, purple.400, indigo.400)',
                  }}
                >
                  <CardHeader pb={0}>
                    <Flex align="center" justify="space-between">
                      <Heading size="md">Productivity by Hour</Heading>
                      <Circle size="8" bg="purple.50" color="purple.500">
                        <Icon as={FiClock} />
                      </Circle>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <Text fontSize="sm" color="gray.500" mb={3}>
                      Your most productive hours based on task completion times
                    </Text>
                    <TimeOfDayChart tasks={tasks} />
                  </CardBody>
                </Card>
              </GridItem>
              
              <GridItem>
                <Card 
                  bg={cardBg} 
                  borderRadius="lg" 
                  shadow={cardShadow}
                  borderWidth="1px"
                  borderColor={borderColor}
                  height="100%"
                  position="relative"
                  overflow="hidden"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, blue.400, cyan.400)',
                  }}
                >
                  <CardHeader pb={0}>
                    <Flex align="center" justify="space-between">
                      <Heading size="md">Productive Days</Heading>
                      <Circle size="8" bg="blue.50" color="blue.500">
                        <Icon as={FiCalendar} />
                      </Circle>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <Text fontSize="sm" color="gray.500" mb={3}>
                      Days of the week when you're most productive
                    </Text>
                    
                    <Flex direction="column" justify="center" h="260px">
                      {stats.mostProductiveDay.day !== 'N/A' ? (
                        <VStack spacing={1} justify="center" align="center">
                          <Text fontSize="lg" fontWeight="bold">
                            {stats.mostProductiveDay.day}
                          </Text>
                          <Text fontSize="3xl" fontWeight="extrabold" color="blue.500">
                            {stats.mostProductiveDay.count}
                          </Text>
                          <Text>tasks completed</Text>
                          <Badge colorScheme="blue" mt={2}>
                            Your most productive day
                          </Badge>
                        </VStack>
                      ) : (
                        <Text textAlign="center" color="gray.500">
                          Complete more tasks to see your most productive day
                        </Text>
                      )}
                    </Flex>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </TabPanel>
          
          {/* Task Breakdown Tab */}
          <TabPanel px={0}>
            <Grid 
              templateColumns={{ base: "repeat(1, 1fr)", lg: "repeat(2, 1fr)" }}
              gap={5}
            >
              <GridItem>
                <Card 
                  bg={cardBg} 
                  borderRadius="lg" 
                  shadow={cardShadow}
                  borderWidth="1px"
                  borderColor={borderColor}
                  position="relative"
                  overflow="hidden"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, yellow.400, green.400)',
                  }}
                >
                  <CardHeader pb={0}>
                    <Flex align="center" justify="space-between">
                      <Heading size="md">Priority Distribution</Heading>
                      <Circle size="8" bg="yellow.50" color="yellow.500">
                        <Icon as={FiPieChart} />
                      </Circle>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <Text fontSize="sm" color="gray.500" mb={3}>
                      Breakdown of tasks by priority level
                    </Text>
                    <PriorityDistribution tasks={tasks} />
                  </CardBody>
                </Card>
              </GridItem>
              
              <GridItem>
                <Card 
                  bg={cardBg} 
                  borderRadius="lg" 
                  shadow={cardShadow}
                  borderWidth="1px"
                  borderColor={borderColor}
                  position="relative"
                  overflow="hidden"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, blue.400, green.400)',
                  }}
                >
                  <CardHeader pb={0}>
                    <Flex align="center" justify="space-between">
                      <Heading size="md">Status Breakdown</Heading>
                      <Circle size="8" bg="green.50" color="green.500">
                        <Icon as={FiPieChart} />
                      </Circle>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <Text fontSize="sm" color="gray.500" mb={3}>
                      Current distribution of tasks by status
                    </Text>
                    <TaskStatusBreakdown tasks={tasks} />
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      <Divider my={8} />
      
      <Text textAlign="center" fontSize="sm" color="gray.500">
        Last updated: {new Date().toLocaleString()}
      </Text>
    </Box>
  );
};

// Enhanced stat card component
interface EnhancedStatCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: React.ElementType;
  color: string;
}

const EnhancedStatCard: React.FC<EnhancedStatCardProps> = ({ title, value, subtext, icon, color }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconBg = useColorModeValue(`${color}.50`, `${color}.900`);
  const iconColor = useColorModeValue(`${color}.500`, `${color}.300`);
  const cardShadow = useColorModeValue('sm', 'dark-lg');
  
  return (
    <Card 
      bg={cardBg} 
      shadow={cardShadow}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      transition="transform 0.2s"
      _hover={{ transform: 'translateY(-4px)', shadow: 'md' }}
    >
      <CardBody p={4}>
        <Flex align="center" mb={3}>
          <Circle size="10" bg={iconBg} color={iconColor} mr={3}>
            <Icon as={icon} boxSize={5} />
          </Circle>
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" color={textColor}>{title}</Text>
            <Text fontSize="2xl" fontWeight="bold">{value}</Text>
          </VStack>
        </Flex>
        <Text fontSize="xs" color={textColor} opacity={0.8}>{subtext}</Text>
      </CardBody>
    </Card>
  );
};

// Insight card component
interface InsightCardProps {
  text: string;
  type: 'success' | 'warning' | 'info';
}

const InsightCard: React.FC<InsightCardProps> = ({ text, type }) => {
  // Color schemes based on insight type
  const schemes = {
    success: {
      bg: useColorModeValue('green.50', 'green.900'),
      border: useColorModeValue('green.200', 'green.700'),
      icon: FiCheckCircle,
      iconColor: 'green.500',
    },
    warning: {
      bg: useColorModeValue('orange.50', 'orange.900'),
      border: useColorModeValue('orange.200', 'orange.700'),
      icon: FiAlertCircle,
      iconColor: 'orange.500',
    },
    info: {
      bg: useColorModeValue('blue.50', 'blue.900'),
      border: useColorModeValue('blue.200', 'blue.700'),
      icon: FiCalendar,
      iconColor: 'blue.500',
    }
  };
  
  const scheme = schemes[type];
  
  return (
    <Flex
      p={3}
      borderRadius="md"
      bg={scheme.bg}
      borderWidth="1px"
      borderColor={scheme.border}
      align="center"
    >
      <Icon as={scheme.icon} color={scheme.iconColor} boxSize={5} mr={3} />
      <Text fontSize="sm">{text}</Text>
    </Flex>
  );
};

export default AnalyticsDashboard; 