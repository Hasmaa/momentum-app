declare module 'react-calendar-heatmap' {
  import React from 'react';

  export interface CalendarHeatmapProps {
    values: Array<{
      date: string;
      count: number;
      [key: string]: any;
    }>;
    startDate?: Date;
    endDate?: Date;
    showMonthLabels?: boolean;
    showWeekdayLabels?: boolean;
    showOutOfRangeDays?: boolean;
    horizontal?: boolean;
    gutterSize?: number;
    onClick?: (value: any) => void;
    classForValue?: (value: any) => string;
    tooltipDataAttrs?: (value: any) => { [key: string]: string } | null;
    titleForValue?: (value: any) => string;
    monthLabels?: string[];
    weekdayLabels?: string[];
    transformDayElement?: (element: React.ReactElement, value: any, index: number) => React.ReactElement;
  }

  const CalendarHeatmap: React.FC<CalendarHeatmapProps>;
  
  export default CalendarHeatmap;
} 