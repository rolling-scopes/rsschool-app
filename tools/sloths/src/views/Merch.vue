<template>
  <div class="merch">
    <div class="merch__list list-aside">
      <h3>{{ $t('merch.description') }}</h3>
      <div class="merch__images">
        <img
          ref="imgs"
          v-for="(item, index) in images"
          :key="index"
          :src="getImg(index)"
          alt="image"
          object-fit="contain"
          class="merch__image"
          @click="updImage(index)"
        />
      </div>
    </div>
    <div class="merch__generator list-main">
      <div class="merch__merch">
        <img
          ref="merch"
          v-for="(item, index) in merch"
          :key="index"
          :src="getMerch(index)"
          alt="merch"
          object-fit="contain"
          class="merch__image"
          @click="updMerch(index)"
        />
      </div>
      <div class="merch__settings">
        <div class="merch__property">
          <label class="merch__label" for="top">{{ $t('create.top') }}</label>
          <input type="text" class="merch__text" id="top" v-model="topText" @input="draw()" />
        </div>
        <div class="merch__property">
          <label class="merch__label" for="bottom">{{ $t('create.bottom') }}</label>
          <input type="text" class="merch__text" id="bottom" v-model="bottomText" @input="draw()" />
        </div>
      </div>
      <div class="merch__settings-row">
        <div class="merch__settings">
          <div class="merch__property">
            <label class="merch__label" for="color">{{ $t('merch.color') }}</label>
            <input type="color" id="color" class="merch__color" v-model="textColor" @input="draw()" />
          </div>
          <div class="merch__property">
            <label class="merch__label" for="backgroundColor">{{ $t('merch.backgroundColor') }}</label>
            <input type="color" id="itemColor" class="merch__color" v-model="itemColor" @input="draw()" />
          </div>
        </div>
      </div>

      <div class="merch__canvas-wrapper">
        <div class="merch__control-buttons">
          <custom-btn
            :text="$t('btn.download')"
            imgPath="icon"
            className="btn btn-icon icon-download"
            @click="saveImage"
          ></custom-btn>
          <div class="merch__control-buttons-scale">
            <custom-btn
              :text="$t('btn.scaleUp')"
              imgPath="icon"
              className="btn btn-icon icon-plus"
              @click="scaleUpCanvas()"
            ></custom-btn>
            <custom-btn
              :text="$t('btn.trueSize')"
              imgPath="icon"
              className="btn btn-icon icon-true"
              @click="scaleTrueCanvas()"
            ></custom-btn>
            <custom-btn
              :text="$t('btn.center')"
              imgPath="icon"
              className="btn btn-icon icon-center"
              @click="centering"
            ></custom-btn>
            <custom-btn
              :text="$t('btn.scaleDown')"
              imgPath="icon"
              className="btn btn-icon icon-minus"
              @click="scaleDownCanvas()"
            ></custom-btn>
          </div>
          <custom-btn
            :text="$t('btn.copy')"
            imgPath="icon"
            className="btn btn-icon icon-copy"
            @click="copyImage"
          ></custom-btn>
        </div>
        <canvas
          class="merch__canvas"
          ref="canvas"
          @mousemove="handleMouseMove"
          @mousedown="handleMouseDown"
          @mouseup="handleMouseUp"
          @mouseout="handleMouseOut"
          @wheel="handleWheel"
        >
        </canvas>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CustomBtn from '@/components/buttons/CustomBtn.vue';
import usePagesStore from '@/stores/pages-store';
import useCleanedStore from '@/stores/cleaned';
import type { CanvasElement, CanvasPos, CanvasRectXY } from '@/common/types';

const { cleanedFilelist } = useCleanedStore();
const { getPageMerchState, setPageMerchState } = usePagesStore();
const canvasSize = 500;
const textMargin = 100;

export default defineComponent({
  name: 'MerchView',

  components: {
    CustomBtn,
  },

  data() {
    return {
      images: [] as string[],
      indexMeme: 0,
      merch: [] as string[],
      indexMerch: 0,
      canvas: {} as HTMLCanvasElement,
      canvasScaleSteps: 1,
      ctx: {} as CanvasRenderingContext2D,
      imgMeme: {} as HTMLImageElement,
      imgMerch: {} as HTMLImageElement,
      itemColor: '#999999',
      topText: '',
      bottomText: '',
      textColor: '#000000',
      imgCanvasElement: this.initCanvasElement(0, 0, false),
      topCanvasElement: this.initCanvasElement(textMargin, 0, true),
      bottomCanvasElement: this.initCanvasElement(canvasSize - textMargin, 0, true),
      layers: [] as CanvasElement[],
    };
  },

  async mounted() {
    this.getImages();
    const loaded = this.loadStore();

    const { canvas } = this.$refs;
    if (!(canvas instanceof HTMLCanvasElement)) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.canvas = canvas;
    this.ctx = ctx;

    const imageMerch = this.loadImage(this.merch[this.indexMerch]);
    const imageMeme = this.loadImage(this.images[this.indexMeme]);

    [this.imgMerch, this.imgMeme] = await Promise.all([imageMerch, imageMeme]);

    this.calcCanvasSizes();
    this.calcImgSizes();
    if (!loaded) this.centering();

    // order of layers, index is z-index
    this.layers[0] = this.imgCanvasElement;
    this.layers[1] = this.topCanvasElement;
    this.layers[2] = this.bottomCanvasElement;

    this.draw();
  },

  beforeRouteLeave() {
    setPageMerchState(JSON.stringify(this.$data));
  },

  computed: {
    getCursor() {
      const borderHovered = this.layers.filter((el) => el.isBorderHovered);
      if (borderHovered.length > 0 && borderHovered[0].isResizable) return 'w-resize';

      const isHovered = this.layers.filter((el) => el.isHovered).length > 0;
      if (isHovered) return 'move';

      return 'auto';
    },
  },

  methods: {
    getImages() {
      this.images = cleanedFilelist;
      this.merch = [
        './img/merch/tshirt.png',
        './img/merch/hoodie.png',
        './img/merch/mug.png',
        './img/merch/thermo.png',
      ];
    },

    getImg(i: number): string {
      return this.images[i];
    },

    getMerch(i: number): string {
      return this.merch[i];
    },

    loadImage(url: string): Promise<HTMLImageElement> {
      return new Promise((resolve) => {
        const image = new Image();
        image.addEventListener('load', () => {
          resolve(image);
        });
        image.src = url;
      });
    },

    initCanvasElement(top: number, bottom: number, isResizable: boolean): CanvasElement {
      return {
        isResizable,
        left: 0,
        top,
        bottom,
        scaledLeft: 0,
        scaledTop: top,
        width: canvasSize / 2,
        height: 0,
        scaledWidth: canvasSize / 2,
        scaledHeight: 0,
        scaleSteps: 0.5,
        isHovered: false,
        isSelected: false,
        isBorderHovered: false,
        isLeftBorderSelected: false,
        isRightBorderSelected: false,
        selectedPos: {} as CanvasPos,
      } as CanvasElement;
    },

    scaleUpCanvas() {
      this.canvasScaleSteps = Math.min(1.5, this.canvasScaleSteps + 0.02);

      this.draw();
    },

    scaleTrueCanvas() {
      this.canvasScaleSteps = 1;
      this.layers.forEach((el) => this.scaleTrueEl(el));

      this.draw();
    },

    scaleDownCanvas() {
      this.canvasScaleSteps = Math.max(0.5, this.canvasScaleSteps - 0.02);

      this.draw();
    },

    scaleUpEl(el: CanvasElement) {
      const canvasElement = el;
      canvasElement.scaleSteps = Math.min(2, canvasElement.scaleSteps + 0.05);
    },

    scaleTrueEl(el: CanvasElement) {
      const canvasElement = el;
      canvasElement.scaleSteps = 0.5;
    },

    scaleDownEl(el: CanvasElement) {
      const canvasElement = el;
      canvasElement.scaleSteps = Math.max(0.1, canvasElement.scaleSteps - 0.05);
    },

    centering() {
      this.imgCanvasElement.left = (canvasSize - this.imgCanvasElement.scaledWidth / this.canvasScaleSteps) / 2;
      this.imgCanvasElement.top = (canvasSize - this.imgCanvasElement.scaledHeight / this.canvasScaleSteps) / 2;

      this.topCanvasElement.left = (canvasSize - this.topCanvasElement.scaledWidth / this.canvasScaleSteps) / 2;
      this.topCanvasElement.top =
        this.imgCanvasElement.top -
        (this.topCanvasElement.scaledHeight ||
          Math.floor((this.canvas.height * this.topCanvasElement.scaleSteps) / 10)) /
          this.canvasScaleSteps;

      this.bottomCanvasElement.left = (canvasSize - this.bottomCanvasElement.scaledWidth / this.canvasScaleSteps) / 2;
      this.bottomCanvasElement.top =
        this.imgCanvasElement.top + this.imgCanvasElement.scaledHeight / this.canvasScaleSteps;

      this.draw();
    },

    draw() {
      this.calcCanvasSizes();

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.drawMerchImage();

      this.calcImgSizes();

      this.calcElPosition();

      this.ctx.drawImage(
        this.imgMeme,
        0,
        0,
        this.imgCanvasElement.width,
        this.imgCanvasElement.height,
        this.imgCanvasElement.scaledLeft,
        this.imgCanvasElement.scaledTop,
        this.imgCanvasElement.scaledWidth,
        this.imgCanvasElement.scaledHeight
      );

      this.drawText(this.ctx);

      this.layers.forEach((el) => this.drawBorder(el));
    },

    calcCanvasSizes() {
      this.canvas.width = canvasSize * this.canvasScaleSteps;
      this.canvas.height = canvasSize * this.canvasScaleSteps;
    },

    drawMerchImage() {
      const tempCanvas = document.createElement('canvas');
      const tempctx = tempCanvas.getContext('2d');
      if (!tempctx) return;

      tempCanvas.width = this.canvas.width;
      tempCanvas.height = this.canvas.height;
      tempctx.drawImage(
        this.imgMerch,
        0,
        0,
        this.imgMerch.naturalWidth,
        this.imgMerch.naturalHeight,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );

      tempctx.globalCompositeOperation = 'source-atop';
      tempctx.fillStyle = this.itemColor;
      tempctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      this.ctx.drawImage(tempCanvas, 0, 0);
      this.ctx.globalCompositeOperation = 'overlay';
      this.ctx.drawImage(
        this.imgMerch,
        0,
        0,
        this.imgMerch.naturalWidth,
        this.imgMerch.naturalHeight,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );

      // always clean up: reset compositing to its default
      this.ctx.globalCompositeOperation = 'source-over';
    },

    calcImgSizes() {
      if (this.imgMeme) {
        this.imgCanvasElement.width = this.imgMeme.naturalWidth;
        this.imgCanvasElement.height = this.imgMeme.naturalHeight;

        this.imgCanvasElement.scaledWidth =
          this.imgCanvasElement.width * this.imgCanvasElement.scaleSteps * this.canvasScaleSteps;
        this.imgCanvasElement.scaledHeight =
          this.imgCanvasElement.scaledWidth * (this.imgCanvasElement.height / this.imgCanvasElement.width);
      } else {
        this.imgCanvasElement.width = 0;
        this.imgCanvasElement.height = 0;
        this.imgCanvasElement.scaledWidth = 0;
        this.imgCanvasElement.scaledHeight = 0;
      }
    },

    calcElPosition() {
      this.layers.forEach((el) => {
        const canvasElement = el;

        canvasElement.scaledLeft = canvasElement.left * this.canvasScaleSteps;
        canvasElement.scaledTop = canvasElement.top * this.canvasScaleSteps;
        canvasElement.scaledBottom = canvasElement.bottom * this.canvasScaleSteps;
      });
    },

    getElRectXY(el: CanvasElement): CanvasRectXY {
      return {
        x1: el.scaledLeft,
        x2: el.scaledLeft + el.scaledWidth,
        y1: el.scaledTop,
        y2: el.scaledTop + el.scaledHeight,
      } as CanvasRectXY;
    },

    drawBorder(el: CanvasElement) {
      if (el.isHovered || el.isSelected) {
        const elXY = this.getElRectXY(el);

        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = this.invertHex(this.itemColor);
        this.ctx.beginPath();
        this.ctx.moveTo(elXY.x1, elXY.y1);
        this.ctx.lineTo(elXY.x2, elXY.y1);
        this.ctx.lineTo(elXY.x2, elXY.y2);
        this.ctx.lineTo(elXY.x1, elXY.y2);
        this.ctx.closePath();
        this.ctx.stroke();
      }
    },

    invertHex(color: string): string {
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
    },

    getMousePos(evt: MouseEvent) {
      const rect = this.canvas.getBoundingClientRect(); // abs. size of element
      const scaleX = this.canvas.width / rect.width; // relationship bitmap vs. element for X
      const scaleY = this.canvas.height / rect.height; // relationship bitmap vs. element for Y

      return {
        x: (evt.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
        y: (evt.clientY - rect.top) * scaleY, // been adjusted to be relative to element
      } as CanvasPos;
    },

    handleMouseMove(e: MouseEvent) {
      const mousePos = this.getMousePos(e);

      const selected = this.layers.filter((el) => el.isSelected);

      if (selected.length) {
        // move selected only
        this.moveElement(mousePos, selected[0]);
      } else {
        // move top of layers
        let isHovered = false;

        for (let i = this.layers.length - 1; i >= 0; i -= 1) {
          const el = this.layers[i];

          if (isHovered) {
            el.isHovered = false;
          } else {
            this.moveElement(mousePos, el);
            isHovered = el.isHovered;
          }
        }
      }

      this.draw();
    },

    moveElement(mousePos: CanvasPos, el: CanvasElement) {
      const canvasElement = el;

      const dx = mousePos.x - canvasElement.selectedPos.x;
      const dy = mousePos.y - canvasElement.selectedPos.y;

      if (canvasElement.isLeftBorderSelected) {
        canvasElement.left += dx / this.canvasScaleSteps;
        canvasElement.width -= dx / this.canvasScaleSteps;

        canvasElement.selectedPos.x = mousePos.x;
        canvasElement.selectedPos.y = mousePos.y;
      } else if (canvasElement.isRightBorderSelected) {
        canvasElement.width += dx / this.canvasScaleSteps;

        canvasElement.selectedPos.x = mousePos.x;
        canvasElement.selectedPos.y = mousePos.y;
      } else if (canvasElement.isSelected) {
        canvasElement.left += dx / this.canvasScaleSteps;
        canvasElement.top += dy / this.canvasScaleSteps;
        canvasElement.bottom += dy / this.canvasScaleSteps;

        canvasElement.selectedPos.x = mousePos.x;
        canvasElement.selectedPos.y = mousePos.y;
      } else {
        const elXY = this.getElRectXY(el);

        canvasElement.isBorderHovered =
          (mousePos.x >= elXY.x1 && mousePos.x <= elXY.x1 + 2 && mousePos.y >= elXY.y1 && mousePos.y <= elXY.y2) ||
          (mousePos.x >= elXY.x2 - 2 && mousePos.x <= elXY.x2 && mousePos.y >= elXY.y1 && mousePos.y <= elXY.y2);

        canvasElement.isHovered =
          mousePos.x >= elXY.x1 && mousePos.x <= elXY.x2 && mousePos.y >= elXY.y1 && mousePos.y <= elXY.y2;
      }
    },

    handleMouseDown(e: MouseEvent) {
      const mousePos = this.getMousePos(e);

      let isSelected = false;

      for (let i = this.layers.length - 1; i >= 0; i -= 1) {
        const el = this.layers[i];

        if (isSelected) {
          el.isLeftBorderSelected = false;
          el.isRightBorderSelected = false;
          el.isSelected = false;
        } else {
          this.selectElement(mousePos, el);
          isSelected = el.isSelected || el.isLeftBorderSelected || el.isRightBorderSelected;
        }
      }

      this.draw();
    },

    selectElement(mousePos: CanvasPos, el: CanvasElement) {
      const canvasElement = el;

      const elXY = this.getElRectXY(el);

      const isLeftBorderSelected =
        mousePos.x >= elXY.x1 && mousePos.x <= elXY.x1 + 2 && mousePos.y >= elXY.y1 && mousePos.y <= elXY.y2;

      const isRightBorderSelected =
        mousePos.x >= elXY.x2 - 2 && mousePos.x <= elXY.x2 && mousePos.y >= elXY.y1 && mousePos.y <= elXY.y2;

      const isSelected =
        mousePos.x >= elXY.x1 && mousePos.x <= elXY.x2 && mousePos.y >= elXY.y1 && mousePos.y <= elXY.y2;

      canvasElement.isLeftBorderSelected = isLeftBorderSelected;
      canvasElement.isRightBorderSelected = isRightBorderSelected && !isLeftBorderSelected;
      canvasElement.isSelected = isSelected && !isLeftBorderSelected && !isRightBorderSelected;

      if (isSelected || isLeftBorderSelected || isRightBorderSelected) {
        canvasElement.selectedPos = { ...mousePos };
      }
    },

    handleMouseUp() {
      this.layers.forEach((el) => {
        const canvasElement = el;

        canvasElement.isSelected = false;
        canvasElement.isLeftBorderSelected = false;
        canvasElement.isRightBorderSelected = false;
        canvasElement.selectedPos = {} as CanvasPos;
      });

      this.draw();
    },

    handleMouseOut() {
      this.layers.forEach((el) => {
        const canvasElement = el;

        canvasElement.isHovered = false;
        canvasElement.isBorderHovered = false;
      });

      this.handleMouseUp();
    },

    handleWheel(e: WheelEvent) {
      const dy = e.deltaY;

      let isHovered = false;

      this.layers.forEach((el) => {
        if (el.isHovered) {
          isHovered = true;
          if (dy > 0) {
            this.scaleUpEl(el);
          } else if (dy < 0) this.scaleDownEl(el);
        }
      });

      if (!isHovered) {
        if (dy > 0) {
          this.scaleUpCanvas();
        } else if (dy < 0) this.scaleDownCanvas();
      }

      this.draw();
    },

    updMerch(i: number) {
      this.indexMerch = i;

      const { merch } = this.$refs;
      if (!(merch instanceof Array)) return;

      const image = merch[this.indexMerch];
      if (!(image instanceof HTMLImageElement)) return;

      this.imgMerch = image;

      this.draw();
    },

    updImage(i: number) {
      this.indexMeme = i;

      const { imgs } = this.$refs;
      if (!(imgs instanceof Array)) return;

      const image = imgs[this.indexMeme];
      if (!(image instanceof HTMLImageElement)) return;

      this.imgMeme = image;

      this.draw();
    },

    drawText(ctx: CanvasRenderingContext2D) {
      const { height } = this.canvas;

      this.ctx.fillStyle = this.textColor;
      this.ctx.textAlign = 'center';
      this.ctx.lineJoin = 'round';

      if (this.topText) {
        const fontSize = Math.floor((height * this.topCanvasElement.scaleSteps) / 10);
        this.ctx.lineWidth = Math.floor(fontSize / 5);
        this.ctx.font = `${fontSize}px sans-serif`;
        this.ctx.textBaseline = 'top';
        this.drawTextMultiLine(this.topCanvasElement, ctx, this.topText, fontSize);
      }

      if (this.bottomText) {
        const fontSize = Math.floor((height * this.bottomCanvasElement.scaleSteps) / 10);
        this.ctx.lineWidth = Math.floor(fontSize / 5);
        this.ctx.font = `${fontSize}px sans-serif`;
        this.ctx.textBaseline = 'top';
        this.drawTextMultiLine(this.bottomCanvasElement, ctx, this.bottomText, fontSize);
      }
    },

    drawTextMultiLine(el: CanvasElement, ctx: CanvasRenderingContext2D, text: string, fontSize: number) {
      const { scaledLeft, scaledTop, width } = el;
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
          ctx.fillText(line.trim(), x, y);
          line = `${word} `;
          y += fontSize;
          textHeight += fontSize;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line.trim(), x, y);

      const canvasElement = el;

      canvasElement.width = width;
      canvasElement.height = textHeight;
      canvasElement.scaledWidth = width;
      canvasElement.scaledHeight = textHeight;
    },

    prepareForSave(tempCanvas: HTMLCanvasElement, tempctx: CanvasRenderingContext2D) {
      // tempctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      // const kWidth = this.bottomText ? this.kText : 1;
      // const kHeight = this.bottomText ? 1 + this.kFont * this.lines + this.kFont * 1.2 : 1;
      // const scaleSteps = Math.min(
      //   tempCanvas.width / (this.imgMeme.naturalWidth * kWidth),
      //   tempCanvas.height / (this.imgMeme.naturalHeight * kHeight)
      // );
      // const scaledImageWidth = this.imgMeme.naturalWidth * scaleSteps;
      // const scaledImageHeight = scaledImageWidth * (this.imgMeme.naturalHeight / this.imgMeme.naturalWidth);
      // const imageX = (tempCanvas.width - scaledImageWidth) / 2;
      // const imageY = (tempCanvas.height - scaledImageHeight * kHeight) / 2;
      // tempctx.drawImage(
      //   this.imgMeme,
      //   0,
      //   0,
      //   this.imgMeme.naturalWidth,
      //   this.imgMeme.naturalHeight,
      //   imageX,
      //   imageY,
      //   scaledImageWidth,
      //   scaledImageHeight
      // );
      // const fontSize = Math.floor(scaledImageWidth * this.kFont);
      // const yOffsetBottom = imageY + scaledImageHeight + fontSize * 1.2;
      // const xOffset = imageX + scaledImageWidth / 2;
      // const temp = tempctx;
      // temp.lineWidth = Math.floor(fontSize / 4);
      // temp.fillStyle = this.color;
      // temp.textAlign = 'center';
      // temp.lineJoin = 'round';
      // temp.font = `${fontSize}px sans-serif`;
      // temp.textBaseline = 'bottom';
      // this.drawTextMultiLine(tempctx, this.bottomText, xOffset, yOffsetBottom, scaledImageWidth * this.kText, fontSize);
    },

    saveImage() {
      const tempCanvas = document.createElement('canvas');
      const tempctx = tempCanvas.getContext('2d');
      if (!tempctx) return;

      tempCanvas.width = 1240;
      tempCanvas.height = 1754;
      this.prepareForSave(tempCanvas, tempctx);

      tempCanvas.toDataURL();
      const link = document.createElement('a');
      link.download = 'download.png';
      link.href = tempCanvas.toDataURL();
      link.click();
    },

    copyImage() {
      this.canvas.toBlob((blob) => {
        const type = blob?.type;
        if (!type) return;
        const item = new ClipboardItem({ [type]: blob });
        navigator.clipboard.write([item]);
      });
    },

    loadStore(): boolean {
      const str = getPageMerchState();
      if (!str) return false;

      const data = JSON.parse(str);
      if (!data) return false;

      Object.assign(this.$data, data);
      return true;
    },
  },
});
</script>
<style scoped>
.merch,
.merch__generator {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: var(--gap);
  color: var(--color-text);
}

.merch {
  padding-left: 3rem;
  height: 100%;
}

.merch__generator {
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding-right: 3rem;
  overflow-y: auto;
}

.merch__list {
  height: 100%;
  overflow-y: auto;
}

.merch__images,
.merch__merch {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--gap);
}

.merch__image {
  width: 14rem;
  height: 14rem;
  object-fit: contain;
}

.merch__settings,
.merch__settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.merch__settings {
  flex-direction: column;
  gap: 0.5rem;
}

.merch__settings-row {
  gap: var(--gap);
}

.merch__property {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap);
}

.merch__text,
.merch__number {
  padding: 0.5rem;
  border: 0.2rem solid var(--color-border-inverse-soft);
  background-color: var(--color-background);
  color: inherit;
  border-radius: 1rem;
  transition: 0.5s ease;
}

.merch__text {
  width: 30rem;
}

.merch__color {
  padding: 0 0;
  border: none;
  background: none;
  width: 6.2rem;
  height: 3.2rem;
  transition: 0.5s ease;
}

.merch__color::-webkit-color-swatch-wrapper {
  padding: 0;
}

.merch__color::-webkit-color-swatch {
  border: 0.2rem solid var(--color-border-inverse-soft);
  border-radius: 1rem;
}

.merch__canvas-wrapper {
  position: relative;
  padding-top: 2rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.merch__control-buttons {
  z-index: 10;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.merch__control-buttons-scale button {
  margin: 0 0.25rem;
  padding: 0;
}

.merch__canvas {
  border: 0.2px solid gray;
}
.merch__canvas:hover {
  cursor: v-bind(getCursor);
}

@media (max-width: 1200px) {
  .merch {
    padding-left: 1.5rem;
  }

  .merch__generator {
    padding-right: 1.5rem;
  }
}
</style>
