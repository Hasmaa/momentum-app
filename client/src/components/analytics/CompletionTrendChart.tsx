import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, subDays, parseISO, isValid, isSameDay } from 'date-fns';
import { useColorModeValue, Text, Box } from '@chakra-ui/react';
import { Task } from '../../types';

interface CompletionTrendChartProps {
  tasks: Task[];
}

const CompletionTrendChart: React.FC<CompletionTrendChartProps> = ({ tasks }) => {
  // Enhanced colors for dark mode
  const lineColor = useColorModeValue('#3182CE', '#63B3ED'); // blue.600 / blue.300
  const gridColor = useColorModeValue('#E2E8F0', '#2D3748'); // gray.200 / gray.700
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const emptyStateColor = useColorModeValue('gray.500', 'gray.400');
  const axisColor = useColorModeValue('#4A5568', '#A0AEC0'); // gray.600 / gray.400
  
  const chartData = useMemo(() => {
    // Create a date series for the last 30 days
    const dates = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return {
        date,
        dateString: format(date, 'yyyy-MM-dd'),
        displayDate: format(date, 'MMM dd'),
        completed: 0,
      };
    });
    
    // Count completed tasks for each day
    tasks.forEach(task => {
      if (task.status === 'completed' && task.completedAt) {
        const completedDate = parseISO(task.completedAt);
        
        if (isValid(completedDate)) {
          // Find the matching date in our array
          const matchingDateEntry = dates.find(entry => 
            isSameDay(entry.date, completedDate)
          );
          
          if (matchingDateEntry) {
            matchingDateEntry.completed += 1;
          }
        }
      }
    });
    
    return dates;
  }, [tasks]);
  
  // If no tasks, show empty state
  if (tasks.length === 0) {
    return (
      <Box textAlign="center" py={10} bg={bgColor} borderRadius="md">
        <Text color={emptyStateColor}>
          No task data available. Start completing tasks to see your trends!
        </Text>
      </Box>
    );
  }
  
  return (
    <Box height="300px" bg={bgColor} borderRadius="md" p={2}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="displayDate" 
            tick={{ fontSize: 12, fill: axisColor }}
            tickMargin={10}
            tickFormatter={(value, index) => index % 5 === 0 ? value : ''}
            stroke={axisColor}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: axisColor }} 
            allowDecimals={false}
            stroke={axisColor}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: useColorModeValue('#FFFFFF', '#1A202C'),
              borderColor: useColorModeValue('#E2E8F0', '#2D3748'),
              borderRadius: '8px',
              color: textColor,
            }}
            formatter={(value) => [`${value} tasks`, 'Completed']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend formatter={(value) => <span style={{ color: textColor }}>{value}</span>} />
          <Line
            type="monotone"
            dataKey="completed"
            stroke={lineColor}
            strokeWidth={2}
            activeDot={{ r: 8, fill: lineColor, stroke: useColorModeValue('white', 'gray.800') }}
            name="Completed Tasks"
            dot={{ strokeWidth: 1, r: 4, fill: bgColor, stroke: lineColor }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CompletionTrendChart; 