export type WidgetType = 
  | 'stat' 
  | 'progress' 
  | 'table' 
  | 'image' 
  | 'text' 
  | 'timer' 
  | 'banner' 
  | 'links' 
  | 'counter' 
  | 'countup' 
  | 'embed';


// Společný základ pro jakýkoliv widget
export interface BaseWidget {
  id: string;      
  type: WidgetType; 
  title: string;    
}

export interface TableWidget extends BaseWidget {
  type: 'table';
  data: {
    headers: string[];   
    rows: string[][];    
  };
}

export interface ImageWidget extends BaseWidget {
  type: 'image';
  data: {
    imageUrl: string;
    caption?: string;
    width?: number;  
    height?: number; 
  };
}

export interface ChartItem {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface StatWidget extends BaseWidget {
  type: 'stat';
  data: {
    chartType: 'bar' | 'pie';      
    items: ChartItem[];           
    isPinnedToSummary: boolean;   
  };
}

export interface TimerWidget extends BaseWidget {
  type: 'timer';
  data: {
    targetDate: string; 
    label?: string;
  };
}

export interface ProgressWidget extends BaseWidget {
  type: 'progress';
  data: {
    currentValue: number;
    targetValue: number;
    unit?: string;
    isPinnedToSummary: boolean; 
  };
}

export interface Dashboard {
  id: string;      
  title: string;   
  createdAt: number;     
  widgets: DashboardWidget[]; 
  themeColor?: string;
  themeIcon?: string;
}

export interface TextWidget {
  id: string;
  type: 'text';
  title: string;
  data: {
    text: string;
    gridSize?: '1x1' | '2x1' | '1x2' | '2x2' | '3x2' | '4x2';
  };
}

export interface BannerWidget extends BaseWidget {
  type: 'banner';
  data: {
    text: string;
    bgColor: string;
    textColor: string;
    gridSize: '1x1' | '2x1' | '1x2' | '2x2';
    isPinnedToSummary: boolean;
  };
}

export interface LinkItem {
  id: string;
  label: string;
  url: string;
  icon: string; 
}

export interface LinksWidget extends BaseWidget {
  type: 'links';
  data: {
    items: LinkItem[];
    isPinnedToSummary: boolean;
  };
}

export interface CounterWidget {
  id: string;
  type: 'counter';
  title: string;
  data: {
    currentValue: number;
    step: number;
    resetValue: number;
  };
}

export interface CountUpWidget {
  id: string;
  type: 'countup';
  title: string;
  data: {
    startDate: string;
    label?: string;
  };
}

export interface EmbedWidget {
  id: string;
  type: 'embed';
  title: string;
  data: {
    url: string;
    gridSize: '1x1' | '2x1' | '1x2' | '2x2' | '3x2' | '4x2'; // 🚀 Možnosti velikosti
  };
}

export type DashboardWidget =
  | StatWidget
  | ProgressWidget
  | TableWidget
  | ImageWidget
  | TextWidget
  | TimerWidget
  | BannerWidget
  | LinksWidget
  | CounterWidget
  | CountUpWidget
  | EmbedWidget;