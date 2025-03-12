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
  
  // Background and text colors for dark mode
  const emptyColor = useColorModeValue('#F7FAFC', '#2D3748'); // gray.50 / gray.700
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const bgColor = useColorModeValue('white', 'gray.800');
  
  // Enhanced color scale for better dark mode visibility
  const colorScale = {
    light: [
      '#F7FAFC', // No tasks (gray.50)
      '#BEE3F8', // 1 task (blue.100)
      '#90CDF4', // 2 tasks (blue.200)
      '#63B3ED', // 3 tasks (blue.300)
      '#4299E1', // 4 tasks (blue.400)
      '#3182CE', // 5+ tasks (blue.600)
    ],
    dark: [
      '#2D3748', // No tasks (gray.700)
      '#2B6CB0', // 1 task (blue.700)
      '#3182CE', // 2 tasks (blue.600)
      '#4299E1', // 3 tasks (blue.500)
      '#63B3ED', // 4 tasks (blue.300)
      '#90CDF4', // 5+ tasks (blue.200)
    ]
  };
  
  // Get the current color scale based on mode
  const currentColorScale = useColorModeValue(colorScale.light, colorScale.dark);
  
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
    <Box bg={bgColor} borderRadius="md" p={4}>
      <style>
        {`
        .react-calendar-heatmap .color-scale-1 { fill: ${currentColorScale[1]}; }
        .react-calendar-heatmap .color-scale-2 { fill: ${currentColorScale[2]}; }
        .react-calendar-heatmap .color-scale-3 { fill: ${currentColorScale[3]}; }
        .react-calendar-heatmap .color-scale-4 { fill: ${currentColorScale[4]}; }
        .react-calendar-heatmap .color-scale-5 { fill: ${currentColorScale[5]}; }
        
        .react-calendar-heatmap .color-empty { fill: ${emptyColor}; }
        
        .react-calendar-heatmap rect {
          rx: 2;
          ry: 2;
          stroke: ${useColorModeValue('#EDF2F7', '#1A202C')};
          stroke-width: 1;
        }
        
        .react-calendar-heatmap text {
          fill: ${useColorModeValue('#4A5568', '#CBD5E0')};
          font-size: 0.7em;
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
        <Text fontSize="sm" mr={2} color={textColor}>Less</Text>
        {[0, 1, 2, 3, 4, 5].map(level => (
          <Box 
            key={level}
            width="15px"
            height="15px"
            borderRadius="sm"
            bg={level === 0 ? currentColorScale[0] : currentColorScale[level]}
            mr={level < 5 ? 1 : 0}
            borderWidth="1px"
            borderColor={useColorModeValue('gray.200', 'gray.600')}
          />
        ))}
        <Text fontSize="sm" ml={2} color={textColor}>More</Text>
      </Box>
    </Box>
  );
};

export default ProductivityHeatmap; 