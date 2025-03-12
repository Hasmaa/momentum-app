import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import { parseISO, isValid, getHours } from 'date-fns';
import { Task } from '../../types';

interface TimeOfDayChartProps {
  tasks: Task[];
}

const TimeOfDayChart: React.FC<TimeOfDayChartProps> = ({ tasks }) => {
  const barColor = useColorModeValue('#805AD5', '#B794F4'); // purple.600 / purple.300
  const gridColor = useColorModeValue('#E2E8F0', '#2D3748'); // gray.200 / gray.700
  
  // Format the hour for display
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };
  
  // Group task completions by hour of the day
  const hourlyData = useMemo(() => {
    // Initialize hours (0-23)
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      displayHour: formatHour(i),
      count: 0,
    }));
    
    // Count completions by hour
    tasks.forEach(task => {
      if (task.status === 'completed' && task.completedAt) {
        const completedDate = parseISO(task.completedAt);
        
        if (isValid(completedDate)) {
          const hour = getHours(completedDate);
          hours[hour].count += 1;
        }
      }
    });
    
    return hours;
  }, [tasks]);
  
  // If no completed tasks, show empty state
  if (!tasks.some(task => task.status === 'completed' && task.completedAt)) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="gray.500">
          No completion time data available. Complete tasks to see your productive hours!
        </Text>
      </Box>
    );
  }
  
  return (
    <Box height="300px">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={hourlyData}
          margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="displayHour" 
            tick={{ fontSize: 10 }}
            tickMargin={10}
            tickFormatter={(value, index) => index % 3 === 0 ? value : ''}
            interval={0}
          />
          <YAxis 
            allowDecimals={false}
            tick={{ fontSize: 10 }}
          />
          <Tooltip
            formatter={(value) => [`${value} tasks`, 'Completed']}
            labelFormatter={(hour) => `Time: ${hourlyData[hour as number].displayHour}`}
            contentStyle={{
              backgroundColor: useColorModeValue('#FFFFFF', '#1A202C'),
              borderColor: useColorModeValue('#E2E8F0', '#2D3748'),
              borderRadius: '8px',
            }}
          />
          <Bar 
            dataKey="count" 
            fill={barColor} 
            radius={[4, 4, 0, 0]}
            name="Tasks Completed"
          />
        </BarChart>
      </ResponsiveContainer>
      
      <Text textAlign="center" fontSize="sm" color="gray.500" mt={2}>
        Hour of the day when tasks are completed
      </Text>
    </Box>
  );
};

export default TimeOfDayChart; 