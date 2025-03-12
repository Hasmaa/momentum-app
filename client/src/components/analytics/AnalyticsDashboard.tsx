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
} from '@chakra-ui/react';
import { FiBarChart2, FiCalendar, FiPieChart, FiClock } from 'react-icons/fi';
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
  const headingColor = useColorModeValue('blue.600', 'blue.300');
  
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
    
    const recentlyCompleted = completedTasks.filter(task => {
      if (!task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      return completedDate >= oneWeekAgo;
    });
    
    // High priority tasks completed
    const highPriorityCompleted = completedTasks.filter(task => 
      task.priority === 'high'
    ).length;
    
    return {
      totalTasks,
      completedTasks: completedTasks.length,
      pendingTasks: tasks.filter(task => task.status === 'pending').length,
      inProgressTasks: tasks.filter(task => task.status === 'in-progress').length,
      completionRate,
      recentlyCompleted: recentlyCompleted.length,
      highPriorityCompleted,
    };
  }, [tasks]);
  
  return (
    <Box p={5}>
      <Heading 
        size="xl" 
        mb={6} 
        color={headingColor}
        textAlign="center"
      >
        Analytics Dashboard
      </Heading>
      
      {/* Stats Overview Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={8}>
        <StatCard 
          title="Total Tasks" 
          value={stats.totalTasks.toString()}
          icon={FiBarChart2}
          color="blue.400"
        />
        <StatCard 
          title="Completion Rate" 
          value={`${stats.completionRate}%`}
          icon={FiPieChart}
          color="green.400"
        />
        <StatCard 
          title="Last 7 Days" 
          value={stats.recentlyCompleted.toString()}
          icon={FiCalendar}
          color="purple.400"
        />
        <StatCard 
          title="High Priority Done" 
          value={stats.highPriorityCompleted.toString()}
          icon={FiClock}
          color="red.400"
        />
      </SimpleGrid>
      
      <Tabs variant="enclosed" colorScheme="blue" isLazy>
        <TabList>
          <Tab>Productivity Trends</Tab>
          <Tab>Time Analysis</Tab>
          <Tab>Task Breakdown</Tab>
        </TabList>
        
        <TabPanels>
          {/* Productivity Trends Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="md">
                <CardHeader>
                  <Heading size="md">Completion Trends</Heading>
                </CardHeader>
                <CardBody>
                  <CompletionTrendChart tasks={tasks} />
                </CardBody>
              </Card>
              
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="md">
                <CardHeader>
                  <Heading size="md">Productivity Calendar</Heading>
                </CardHeader>
                <CardBody>
                  <ProductivityHeatmap tasks={tasks} />
                </CardBody>
              </Card>
              
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="md" gridColumn={{ lg: "span 2" }}>
                <CardHeader>
                  <Heading size="md">Streak Performance</Heading>
                </CardHeader>
                <CardBody>
                  <StreakVisualization tasks={tasks} />
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
          
          {/* Time Analysis Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="md">
                <CardHeader>
                  <Heading size="md">Time of Day Productivity</Heading>
                </CardHeader>
                <CardBody>
                  <TimeOfDayChart tasks={tasks} />
                </CardBody>
              </Card>
              
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="md">
                <CardHeader>
                  <Heading size="md">Task Duration by Priority</Heading>
                </CardHeader>
                <CardBody>
                  <Text fontSize="sm" color="gray.500" mb={4}>
                    Average time spent on tasks by priority level.
                  </Text>
                  {/* Placeholder for future chart */}
                  <Box height="200px" display="flex" alignItems="center" justifyContent="center">
                    <Text>Coming Soon</Text>
                  </Box>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
          
          {/* Task Breakdown Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="md">
                <CardHeader>
                  <Heading size="md">Priority Distribution</Heading>
                </CardHeader>
                <CardBody>
                  <PriorityDistribution tasks={tasks} />
                </CardBody>
              </Card>
              
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} shadow="md">
                <CardHeader>
                  <Heading size="md">Status Breakdown</Heading>
                </CardHeader>
                <CardBody>
                  <TaskStatusBreakdown tasks={tasks} />
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

// Helper component for stat cards
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  
  return (
    <Card bg={cardBg} shadow="md">
      <CardBody>
        <Flex align="center" justify="space-between">
          <Box>
            <Text fontSize="sm" color={textColor}>{title}</Text>
            <Text fontSize="2xl" fontWeight="bold">{value}</Text>
          </Box>
          <Icon as={icon} boxSize={10} color={color} />
        </Flex>
      </CardBody>
    </Card>
  );
};

export default AnalyticsDashboard; 