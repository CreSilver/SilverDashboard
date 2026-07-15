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

export type WidgetGridSize = 
  | '1x1' | '1x2' | '1x3' | '1x4'
  | '2x1' | '2x2' | '2x3' | '2x4'
  | '3x1' | '3x2' | '3x3' | '3x4'
  | '4x1' | '4x2' | '4x3' | '4x4';

export interface BaseWidget {
  id: string;      
  type: WidgetType; 
  title: string;    
  gridSize?: WidgetGridSize;       
  isPinnedToSummary?: boolean;     
}



export interface TableWidget extends BaseWidget {
  type: 'table';
  data: {
    headers: string[];
    rows: string[][];
  };
}

export interface TextWidget extends BaseWidget {
  type: 'text';
  data: {
    text: string;
  };
}

export interface EmbedWidget extends BaseWidget {
  type: 'embed';
  data: {
    url: string;
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
  };
}

export interface BannerWidget extends BaseWidget {
  type: 'banner';
  data: {
    text: string;
    bgColor: string;
    textColor: string;
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
  };
}

export interface CounterWidget extends BaseWidget {
  type: 'counter';
  data: {
    currentValue: number;
    step: number;
    resetValue: number;
  };
}

export interface CountUpWidget extends BaseWidget {
  type: 'countup';
  data: {
    startDate: string;
    label?: string;
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

export interface Dashboard {
  id: string;      
  title: string;   
  createdAt: number;     
  widgets: DashboardWidget[]; 
  themeColor?: string;
  themeIcon?: string;
}