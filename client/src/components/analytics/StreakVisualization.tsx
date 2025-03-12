import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { 
  Box, 
  Text, 
  useColorModeValue, 
  Flex, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText,
  Badge
} from '@chakra-ui/react';
import { 
  parseISO, 
  isValid, 
  format, 
  eachDayOfInterval, 
  isSameDay, 
  subDays, 
  differenceInDays 
} from 'date-fns';
import { Task } from '../../types';

interface StreakVisualizationProps {
  tasks: Task[];
}

const StreakVisualization: React.FC<StreakVisualizationProps> = ({ tasks }) => {
  const lineColor = useColorModeValue('#DD6B20', '#F6AD55'); // orange.600 / orange.300
  const gridColor = useColorModeValue('#E2E8F0', '#2D3748'); // gray.200 / gray.700
  
  // Calculate streaks and generate chart data
  const { 
    streakData, 
    currentStreak, 
    longestStreak 
  } = useMemo(() => {
    // Get all completed task dates
    const completedDates = tasks
      .filter(task => task.status === 'completed' && task.completedAt)
      .map(task => {
        const date = parseISO(task.completedAt!);
        return isValid(date) ? format(date, 'yyyy-MM-dd') : null;
      })
      .filter(Boolean) as string[];
    
    // Create a set of unique dates with at least one completed task
    const uniqueDates = new Set(completedDates);
    
    // Get the date range for the last 60 days
    const today = new Date();
    const startDate = subDays(today, 59);
    
    // Create an array of all days in the range
    const dateRange = eachDayOfInterval({ start: startDate, end: today });
    
    // Build streak data
    let currentStreakCount = 0;
    let maxStreakCount = 0;
    let tempStreak = 0;
    
    // Create chart data with streak information
    const streakData = dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const hasCompletedTask = uniqueDates.has(dateStr);
      
      // If this day had a completed task, increment the temp streak
      if (hasCompletedTask) {
        tempStreak++;
      } else {
        // Reset temp streak if no tasks completed this day
        tempStreak = 0;
      }
      
      // Update the max streak if needed
      maxStreakCount = Math.max(maxStreakCount, tempStreak);
      
      // For current streak calculation, we go backwards from today
      // We'll calculate it separately below
      
      return {
        date: dateStr,
        displayDate: format(date, 'MMM dd'),
        hasCompletedTask: hasCompletedTask ? 1 : 0,
        streak: tempStreak,
      };
    });
    
    // Calculate current streak (consecutive days with completed tasks, 
    // counting backwards from today/yesterday)
    let i = dateRange.length - 1;
    const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
    
    // If today has completions, start counting from today
    if (uniqueDates.has(format(today, 'yyyy-MM-dd'))) {
      currentStreakCount = 1;
      i--;
      
      // Count back until we find a day with no completions
      while (i >= 0) {
        const dateStr = format(dateRange[i], 'yyyy-MM-dd');
        if (uniqueDates.has(dateStr)) {
          currentStreakCount++;
          i--;
        } else {
          break;
        }
      }
    } 
    // If yesterday has completions, start counting from yesterday
    else if (uniqueDates.has(yesterdayStr)) {
      // Find yesterday's index
      const yesterdayIndex = dateRange.findIndex(date => 
        format(date, 'yyyy-MM-dd') === yesterdayStr
      );
      
      if (yesterdayIndex !== -1) {
        currentStreakCount = 1;
        i = yesterdayIndex - 1;
        
        // Count back until we find a day with no completions
        while (i >= 0) {
          const dateStr = format(dateRange[i], 'yyyy-MM-dd');
          if (uniqueDates.has(dateStr)) {
            currentStreakCount++;
            i--;
          } else {
            break;
          }
        }
      }
    }
    
    return {
      streakData,
      currentStreak: currentStreakCount,
      longestStreak: maxStreakCount,
    };
  }, [tasks]);
  
  // If no tasks, show empty state
  if (tasks.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="gray.500">
          No task data available. Complete tasks daily to build your streak!
        </Text>
      </Box>
    );
  }
  
  return (
    <Box>
      <Flex 
        justify="space-around" 
        mb={6}
        direction={{ base: "column", sm: "row" }}
        align="center"
        gap={4}
      >
        <Stat textAlign="center">
          <StatLabel>Current Streak</StatLabel>
          <StatNumber>{currentStreak}</StatNumber>
          <StatHelpText>
            {currentStreak === 0 ? "No active streak" : "days"}
          </StatHelpText>
          {currentStreak >= 3 && (
            <Badge colorScheme="orange" variant="solid" borderRadius="full" px={2}>
              {currentStreak >= 7 ? "On Fire! 🔥" : "Keep Going! ✨"}
            </Badge>
          )}
        </Stat>
        
        <Stat textAlign="center">
          <StatLabel>Longest Streak</StatLabel>
          <StatNumber>{longestStreak}</StatNumber>
          <StatHelpText>days</StatHelpText>
          {longestStreak >= 7 && (
            <Badge colorScheme="purple" variant="solid" borderRadius="full" px={2}>
              Impressive! 🏆
            </Badge>
          )}
        </Stat>
      </Flex>
      
      <Box height="200px">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={streakData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fontSize: 10 }}
              tickMargin={10}
              tickFormatter={(value, index) => index % 7 === 0 ? value : ''}
            />
            <YAxis 
              tick={{ fontSize: 10 }} 
              allowDecimals={false}
              domain={[0, 'dataMax + 1']}
            />
            <Tooltip
              formatter={(value) => [value, 'Streak']}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                backgroundColor: useColorModeValue('#FFFFFF', '#1A202C'),
                borderColor: useColorModeValue('#E2E8F0', '#2D3748'),
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="streak"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              name="Daily Streak"
            />
            {longestStreak > 0 && (
              <ReferenceLine 
                y={longestStreak} 
                stroke={useColorModeValue('#805AD5', '#B794F4')} 
                strokeDasharray="3 3" 
                label={{ 
                  value: 'Longest',
                  position: 'insideBottomRight',
                  fill: useColorModeValue('#805AD5', '#B794F4'),
                  fontSize: 12,
                }} 
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default StreakVisualization; 