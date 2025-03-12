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
  // Priority colors - enhanced for dark mode visibility
  const priorityColors = {
    light: {
      low: '#48BB78',      // green.500
      medium: '#ECC94B',   // yellow.400
      high: '#E53E3E',     // red.500
    },
    dark: {
      low: '#68D391',      // green.300
      medium: '#F6E05E',   // yellow.300 
      high: '#FC8181',     // red.300
    }
  };
  
  // Choose appropriate color scheme based on mode
  const currentColors = useColorModeValue(priorityColors.light, priorityColors.dark);
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const emptyStateColor = useColorModeValue('gray.500', 'gray.400');
  
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
      color: currentColors[priority as keyof typeof currentColors],
    }));
  }, [tasks, currentColors]);
  
  // If no tasks, show empty state
  if (tasks.length === 0) {
    return (
      <Box textAlign="center" py={10} bg={bgColor} borderRadius="md">
        <Text color={emptyStateColor}>
          No task data available. Create tasks to see priority distribution!
        </Text>
      </Box>
    );
  }
  
  return (
    <Box height="300px" bg={bgColor} borderRadius="md" p={2}>
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
              <Cell key={`cell-${index}`} fill={entry.color} stroke={useColorModeValue('#E2E8F0', '#2D3748')} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value} tasks`, 'Count']}
            contentStyle={{
              backgroundColor: useColorModeValue('#FFFFFF', '#1A202C'),
              borderColor: useColorModeValue('#E2E8F0', '#2D3748'),
              borderRadius: '8px',
              color: textColor,
            }}
          />
          <Legend formatter={(value) => <span style={{ color: textColor }}>{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PriorityDistribution; 