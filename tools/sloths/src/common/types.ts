export type RequestError = {
  statusCode: number;
  message: string | string[];
  error: string;
};

export type APIRequestResult<T> = {
  ok: boolean;
  status: number;
  data: T;
  error: RequestError;
  headers: Headers;
};

export type GetList<T> = {
  count: number;
  items: T[];
};

export interface API<T> {
  getAllList(): Promise<APIRequestResult<T[]>>;

  getByOptions(options: QueryStringOptions): Promise<APIRequestResult<GetList<T>>>;

  getAll(
    page: number,
    limit: number,
    order: string,
    searchText: string,
    filter: string,
    userId: string
  ): Promise<APIRequestResult<GetList<T>>>;

  getById(id: string): Promise<APIRequestResult<T>>;

  create(body: T): Promise<APIRequestResult<T>>;

  updateById(id: string, body: T): Promise<APIRequestResult<Partial<T>>>;

  deleteById(id: string): Promise<APIRequestResult<T>>;
}

export type Tags = Tag[];
export type Tag = string;

export type Sloths = Sloth[];
export type Sloth = {
  [keyof: string]: string | boolean | Tags;
  id: string;
  name: string;
  description: string;
  tags: Tags;
  checked: boolean;
  image: string;
};
export type SlothTags = {
  id: string;
  caption: string;
  description: string;
  image_url: string;
  rating: number;
  createdAt: number;
  tags: string;
};
export type SlothRating = {
  slothId: string;
  userId: string;
  rate: number;
};
export type MetadataSloths = {
  stickers: MetadataSloth[];
};
export type MetadataSloth = {
  id: string;
  name: string;
  description: string;
  tags: Tags;
};

export type UserRate = {
  rate: number;
};

export type GameResults = GameResult[];
export type GameResult = {
  [keyof: string]: string | number | undefined | {};
  id?: string;
  gameId?: string;
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
  gameId: string;
};

export type ErrorDescription = {
  code: string;
  message: string;
};

export type QueryStringOptions = {
  page?: string;
  limit?: string;
  order?: string;
  searchText?: string;
  filter?: string;
  userId?: string;
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
