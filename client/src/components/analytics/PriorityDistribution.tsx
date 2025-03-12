import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import { Task } from '../../types';

interface PriorityDistributionProps {
  tasks: Task[];
}

const PriorityDistribution: React.FC<PriorityDistributionProps> = ({ tasks }) => {
  // Priority colors
  const priorityColors = {
    low: useColorModeValue('#48BB78', '#68D391'),      // green.500 / green.300
    medium: useColorModeValue('#ECC94B', '#F6E05E'),   // yellow.400 / yellow.300
    high: useColorModeValue('#E53E3E', '#FC8181'),     // red.500 / red.300
  };
  
  // Calculate priority distribution data
  const priorityData = useMemo(() => {
    const counts = {
      low: 0,
      medium: 0,
      high: 0,
    };
    
    // Count tasks by priority
    tasks.forEach(task => {
      if (task.priority in counts) {
        counts[task.priority as keyof typeof counts]++;
      }
    });
    
    // Transform counts into chart data format
    return Object.entries(counts).map(([priority, count]) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1), // Capitalize
      value: count,
      color: priorityColors[priority as keyof typeof priorityColors],
    }));
  }, [tasks, priorityColors]);
  
  // If no tasks, show empty state
  if (tasks.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="gray.500">
          No task data available. Create tasks to see priority distribution!
        </Text>
      </Box>
    );
  }
  
  return (
    <Box height="300px">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={priorityData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={40}
            dataKey="value"
            label={({ name, percent }) => 
              percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
            }
          >
            {priorityData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value} tasks`, 'Count']}
            contentStyle={{
              backgroundColor: useColorModeValue('#FFFFFF', '#1A202C'),
              borderColor: useColorModeValue('#E2E8F0', '#2D3748'),
              borderRadius: '8px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PriorityDistribution; 