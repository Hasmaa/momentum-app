import React, { useMemo, useState, useEffect } from 'react';
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
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  FormControl,
  FormLabel,
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
  FiClipboard,
  FiMoreVertical,
  FiRefreshCw,
  FiDownload,
  FiInfo,
  FiTarget,
  FiFlag,
  FiSettings,
  FiMaximize,
  FiSave,
  FiFilter,
  FiSliders,
  FiFileText,
  FiShare2
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
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDateRange, setSelectedDateRange] = useState('30');
  
  // Theme colors - more subdued for enterprise setting
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardShadow = useColorModeValue('sm', 'dark-lg');
  const headingColor = useColorModeValue('gray.700', 'gray.300');
  const subtleText = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const accentColor = useColorModeValue('blue.600', 'blue.400');
  const headerBg = useColorModeValue('gray.50', 'gray.900');
  
  // Responsive settings
  const tabSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const statCardColumns = useBreakpointValue({ base: 2, md: 4 });
  const showFullStats = useBreakpointValue({ base: false, lg: true });
  
  // Analytics best practices
  const bestPractices = [
    "Focus on high-priority tasks to improve organizational efficiency.",
    "Monitor completion rates for key performance indicators.",
    "Analyze time-of-day patterns to optimize resource allocation.",
    "Track weekly progress to identify productivity trends.",
    "Review task distribution to ensure balanced workload management.",
    "Document completed objectives for performance measurement.",
    "Maintain consistent task completion schedules for maximum efficiency.",
    "Identify recurring patterns in task completion to optimize workflows.",
  ];
  
  // Generate a random best practice tip on component load or refresh
  useEffect(() => {
    // Set a random best practice
    const randomIndex = Math.floor(Math.random() * bestPractices.length);
    
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle refreshing data
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };
  
  // Derived statistics for the dashboard
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
    
    const highPriorityTotal = tasks.filter(task => task.priority === 'high').length;
    const highPriorityCompletionRate = highPriorityTotal > 0
      ? Math.round((highPriorityCompleted / highPriorityTotal) * 100)
      : 0;
    
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
    
    // Average tasks per day (when active)
    const uniqueDays = new Set(
      completedTasks
        .filter(task => task.completedAt)
        .map(task => new Date(task.completedAt!).toDateString())
    );
    
    const avgTasksPerActiveDay = uniqueDays.size > 0
      ? Math.round((completedTasks.length / uniqueDays.size) * 10) / 10
      : 0;
    
    return {
      totalTasks,
      completedTasks: completedTasks.length,
      pendingTasks: tasks.filter(task => task.status === 'pending').length,
      inProgressTasks: tasks.filter(task => task.status === 'in-progress').length,
      completionRate,
      recentlyCompleted: recentlyCompleted.length,
      weeklyChange,
      highPriorityCompleted,
      highPriorityCompletionRate,
      mostProductiveDay,
      avgTasksPerActiveDay,
    };
  }, [tasks]);
  
  // Generate insights based on the data
  const insights = useMemo(() => {
    const insights = [];
    
    // Completion rate insight
    if (stats.completionRate > 75) {
      insights.push({
        title: 'High Completion Rate',
        text: `Task completion rate of ${stats.completionRate}% exceeds target metrics.`,
        type: 'success',
        icon: FiCheckCircle,
      });
    } else if (stats.completionRate < 30 && stats.totalTasks > 5) {
      insights.push({
        title: 'Low Completion Rate',
        text: `Current completion rate of ${stats.completionRate}% falls below expected performance targets.`,
        type: 'warning',
        icon: FiAlertCircle,
      });
    }
    
    // Weekly progress insight
    if (stats.weeklyChange > 20) {
      insights.push({
        title: 'Productivity Increase',
        text: `${Math.abs(Math.round(stats.weeklyChange))}% increase in completed tasks this week compared to previous period.`,
        type: 'success',
        icon: FiTrendingUp,
      });
    } else if (stats.weeklyChange < -20 && stats.recentlyCompleted > 0) {
      insights.push({
        title: 'Productivity Decrease',
        text: `${Math.abs(Math.round(stats.weeklyChange))}% decrease in completed tasks compared to previous period.`,
        type: 'warning',
        icon: FiTrendingUp,
      });
    }
    
    // Most productive day
    if (stats.mostProductiveDay.day !== 'N/A') {
      insights.push({
        title: 'Peak Efficiency Day',
        text: `${stats.mostProductiveDay.day} shows highest task completion rate with ${stats.mostProductiveDay.count} completed items.`,
        type: 'info',
        icon: FiCalendar,
      });
    }
    
    // High priority insight
    if (stats.highPriorityCompleted > 5) {
      insights.push({
        title: 'High-Priority Success',
        text: `${stats.highPriorityCompleted} high-priority tasks completed with ${stats.highPriorityCompletionRate}% efficiency rate.`,
        type: 'success',
        icon: FiFlag,
      });
    }
    
    // Daily average insight
    if (stats.avgTasksPerActiveDay > 3) {
      insights.push({
        title: 'Daily Efficiency Metric',
        text: `Average daily completion rate: ${stats.avgTasksPerActiveDay} tasks per active workday.`,
        type: 'info',
        icon: FiActivity,
      });
    }
    
    return insights;
  }, [stats]);
  
  return (
    <Box p={{ base: 3, md: 6 }}>
      {/* Header Section with Key Metrics */}
      <Card 
        bg={headerBg}
        borderRadius="md"
        p={{ base: 4, md: 5 }}
        mb={6}
        boxShadow="sm"
        borderWidth="1px"
        borderColor={borderColor}
        position="relative"
      >
        <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" mb={4}>
          <Box mb={{ base: 4, md: 0 }}>
            <Heading size="lg" color={headingColor} mb={1}>
              Performance Analytics
            </Heading>
            <Text fontSize="md" color={subtleText}>
              Task Completion Metrics and Productivity Analysis
            </Text>
          </Box>
          
          <HStack spacing={4}>
            <Tooltip label="Refresh data">
              <IconButton
                aria-label="Refresh data"
                icon={<FiRefreshCw />}
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                isLoading={isLoading}
              />
            </Tooltip>
            
            <Tooltip label="Export as CSV">
              <IconButton
                aria-label="Export data"
                icon={<FiDownload />}
                size="sm"
                variant="outline"
              />
            </Tooltip>
            
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="More options"
                icon={<FiMoreVertical />}
                size="sm"
                variant="outline"
              />
              <MenuList>
                <MenuItem icon={<FiMaximize />}>Full Screen View</MenuItem>
                <MenuItem icon={<FiFilter />}>Apply Filters</MenuItem>
                <MenuItem icon={<FiFileText />}>Generate Report</MenuItem>
                <MenuItem icon={<FiShare2 />}>Share Dashboard</MenuItem>
                <MenuItem icon={<FiSettings />}>Dashboard Settings</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
        
        <Divider mb={4} />
        
        <Flex mb={4} justify="space-between" align="center">
          <HStack>
            <FormControl maxW="200px">
              <Select
                size="sm" 
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last 12 months</option>
              </Select>
            </FormControl>
            
            <Badge variant="subtle" colorScheme="green">
              {isLoading ? 'Refreshing...' : 'Data current'}
            </Badge>
          </HStack>
          
          <Text fontSize="sm" color={subtleText}>
            Last updated: {new Date().toLocaleString()}
          </Text>
        </Flex>
        
        <SimpleGrid columns={statCardColumns} spacing={4}>
          <Card 
            bg={cardBg} 
            shadow="sm"
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="md"
            p={3}
          >
            <Stat>
              <StatLabel fontSize="xs">Total Tasks</StatLabel>
              <StatNumber fontSize="2xl">{stats.totalTasks}</StatNumber>
              <StatHelpText fontSize="xs" mb={0}>
                {stats.pendingTasks} pending, {stats.inProgressTasks} in progress
              </StatHelpText>
            </Stat>
          </Card>
          
          <Card 
            bg={cardBg} 
            shadow="sm"
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="md"
            p={3}
          >
            <Stat>
              <StatLabel fontSize="xs">Completion Rate</StatLabel>
              <StatNumber fontSize="2xl">{stats.completionRate}%</StatNumber>
              <StatHelpText fontSize="xs" mb={0}>
                {stats.completedTasks} completed tasks
              </StatHelpText>
            </Stat>
          </Card>
          
          <Card 
            bg={cardBg} 
            shadow="sm"
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="md"
            p={3}
          >
            <Stat>
              <StatLabel fontSize="xs">Weekly Trend</StatLabel>
              <StatNumber fontSize="2xl">{stats.recentlyCompleted}</StatNumber>
              <StatHelpText fontSize="xs" mb={0}>
                {stats.weeklyChange !== 0 && (
                  <>
                    <StatArrow type={stats.weeklyChange > 0 ? 'increase' : 'decrease'} />
                    {Math.abs(Math.round(stats.weeklyChange))}% vs previous
                  </>
                )}
              </StatHelpText>
            </Stat>
          </Card>
          
          <Card 
            bg={cardBg} 
            shadow="sm"
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="md"
            p={3}
          >
            <Stat>
              <StatLabel fontSize="xs">High Priority</StatLabel>
              <StatNumber fontSize="2xl">{stats.highPriorityCompleted}</StatNumber>
              <StatHelpText fontSize="xs" mb={0}>
                {stats.highPriorityCompletionRate}% completion rate
              </StatHelpText>
            </Stat>
          </Card>
        </SimpleGrid>
      </Card>
      
      {/* Key Findings Section */}
      {insights.length > 0 && (
        <Card 
          bg={cardBg}
          borderRadius="md"
          mb={6}
          boxShadow={cardShadow}
          borderWidth="1px"
          borderColor={borderColor}
        >
          <CardHeader pb={0}>
            <Flex align="center">
              <Icon as={FiClipboard} mr={2} />
              <Heading size="md">Key Findings</Heading>
            </Flex>
          </CardHeader>
          
          <CardBody>
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Observation</Th>
                  <Th>Details</Th>
                  <Th>Category</Th>
                </Tr>
              </Thead>
              <Tbody>
                {insights.map((insight, index) => (
                  <Tr key={index}>
                    <Td fontWeight="medium">{insight.title}</Td>
                    <Td>{insight.text}</Td>
                    <Td>
                      <Badge 
                        colorScheme={
                          insight.type === 'success' ? 'green' : 
                          insight.type === 'warning' ? 'orange' : 
                          'blue'
                        }
                      >
                        {insight.type === 'success' ? 'Positive' : 
                         insight.type === 'warning' ? 'Needs Attention' : 
                         'Informational'}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      )}
      
      {/* Main Charts Tabs */}
      <Card 
        bg={cardBg}
        borderRadius="md"
        boxShadow={cardShadow}
        borderWidth="1px"
        borderColor={borderColor}
        mb={6}
      >
        <CardHeader pb={0}>
          <Tabs 
            variant="enclosed" 
            colorScheme="blue" 
            isLazy
            size={tabSize}
            onChange={(index) => setActiveTab(index)}
          >
            <TabList>
              <Tab><HStack><Icon as={FiTrendingUp} /><Text>Productivity Metrics</Text></HStack></Tab>
              <Tab><HStack><Icon as={FiClock} /><Text>Temporal Analysis</Text></HStack></Tab>
              <Tab><HStack><Icon as={FiPieChart} /><Text>Task Distribution</Text></HStack></Tab>
            </TabList>
            
            <TabPanels>
              {/* Productivity Metrics Tab */}
              <TabPanel px={0} pt={4}>
                <Grid 
                  templateColumns={{ base: "repeat(1, 1fr)", lg: "repeat(4, 1fr)" }}
                  gap={5}
                >
                  <GridItem colSpan={{ base: 1, lg: 2 }}>
                    <Card 
                      bg={cardBg} 
                      borderRadius="md" 
                      shadow="sm" 
                      h="100%"
                      borderWidth="1px"
                      borderColor={borderColor}
                    >
                      <CardHeader>
                        <Flex align="center" justify="space-between">
                          <Heading size="md">Completion Trend Analysis</Heading>
                          <Tooltip label="View details">
                            <IconButton
                              aria-label="View details"
                              icon={<FiInfo />}
                              size="sm"
                              variant="ghost"
                            />
                          </Tooltip>
                        </Flex>
                      </CardHeader>
                      <CardBody>
                        <Text fontSize="sm" color="gray.500" mb={3}>
                          Historical completion patterns over time
                        </Text>
                        <CompletionTrendChart tasks={tasks} />
                      </CardBody>
                    </Card>
                  </GridItem>
                  
                  <GridItem colSpan={{ base: 1, lg: 2 }}>
                    <Card 
                      bg={cardBg} 
                      borderRadius="md" 
                      shadow="sm" 
                      h="100%"
                      borderWidth="1px"
                      borderColor={borderColor}
                    >
                      <CardHeader>
                        <Heading size="md">Productivity Heatmap</Heading>
                      </CardHeader>
                      <CardBody>
                        <Text fontSize="sm" color="gray.500" mb={3}>
                          Task completion density over calendar periods
                        </Text>
                        <ProductivityHeatmap tasks={tasks} />
                      </CardBody>
                    </Card>
                  </GridItem>
                  
                  <GridItem colSpan={{ base: 1, lg: 4 }}>
                    <Card 
                      bg={cardBg} 
                      borderRadius="md" 
                      shadow="sm"
                      borderWidth="1px"
                      borderColor={borderColor}
                    >
                      <CardHeader>
                        <Heading size="md">Consistency Analysis</Heading>
                      </CardHeader>
                      <CardBody>
                        <Text fontSize="sm" color="gray.500" mb={3}>
                          Sequential task completion patterns and streak metrics
                        </Text>
                        <StreakVisualization tasks={tasks} />
                      </CardBody>
                    </Card>
                  </GridItem>
                </Grid>
              </TabPanel>
              
              {/* Temporal Analysis Tab */}
              <TabPanel px={0} pt={4}>
                <Grid 
                  templateColumns={{ base: "repeat(1, 1fr)", lg: "repeat(2, 1fr)" }}
                  gap={5}
                >
                  <GridItem>
                    <Card 
                      bg={cardBg} 
                      borderRadius="md" 
                      shadow="sm"
                      borderWidth="1px"
                      borderColor={borderColor}
                    >
                      <CardHeader>
                        <Heading size="md">Hourly Distribution Analysis</Heading>
                      </CardHeader>
                      <CardBody>
                        <Text fontSize="sm" color="gray.500" mb={3}>
                          Task completion frequency by hour of day
                        </Text>
                        <TimeOfDayChart tasks={tasks} />
                      </CardBody>
                    </Card>
                  </GridItem>
                  
                  <GridItem>
                    <Card 
                      bg={cardBg} 
                      borderRadius="md" 
                      shadow="sm"
                      borderWidth="1px"
                      borderColor={borderColor}
                      height="100%"
                    >
                      <CardHeader>
                        <Heading size="md">Weekly Efficiency Pattern</Heading>
                      </CardHeader>
                      <CardBody>
                        <Text fontSize="sm" color="gray.500" mb={3}>
                          Distribution of completed tasks by day of week
                        </Text>
                        
                        <Flex direction="column" justify="center" h="260px">
                          {stats.mostProductiveDay.day !== 'N/A' ? (
                            <VStack spacing={1} justify="center" align="center">
                              <Text fontSize="md" fontWeight="medium">
                                Highest Efficiency Day:
                              </Text>
                              <Text fontSize="2xl" fontWeight="bold" color={accentColor}>
                                {stats.mostProductiveDay.day}
                              </Text>
                              <Text>{stats.mostProductiveDay.count} completed tasks</Text>
                              <Badge colorScheme="blue" mt={2}>
                                Optimal Productivity Period
                              </Badge>
                            </VStack>
                          ) : (
                            <Text textAlign="center" color="gray.500">
                              Insufficient data for weekly pattern analysis
                            </Text>
                          )}
                        </Flex>
                      </CardBody>
                    </Card>
                  </GridItem>
                </Grid>
              </TabPanel>
              
              {/* Task Distribution Tab */}
              <TabPanel px={0} pt={4}>
                <Grid 
                  templateColumns={{ base: "repeat(1, 1fr)", lg: "repeat(2, 1fr)" }}
                  gap={5}
                >
                  <GridItem>
                    <Card 
                      bg={cardBg} 
                      borderRadius="md" 
                      shadow="sm"
                      borderWidth="1px"
                      borderColor={borderColor}
                    >
                      <CardHeader>
                        <Heading size="md">Priority Distribution Analysis</Heading>
                      </CardHeader>
                      <CardBody>
                        <Text fontSize="sm" color="gray.500" mb={3}>
                          Task breakdown by assigned priority level
                        </Text>
                        <PriorityDistribution tasks={tasks} />
                      </CardBody>
                    </Card>
                  </GridItem>
                  
                  <GridItem>
                    <Card 
                      bg={cardBg} 
                      borderRadius="md" 
                      shadow="sm"
                      borderWidth="1px"
                      borderColor={borderColor}
                    >
                      <CardHeader>
                        <Heading size="md">Status Distribution Analysis</Heading>
                      </CardHeader>
                      <CardBody>
                        <Text fontSize="sm" color="gray.500" mb={3}>
                          Current task allocation by workflow stage
                        </Text>
                        <TaskStatusBreakdown tasks={tasks} />
                      </CardBody>
                    </Card>
                  </GridItem>
                </Grid>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardHeader>
      </Card>
      
      <Divider my={4} />
      
      <HStack justify="space-between" fontSize="sm" color="gray.500">
        <Text>Powered by Advanced Analytics</Text>
        <Text>Data timestamp: {new Date().toLocaleString()}</Text>
      </HStack>
    </Box>
  );
};

export default AnalyticsDashboard; 