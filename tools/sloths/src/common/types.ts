export type Sloth = {
  [keyof: string]: string | boolean | string[];
  id: string;
  name: string;
  description: string;
  tags: string[];
  checked: boolean;
  image: string;
};
export type MetadataSloths = {
  stickers: MetadataSloth[];
};
export type MetadataSloth = {
  id: string;
  name: string;
  description: string;
  tags: string[];
};

export type GameResult = {
  id?: string;
  count: number;
  time: number;
  createdAt: number;
  user?: {
    github: string;
    id: string;
    name: string;
  };
};

export type MemoryLevel = {
  level: string;
  n: number;
};

export type QueryStringOptions = {
  page?: string;
  limit?: string;
  order?: string;
  searchText?: string;
  filter?: string;
};

export type SelectOptions = {
  value: string;
  text: string;
  type: string;
};

export type TagCloud = Set<string>;

export type PageSettings = {
  currPage: number;
  perPage: number;
  searchText: string;
  selected: string[];
  sorting: string;
  checked?: string[];
};

export type CanvasProperties = {
  scaleSteps: number;
  scaleMin: number;
  scaleTrue: number;
  scaleMax: number;
  backgroundTransparent: boolean;
  backgroundColor: string;
  itemColor: string;
  textColor: string;
  strokeColor: string;
};

export type CanvasElement = {
  isResizable: boolean;
  text: string;
  left: number;
  top: number;
  bottom: number;
  scaledLeft: number;
  scaledTop: number;
  scaledBottom: number;
  width: number;
  height: number;
  scaleSteps: number;
  scaleMin: number;
  scaleTrue: number;
  scaleMax: number;
  scaledWidth: number;
  scaledHeight: number;
  isHovered: boolean;
  isSelected: boolean;
  isBorderHovered: boolean;
  isLeftBorderSelected: boolean;
  isRightBorderSelected: boolean;
  selectedPos: CanvasPos;
};

export type CanvasPos = {
  x: number;
  y: number;
};

export type CanvasRectXY = {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};
