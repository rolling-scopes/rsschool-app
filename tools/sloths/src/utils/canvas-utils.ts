import type { CanvasElement, CanvasPos, CanvasProperties, CanvasRectXY } from '@/common/types';

export const canvasSize = 500;
export const textMargin = 10;

export const initProperties = (scaleMin: number, scaleTrue: number, scaleMax: number): CanvasProperties => {
  return {
    scaleSteps: 1,
    scaleMin,
    scaleTrue,
    scaleMax,
    backgroundTransparent: false,
    backgroundColor: '#777777',
    itemColor: '#222222',
    textColor: '#ffffff',
    strokeColor: '#000000',
    topText: '',
    bottomText: '',
  } as CanvasProperties;
};

export const initElement = (
  top: number,
  bottom: number,
  scaleSteps: number,
  scaleMin: number,
  scaleTrue: number,
  scaleMax: number,
  isResizable = true
): CanvasElement => {
  return {
    isResizable,
    left: 0,
    top,
    bottom,
    scaledLeft: 0,
    scaledTop: top,
    width: canvasSize * scaleSteps,
    height: 0,
    scaledWidth: canvasSize * scaleSteps,
    scaledHeight: 0,
    scaleSteps,
    scaleMin,
    scaleTrue,
    scaleMax,
    isHovered: false,
    isSelected: false,
    isBorderHovered: false,
    isLeftBorderSelected: false,
    isRightBorderSelected: false,
    selectedPos: {} as CanvasPos,
  } as CanvasElement;
};

// draw
export const calcCanvasSizes = (cnv: HTMLCanvasElement, canvasScaleSteps: number) => {
  const canvas = cnv;

  canvas.width = canvasSize * canvasScaleSteps;
  canvas.height = canvasSize * canvasScaleSteps;
};

export const drawBackground = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  canvasProps: CanvasProperties
) => {
  if (!canvasProps.backgroundTransparent) {
    ctx.fillStyle = canvasProps.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
};

export const drawMerchImage = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  color: string
) => {
  const tempCanvas = document.createElement('canvas');
  const tempctx = tempCanvas.getContext('2d');
  if (!tempctx) return;

  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  tempctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, canvas.width, canvas.height);

  tempctx.globalCompositeOperation = 'source-atop';
  tempctx.fillStyle = color;
  tempctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  ctx.drawImage(tempCanvas, 0, 0);
  ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, canvas.width, canvas.height);

  // always clean up: reset compositing to its default
  ctx.globalCompositeOperation = 'source-over';
};

export const calcElementsSizes = (
  img: HTMLImageElement,
  imgCanvasElement: CanvasElement,
  topCanvasElement: CanvasElement,
  bottomCanvasElement: CanvasElement,
  canvasScaleSteps: number
) => {
  let canvasElement = imgCanvasElement;
  if (img) {
    canvasElement.width = img.naturalWidth;
    canvasElement.height = img.naturalHeight;

    canvasElement.scaledWidth = canvasElement.width * canvasElement.scaleSteps * canvasScaleSteps;
    canvasElement.scaledHeight = canvasElement.scaledWidth * (canvasElement.height / canvasElement.width);
  } else {
    canvasElement.width = 0;
    canvasElement.height = 0;
    canvasElement.scaledWidth = 0;
    canvasElement.scaledHeight = 0;
  }

  canvasElement = topCanvasElement;
  canvasElement.scaledWidth = canvasElement.width * canvasScaleSteps;

  canvasElement = bottomCanvasElement;
  canvasElement.scaledWidth = canvasElement.width * canvasScaleSteps;
};

export const calcElementsPosition = (layers: CanvasElement[], canvasScaleSteps: number) => {
  layers.forEach((el) => {
    const canvasElement = el;

    canvasElement.scaledLeft = canvasElement.left * canvasScaleSteps;
    canvasElement.scaledTop = canvasElement.top * canvasScaleSteps;
    canvasElement.scaledBottom = canvasElement.bottom * canvasScaleSteps;
  });
};

export const getElRectXY = (el: CanvasElement): CanvasRectXY => {
  return {
    x1: el.scaledLeft,
    x2: el.scaledLeft + el.scaledWidth,
    y1: el.scaledTop,
    y2: el.scaledTop + el.scaledHeight,
  } as CanvasRectXY;
};

export const invertHex = (color: string, backgroundTransparent = false): string => {
  if (backgroundTransparent) return 'gray';

  let hex = color;
  if (hex.indexOf('#') === 0) {
    hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#FFFFFF';
};

export const drawBorder = (el: CanvasElement, ctx: CanvasRenderingContext2D, color: string) => {
  if (el.isHovered || el.isSelected) {
    const elXY = getElRectXY(el);

    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(elXY.x1, elXY.y1);
    ctx.lineTo(elXY.x2, elXY.y1);
    ctx.lineTo(elXY.x2, elXY.y2);
    ctx.lineTo(elXY.x1, elXY.y2);
    ctx.closePath();
    ctx.stroke();
  }
};

// mouse handlers
export const getMousePos = (evt: MouseEvent, canvas: HTMLCanvasElement): CanvasPos => {
  const rect = canvas.getBoundingClientRect(); // abs. size of element
  const scaleX = canvas.width / rect.width; // relationship bitmap vs. element for X
  const scaleY = canvas.height / rect.height; // relationship bitmap vs. element for Y

  return {
    x: (evt.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) * scaleY, // been adjusted to be relative to element
  } as CanvasPos;
};

export const moveElement = (mousePos: CanvasPos, el: CanvasElement, canvasScaleSteps: number) => {
  const canvasElement = el;
  const dx = mousePos.x - canvasElement.selectedPos.x;
  const dy = mousePos.y - canvasElement.selectedPos.y;
  const elXY = getElRectXY(el);

  let isSelected = false;
  if (canvasElement.isLeftBorderSelected) {
    if (mousePos.y >= elXY.y1 && mousePos.y <= elXY.y2) {
      canvasElement.left += dx / canvasScaleSteps;
      canvasElement.width -= dx / canvasScaleSteps;
      isSelected = true;
    } else {
      canvasElement.isLeftBorderSelected = false;
    }
  } else if (canvasElement.isRightBorderSelected) {
    if (mousePos.y >= elXY.y1 && mousePos.y <= elXY.y2) {
      canvasElement.width += dx / canvasScaleSteps;
      isSelected = true;
    } else {
      canvasElement.isRightBorderSelected = false;
    }
  } else if (canvasElement.isSelected) {
    canvasElement.left += dx / canvasScaleSteps;
    canvasElement.top += dy / canvasScaleSteps;
    canvasElement.bottom += dy / canvasScaleSteps;
    isSelected = true;
  } else {
    canvasElement.isBorderHovered =
      (mousePos.x >= elXY.x1 && mousePos.x <= elXY.x1 + 2 && mousePos.y >= elXY.y1 && mousePos.y <= elXY.y2) ||
      (mousePos.x >= elXY.x2 - 2 && mousePos.x <= elXY.x2 && mousePos.y >= elXY.y1 && mousePos.y <= elXY.y2);
    canvasElement.isHovered =
      mousePos.x >= elXY.x1 && mousePos.x <= elXY.x2 && mousePos.y >= elXY.y1 && mousePos.y <= elXY.y2;
  }

  if (isSelected) {
    canvasElement.selectedPos.x = mousePos.x;
    canvasElement.selectedPos.y = mousePos.y;
  }
};

export const moveElements = (
  e: MouseEvent,
  canvas: HTMLCanvasElement,
  layers: CanvasElement[],
  canvasScaleSteps: number
) => {
  const mousePos = getMousePos(e, canvas);

  const selected = layers.filter((el) => el.isSelected);

  if (selected.length) {
    // move selected only
    moveElement(mousePos, selected[0], canvasScaleSteps);
  } else {
    // move top of layers
    let isHovered = false;

    for (let i = layers.length - 1; i >= 0; i -= 1) {
      const el = layers[i];

      if (isHovered) {
        el.isHovered = false;
      } else {
        moveElement(mousePos, el, canvasScaleSteps);
        isHovered = el.isHovered;
      }
    }
  }
};

export const selectElement = (mousePos: CanvasPos, el: CanvasElement) => {
  const canvasElement = el;

  const elXY = getElRectXY(el);

  const isLeftBorderSelected =
    mousePos.x >= elXY.x1 && mousePos.x <= elXY.x1 + 2 && mousePos.y >= elXY.y1 && mousePos.y <= elXY.y2;

  const isRightBorderSelected =
    mousePos.x >= elXY.x2 - 2 && mousePos.x <= elXY.x2 && mousePos.y >= elXY.y1 && mousePos.y <= elXY.y2;

  const isSelected = mousePos.x >= elXY.x1 && mousePos.x <= elXY.x2 && mousePos.y >= elXY.y1 && mousePos.y <= elXY.y2;

  canvasElement.isLeftBorderSelected = isLeftBorderSelected;
  canvasElement.isRightBorderSelected = isRightBorderSelected && !isLeftBorderSelected;
  canvasElement.isSelected = isSelected && !isLeftBorderSelected && !isRightBorderSelected;

  if (isSelected || isLeftBorderSelected || isRightBorderSelected) {
    canvasElement.selectedPos = { ...mousePos };
  }
};

export const selectElements = (e: MouseEvent, canvas: HTMLCanvasElement, layers: CanvasElement[]) => {
  const mousePos = getMousePos(e, canvas);

  let isSelected = false;

  for (let i = layers.length - 1; i >= 0; i -= 1) {
    const el = layers[i];

    if (isSelected) {
      el.isLeftBorderSelected = false;
      el.isRightBorderSelected = false;
      el.isSelected = false;
    } else {
      selectElement(mousePos, el);
      isSelected = el.isSelected || el.isLeftBorderSelected || el.isRightBorderSelected;
    }
  }
};

export const deselectElements = (layers: CanvasElement[]) => {
  layers.forEach((el) => {
    const canvasElement = el;

    canvasElement.isSelected = false;
    canvasElement.isLeftBorderSelected = false;
    canvasElement.isRightBorderSelected = false;
    canvasElement.selectedPos = {} as CanvasPos;
  });
};

export const unhoverElements = (layers: CanvasElement[]) => {
  layers.forEach((el) => {
    const canvasElement = el;

    canvasElement.isHovered = false;
    canvasElement.isBorderHovered = false;
  });
};

// scaling
export const scaleUpCanvas = (props: CanvasProperties) => {
  const canvasProps = props;
  canvasProps.scaleSteps = Math.min(canvasProps.scaleMax, canvasProps.scaleSteps + 0.02);
};

export const scaleTrueCanvas = (props: CanvasProperties, layers: CanvasElement[]) => {
  const canvasProps = props;
  canvasProps.scaleSteps = 1;

  layers.forEach((el) => {
    const canvasElement = el;
    canvasElement.scaleSteps = canvasElement.scaleTrue;
  });
};

export const scaleDownCanvas = (props: CanvasProperties) => {
  const canvasProps = props;
  canvasProps.scaleSteps = Math.max(canvasProps.scaleMin, canvasProps.scaleSteps - 0.02);
};

export const scalingElements = (e: WheelEvent, layers: CanvasElement[], props: CanvasProperties) => {
  if (e.deltaY === 0) return;

  const dStep = e.deltaY > 0 ? 0.05 : -0.05;

  let isHovered = false;

  layers.forEach((el) => {
    if (el.isHovered) {
      isHovered = true;
      const canvasElement = el;
      canvasElement.scaleSteps = Math.max(canvasElement.scaleMin, canvasElement.scaleSteps + dStep);
    }
  });

  if (!isHovered) {
    if (dStep > 0) {
      scaleUpCanvas(props);
    } else if (dStep < 0) scaleDownCanvas(props);
  }
};

// text
export const drawTextLine = (ctx: CanvasRenderingContext2D, line: string, x: number, y: number, isStroked: boolean) => {
  if (isStroked) ctx.strokeText(line, x, y);
  ctx.fillText(line, x, y);
};

export const drawTextMultiLineDown = (
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  text: string,
  canvasScaleSteps: number,
  fontSize: number,
  isStroked: boolean
) => {
  const { scaledLeft, scaledTop } = el;
  const width = el.scaledWidth;
  const x = width / 2 + scaledLeft;

  const words = text.split(' ');
  let line = '';
  let y = scaledTop + fontSize * 0.1;
  let textHeight = fontSize;

  words.forEach((word, index) => {
    const testLine = `${line + word} `;
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > width && index > 0) {
      drawTextLine(ctx, line.trim(), x, y, isStroked);
      line = `${word} `;
      y += fontSize;
      textHeight += fontSize;
    } else {
      line = testLine;
    }
  });
  drawTextLine(ctx, line.trim(), x, y, isStroked);

  const canvasElement = el;

  canvasElement.width = width / canvasScaleSteps;
  canvasElement.height = textHeight;
  canvasElement.scaledWidth = width;
  canvasElement.scaledHeight = textHeight;
};

export const drawTextDown = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  canvasProps: CanvasProperties,
  text: string,
  el: CanvasElement,
  isStroked = false
) => {
  const { height } = canvas;

  ctx.fillStyle = canvasProps.textColor;
  if (isStroked) ctx.strokeStyle = canvasProps.strokeColor;
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';

  const fontSize = Math.floor((height * el.scaleSteps) / 10);
  ctx.lineWidth = Math.floor(fontSize / 5);
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textBaseline = 'top';
  drawTextMultiLineDown(ctx, el, text, canvasProps.scaleSteps, fontSize, isStroked);
};

export const drawTextMultiLineUp = (
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  text: string,
  canvasScaleSteps: number,
  fontSize: number,
  isStroked: boolean
) => {
  const { scaledLeft, scaledBottom } = el;
  const width = el.scaledWidth;
  const x = width / 2 + scaledLeft;

  const words = text.split(' ').reverse();
  let line = '';
  let y = scaledBottom + fontSize * 0.1;
  let textHeight = fontSize;

  words.forEach((word, index) => {
    const testLine = ` ${word + line}`;
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > width && index > 0) {
      drawTextLine(ctx, line.trim(), x, y, isStroked);
      line = ` ${word}`;
      y -= fontSize;
      textHeight += fontSize;
    } else {
      line = testLine;
    }
  });
  drawTextLine(ctx, line.trim(), x, y, isStroked);

  const canvasElement = el;
  canvasElement.top = (scaledBottom - textHeight) / canvasScaleSteps;
  canvasElement.scaledTop = canvasElement.top * canvasScaleSteps;
  canvasElement.width = width / canvasScaleSteps;
  canvasElement.height = textHeight;
  canvasElement.scaledWidth = width;
  canvasElement.scaledHeight = textHeight;
};

export const drawTextUp = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  canvasProps: CanvasProperties,
  text: string,
  el: CanvasElement,
  isStroked = false
) => {
  const { height } = canvas;

  ctx.fillStyle = canvasProps.textColor;
  if (isStroked) ctx.strokeStyle = canvasProps.strokeColor;
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';

  const fontSize = Math.floor((height * el.scaleSteps) / 10);
  ctx.lineWidth = Math.floor(fontSize / 5);
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textBaseline = 'bottom';
  drawTextMultiLineUp(ctx, el, text, canvasProps.scaleSteps, fontSize, isStroked);
};

// others
export const centeringElements = (
  imgCanvasElement: CanvasElement,
  topCanvasElement: CanvasElement,
  bottomCanvasElement: CanvasElement,
  scaleSteps: number,
  toImg = false
) => {
  let canvasElement = imgCanvasElement;
  canvasElement.left = (canvasSize - canvasElement.scaledWidth / scaleSteps) / 2;
  canvasElement.top = (canvasSize - canvasElement.scaledHeight / scaleSteps) / 2;

  canvasElement = topCanvasElement;
  canvasElement.left = (canvasSize - canvasElement.scaledWidth / scaleSteps) / 2;
  if (toImg) {
    canvasElement.bottom = imgCanvasElement.top;
  } else {
    canvasElement.top = textMargin;
  }

  canvasElement = bottomCanvasElement;
  canvasElement.left = (canvasSize - canvasElement.scaledWidth / scaleSteps) / 2;
  if (toImg) {
    canvasElement.top = imgCanvasElement.top + imgCanvasElement.scaledHeight / scaleSteps;
  } else {
    canvasElement.top = canvasSize - textMargin - canvasElement.scaledHeight / scaleSteps;
    canvasElement.bottom = canvasSize - textMargin;
  }
};

export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const image = new Image();
    image.addEventListener('load', () => {
      resolve(image);
    });
    image.src = url;
  });
};

export const getCursor = (layers: CanvasElement[]): string => {
  const borderHovered = layers.filter((el) => el.isBorderHovered);
  if (borderHovered.length > 0 && borderHovered[0].isResizable) return 'w-resize';

  const isHovered = layers.filter((el) => el.isHovered).length > 0;
  if (isHovered) return 'move';

  return 'auto';
};
