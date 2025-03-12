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

interface TaskStatusBreakdownProps {
  tasks: Task[];
}

const TaskStatusBreakdown: React.FC<TaskStatusBreakdownProps> = ({ tasks }) => {
  // Status colors - enhanced for dark mode visibility
  const statusColors = {
    light: {
      'pending': '#4299E1',      // blue.400
      'in-progress': '#ED8936',  // orange.500
      'completed': '#48BB78',    // green.500
    },
    dark: {
      'pending': '#63B3ED',      // blue.300
      'in-progress': '#F6AD55',  // orange.300
      'completed': '#68D391',    // green.300
    }
  };
  
  // Choose appropriate color scheme based on mode
  const currentColors = useColorModeValue(statusColors.light, statusColors.dark);
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const emptyStateColor = useColorModeValue('gray.500', 'gray.400');
  
  // Status display names
  const statusNames = {
    'pending': 'Pending',
    'in-progress': 'In Progress',
    'completed': 'Completed',
  };
  
  // Calculate status distribution data
  const statusData = useMemo(() => {
    const counts = {
      'pending': 0,
      'in-progress': 0,
      'completed': 0,
    };
    
    // Count tasks by status
    tasks.forEach(task => {
      if (task.status in counts) {
        counts[task.status as keyof typeof counts]++;
      }
    });
    
    // Transform counts into chart data format
    return Object.entries(counts).map(([status, count]) => ({
      name: statusNames[status as keyof typeof statusNames],
      value: count,
      color: currentColors[status as keyof typeof currentColors],
    }));
  }, [tasks, currentColors]);
  
  // If no tasks, show empty state
  if (tasks.length === 0) {
    return (
      <Box textAlign="center" py={10} bg={bgColor} borderRadius="md">
        <Text color={emptyStateColor}>
          No task data available. Create tasks to see status breakdown!
        </Text>
      </Box>
    );
  }
  
  return (
    <Box height="300px" bg={bgColor} borderRadius="md" p={2}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={statusData}
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
            {statusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke={useColorModeValue('#E2E8F0', '#2D3748')} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value} tasks`, 'Count']}
            contentStyle={{
              backgroundColor: useColorModeValue('#FFFFFF', '#1A202C'),
              borderColor: useColorModeValue('#E2E8F0', '#2D3748'),
              borderRadius: '8px',
              color: textColor
            }}
          />
          <Legend formatter={(value) => <span style={{ color: textColor }}>{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default TaskStatusBreakdown; 