import React, { useMemo } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Box, Text, useColorModeValue, Tooltip, VStack } from '@chakra-ui/react';
import { parseISO, isValid, format, subDays, addDays } from 'date-fns';
import { Task } from '../../types';

interface ProductivityHeatmapProps {
  tasks: Task[];
}

// Custom tooltip component to show detailed data
const HeatmapTooltip = ({ date, count }: { date: string, count: number }) => {
  return (
    <VStack
      bg={useColorModeValue('white', 'gray.800')}
      p={2}
      shadow="md"
      borderRadius="md"
      spacing={1}
      align="start"
    >
      <Text fontWeight="bold">{date}</Text>
      <Text>{count} tasks completed</Text>
    </VStack>
  );
};

const ProductivityHeatmap: React.FC<ProductivityHeatmapProps> = ({ tasks }) => {
  // Calculate date range for the heatmap (last 3 months)
  const endDate = new Date();
  const startDate = subDays(endDate, 90); // 90 days back
  
  // Colors for the heatmap
  const colorScale = [
    useColorModeValue('#F7FAFC', '#2D3748'), // No tasks (gray.50 / gray.700)
    useColorModeValue('#BEE3F8', '#2B6CB0'), // 1 task (blue.100 / blue.700)
    useColorModeValue('#90CDF4', '#3182CE'), // 2 tasks (blue.200 / blue.600)
    useColorModeValue('#63B3ED', '#4299E1'), // 3 tasks (blue.300 / blue.500)
    useColorModeValue('#4299E1', '#63B3ED'), // 4 tasks (blue.400 / blue.300)
    useColorModeValue('#3182CE', '#90CDF4'), // 5+ tasks (blue.600 / blue.200)
  ];
  
  // Process task data for the heatmap
  const heatmapData = useMemo(() => {
    // Create an object to store completed tasks by date
    const completedByDate: Record<string, number> = {};
    
    // Count completed tasks for each day
    tasks.forEach(task => {
      if (task.status === 'completed' && task.completedAt) {
        const completedDate = parseISO(task.completedAt);
        
        if (isValid(completedDate)) {
          const dateKey = format(completedDate, 'yyyy-MM-dd');
          
          if (!completedByDate[dateKey]) {
            completedByDate[dateKey] = 0;
          }
          
          completedByDate[dateKey] += 1;
        }
      }
    });
    
    // Convert to the format needed by react-calendar-heatmap
    return Object.entries(completedByDate).map(([date, count]) => ({
      date,
      count,
    }));
  }, [tasks]);
  
  // Custom tooltip content
  const getTooltipContent = (value: { date: string, count: number } | null) => {
    if (!value || !value.date) return null;
    
    const formattedDate = format(parseISO(value.date), 'MMMM d, yyyy');
    return <HeatmapTooltip date={formattedDate} count={value.count} />;
  };
  
  return (
    <Box>
      <style>
        {`
        .react-calendar-heatmap .color-scale-1 { fill: ${colorScale[1]}; }
        .react-calendar-heatmap .color-scale-2 { fill: ${colorScale[2]}; }
        .react-calendar-heatmap .color-scale-3 { fill: ${colorScale[3]}; }
        .react-calendar-heatmap .color-scale-4 { fill: ${colorScale[4]}; }
        .react-calendar-heatmap .color-scale-5 { fill: ${colorScale[5]}; }
        
        .react-calendar-heatmap rect {
          rx: 2;
          ry: 2;
          stroke: ${useColorModeValue('#EDF2F7', '#1A202C')};
          stroke-width: 1;
        }
        `}
      </style>
      
      <Box overflowX="auto" py={4}>
        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={heatmapData}
          showWeekdayLabels={true}
          classForValue={(value) => {
            if (!value || value.count === 0) {
              return 'color-empty';
            }
            // Cap at color-scale-5 for 5+ tasks
            return `color-scale-${Math.min(value.count, 5)}`;
          }}
          tooltipDataAttrs={(value) => {
            if (!value || !value.date) {
              return { 'data-tooltip-id': 'heatmap-tooltip' };
            }
            
            return {
              'data-tooltip-id': 'heatmap-tooltip',
              'data-tooltip-content': `${format(parseISO(value.date), 'MMMM d, yyyy')}: ${value.count} tasks`,
            };
          }}
        />
      </Box>
      
      <Box display="flex" justifyContent="center" mt={4}>
        <Text fontSize="sm" mr={2}>Less</Text>
        {[0, 1, 2, 3, 4, 5].map(level => (
          <Box 
            key={level}
            width="15px"
            height="15px"
            borderRadius="sm"
            bg={level === 0 ? colorScale[0] : colorScale[level]}
            mr={level < 5 ? 1 : 0}
          />
        ))}
        <Text fontSize="sm" ml={2}>More</Text>
      </Box>
    </Box>
  );
};

export default ProductivityHeatmap; 