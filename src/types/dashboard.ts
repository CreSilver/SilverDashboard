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
  | 'embed'
  | 'list';

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

export type ListMode = 'standard' | 'todo';
export type ListStyleType = 'bullet' | 'numbered' | 'alphabetical';
export interface ListItem {
  id: string;
  text: string;
  completed?: boolean;
  isSpacer?: boolean;
}
// 5. Vnitřní data widgetu seznamu
export interface ListWidgetData {
  mode: ListMode;                  // 'standard' nebo 'todo'
  listStyle?: ListStyleType;       // 'bullet' | 'numbered' | 'alphabetical'
  showPercentage?: boolean;        // true = zobrazit např. "60% dokončeno"
  items: ListItem[];
}
// 6. Samotné rozhraní ListWidgetu na root úrovni
export interface ListWidget {
  id: string;
  type: 'list';
  title: string;
  gridSize?: WidgetGridSize;       // Správa velikosti (např. '2x2')
  isPinnedToSummary?: boolean;     // Připnutí na Hlavní přehled
  data: ListWidgetData;
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
  | EmbedWidget
  | ListWidget;

export interface Dashboard {
  id: string;      
  title: string;   
  createdAt: number;     
  widgets: DashboardWidget[]; 
  themeColor?: string;
  themeIcon?: string;
}