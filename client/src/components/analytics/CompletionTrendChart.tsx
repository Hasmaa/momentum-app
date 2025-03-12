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
  const lineColor = useColorModeValue('#3182CE', '#63B3ED'); // blue.600 / blue.300
  const gridColor = useColorModeValue('#E2E8F0', '#2D3748'); // gray.200 / gray.700
  
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
      <Box textAlign="center" py={10}>
        <Text color="gray.500">
          No task data available. Start completing tasks to see your trends!
        </Text>
      </Box>
    );
  }
  
  return (
    <Box height="300px">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="displayDate" 
            tick={{ fontSize: 12 }}
            tickMargin={10}
            tickFormatter={(value, index) => index % 5 === 0 ? value : ''}
          />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: useColorModeValue('#FFFFFF', '#1A202C'),
              borderColor: useColorModeValue('#E2E8F0', '#2D3748'),
              borderRadius: '8px',
            }}
            formatter={(value) => [`${value} tasks`, 'Completed']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="completed"
            stroke={lineColor}
            strokeWidth={2}
            activeDot={{ r: 8 }}
            name="Completed Tasks"
            dot={{ strokeWidth: 1, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CompletionTrendChart; 