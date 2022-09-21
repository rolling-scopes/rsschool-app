<template>
  <div class="meme">
    <div class="meme__list list-aside">
      <h3>{{ $t('create.description') }}</h3>
      <div class="meme__memes">
        <img
          ref="imgs"
          v-for="(item, index) in images"
          :key="index"
          :src="getImg(index)"
          alt="images"
          object-fit="contain"
          class="meme__image"
          @click="updImage(index)"
        />
      </div>
    </div>
    <div class="meme__generator list-main">
      <div class="meme__settings">
        <div class="meme__property">
          <label class="meme__label" for="top">{{ $t('create.top') }}</label>
          <input type="text" class="meme__text" id="top" v-model="topText" @input="draw()" />
        </div>
        <div class="meme__property">
          <label class="meme__label" for="bottom">{{ $t('create.bottom') }}</label>
          <input type="text" class="meme__text" id="bottom" v-model="bottomText" @input="draw()" />
        </div>
      </div>
      <div class="meme__settings">
        <div class="meme__property">
          <label class="meme__label" for="color">{{ $t('create.color') }}</label>
          <input type="color" id="color" class="meme__color" v-model="color" @input="draw()" />
        </div>
        <div class="meme__property">
          <label class="meme__label" for="strokeStyle">{{ $t('create.stroke') }}</label>
          <input type="color" id="strokeStyle" class="meme__color" v-model="strokeStyle" @input="draw()" />
        </div>
        <div class="meme__property">
          <label class="meme__label" for="backgroundTransparent">{{ $t('create.backgroundTransparent') }}</label>
          <input
            type="checkbox"
            id="backgroundTransparent"
            class="meme__transparent"
            v-model="backgroundTransparent"
            @change="draw()"
          />
        </div>
        <div class="meme__property" :class="{ 'meme__property-disabled': backgroundTransparent }">
          <label class="meme__label" for="backgroundColor">{{ $t('create.backgroundColor') }}</label>
          <input
            type="color"
            id="backgroundColor"
            class="meme__color"
            v-model="backgroundColor"
            @input="draw()"
            :disabled="backgroundTransparent"
          />
        </div>
      </div>

      <div class="meme__canvas-wrapper">
        <div class="meme__control-buttons">
          <custom-btn
            :text="$t('btn.download')"
            imgPath="icon"
            className="btn btn-icon icon-download"
            @click="saveImage"
          ></custom-btn>
          <div class="meme__control-buttons-scale">
            <custom-btn
              :text="$t('btn.scaleUp')"
              imgPath="icon"
              className="btn btn-icon icon-plus"
              @click="scaleUp(imgCanvasElement)"
            ></custom-btn>
            <custom-btn
              :text="$t('btn.trueSize')"
              imgPath="icon"
              className="btn btn-icon icon-true"
              @click="scaleTrue(imgCanvasElement)"
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
              @click="scaleDown(imgCanvasElement)"
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
          class="meme__canvas"
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
import { MEMES_SLOTHS } from '@/common/const';

const { getPageCreateState, setPageCreateState } = usePagesStore();
const canvasSize = 500;
const textMargin = 10;

type CanvasElement = {
  top: number;
  left: number;
  width: number;
  height: number;
  scaledWidth: number;
  scaledHeight: number;
  scaleSteps: number;
  isHovered: boolean;
  isSelected: boolean;
  selectedPos: Pos;
};

type Pos = {
  x: number;
  y: number;
};

export default defineComponent({
  name: 'CreateView',

  components: {
    CustomBtn,
  },

  data() {
    return {
      images: [] as string[],
      index: 0,
      canvas: {} as HTMLCanvasElement,
      ctx: {} as CanvasRenderingContext2D,
      backgroundTransparent: false,
      backgroundColor: '#777777',
      img: {} as HTMLImageElement,
      topText: '',
      bottomText: '',
      color: '#ffffff',
      strokeStyle: '#000000',
      imgCanvasElement: this.initCanvasElement(0),
      topCanvasElement: this.initCanvasElement(textMargin),
      bottomCanvasElement: this.initCanvasElement(canvasSize - textMargin),
    };
  },

  mounted() {
    this.getImages();

    this.loadStore();

    const { canvas } = this.$refs;
    if (!(canvas instanceof HTMLCanvasElement)) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.canvas = canvas;
    this.ctx = ctx;

    const image = new Image();
    image.onload = () => {
      this.calcCanvasSizes();
      this.calcImgSizes();
      this.centering();
      this.draw();
    };
    image.src = this.images[this.index];

    this.img = image;
  },

  beforeRouteLeave() {
    setPageCreateState(JSON.stringify(this.$data));
  },

  methods: {
    async getImages() {
      this.images = MEMES_SLOTHS;
    },

    getImg(i: number): string {
      return this.images[i];
    },

    initCanvasElement(top: number) {
      return {
        top,
        left: 0,
        width: 0,
        height: 0,
        scaledWidth: 0,
        scaledHeight: 0,
        scaleSteps: 1,
        isHovered: false,
        isSelected: false,
        selectedPos: {} as Pos,
      } as CanvasElement;
    },

    scaleUp(el: CanvasElement) {
      const canvasElement = el;

      canvasElement.scaleSteps = Math.min(2, canvasElement.scaleSteps + 0.05);

      this.draw();
    },

    scaleTrue(el: CanvasElement) {
      const canvasElement = el;

      canvasElement.scaleSteps = 1;

      this.draw();
    },

    scaleDown(el: CanvasElement) {
      const canvasElement = el;

      canvasElement.scaleSteps = Math.max(0.1, canvasElement.scaleSteps - 0.05);

      this.draw();
    },

    centering() {
      this.imgCanvasElement.left = (canvasSize - this.imgCanvasElement.scaledWidth) / 2;
      this.imgCanvasElement.top = (canvasSize - this.imgCanvasElement.scaledHeight) / 2;

      this.topCanvasElement.left = 0;
      this.topCanvasElement.top = textMargin;

      this.bottomCanvasElement.left = 0;
      this.bottomCanvasElement.top = canvasSize - textMargin - this.bottomCanvasElement.scaledHeight;

      this.draw();
    },

    draw() {
      this.calcCanvasSizes();

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.calcImgSizes();

      this.drawBackground();

      this.ctx.drawImage(
        this.img,
        0,
        0,
        this.imgCanvasElement.width,
        this.imgCanvasElement.height,
        this.imgCanvasElement.left,
        this.imgCanvasElement.top,
        this.imgCanvasElement.scaledWidth,
        this.imgCanvasElement.scaledHeight
      );

      this.drawText();

      this.drawBorder(this.imgCanvasElement);
      this.drawBorder(this.topCanvasElement);
      this.drawBorder(this.bottomCanvasElement);
    },

    calcImgSizes() {
      if (this.img) {
        this.imgCanvasElement.width = this.img.naturalWidth;
        this.imgCanvasElement.height = this.img.naturalHeight;

        this.imgCanvasElement.scaledWidth = this.imgCanvasElement.width * this.imgCanvasElement.scaleSteps;
        this.imgCanvasElement.scaledHeight =
          this.imgCanvasElement.scaledWidth * (this.imgCanvasElement.height / this.imgCanvasElement.width);
      } else {
        this.imgCanvasElement.width = 0;
        this.imgCanvasElement.height = 0;
        this.imgCanvasElement.scaledWidth = 0;
        this.imgCanvasElement.scaledHeight = 0;
      }
    },

    calcCanvasSizes() {
      this.canvas.width = canvasSize;
      this.canvas.height = canvasSize;
    },

    drawBackground() {
      if (!this.backgroundTransparent) {
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
    },

    drawBorder(el: CanvasElement) {
      if (el.isHovered || el.isSelected) {
        const x1 = el.left;
        const x2 = el.left + el.scaledWidth;
        const y1 = el.top;
        const y2 = el.top + el.scaledHeight;

        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = this.invertHex(this.backgroundColor);
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.lineTo(x1, y2);
        this.ctx.closePath();
        this.ctx.stroke();
      }
    },

    invertHex(color: string): string {
      if (this.backgroundTransparent) return 'gray';

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
      } as Pos;
    },

    handleMouseMove(e: MouseEvent) {
      const mousePos = this.getMousePos(e);

      this.handleMouseMoveEl(mousePos, this.imgCanvasElement);
      this.handleMouseMoveEl(mousePos, this.topCanvasElement);
      this.handleMouseMoveEl(mousePos, this.bottomCanvasElement);

      this.draw();
    },

    handleMouseMoveEl(mousePos: Pos, el: CanvasElement) {
      const canvasElement = el;

      if (canvasElement.isSelected) {
        const dx = mousePos.x - canvasElement.selectedPos.x;
        const dy = mousePos.y - canvasElement.selectedPos.y;

        canvasElement.left += dx;
        canvasElement.top += dy;

        canvasElement.selectedPos.x = mousePos.x;
        canvasElement.selectedPos.y = mousePos.y;
      } else {
        const x1 = canvasElement.left;
        const x2 = canvasElement.left + canvasElement.scaledWidth;
        const y1 = canvasElement.top;
        const y2 = canvasElement.top + canvasElement.scaledHeight;

        canvasElement.isHovered = mousePos.x >= x1 && mousePos.x <= x2 && mousePos.y >= y1 && mousePos.y <= y2;
      }
    },

    handleMouseDown(e: MouseEvent) {
      const mousePos = this.getMousePos(e);

      this.handleMouseDownEl(mousePos, this.imgCanvasElement);
      this.handleMouseDownEl(mousePos, this.topCanvasElement);
      this.handleMouseDownEl(mousePos, this.bottomCanvasElement);

      this.draw();
    },

    handleMouseDownEl(mousePos: Pos, el: CanvasElement) {
      const canvasElement = el;

      const x1 = canvasElement.left;
      const x2 = canvasElement.left + canvasElement.scaledWidth;
      const y1 = canvasElement.top;
      const y2 = canvasElement.top + canvasElement.scaledHeight;

      const isSelected = mousePos.x >= x1 && mousePos.x <= x2 && mousePos.y >= y1 && mousePos.y <= y2;

      canvasElement.isSelected = isSelected;
      if (isSelected) {
        canvasElement.selectedPos = { ...mousePos };
      }
    },

    handleMouseUp() {
      this.handleMouseUpEl(this.imgCanvasElement);
      this.handleMouseUpEl(this.topCanvasElement);
      this.handleMouseUpEl(this.bottomCanvasElement);

      this.draw();
    },

    handleMouseUpEl(el: CanvasElement) {
      const canvasElement = el;

      canvasElement.isSelected = false;
      canvasElement.selectedPos = {} as Pos;
    },

    handleMouseOut() {
      this.imgCanvasElement.isHovered = false;
      this.topCanvasElement.isHovered = false;
      this.bottomCanvasElement.isHovered = false;

      this.handleMouseUp();
    },

    handleWheel(e: WheelEvent) {
      const dy = e.deltaY;

      this.handleWheelEl(dy, this.imgCanvasElement);
      this.handleWheelEl(dy, this.topCanvasElement);
      this.handleWheelEl(dy, this.bottomCanvasElement);
    },

    handleWheelEl(dy: number, el: CanvasElement) {
      const canvasElement = el;

      if (canvasElement.isHovered) {
        if (dy > 0) {
          this.scaleUp(canvasElement);
        } else if (dy < 0) this.scaleDown(canvasElement);
      }
    },

    updImage(i: number) {
      this.index = i;

      const { imgs } = this.$refs;
      if (!(imgs instanceof Array)) return;

      const image = imgs[this.index];
      if (!(image instanceof HTMLImageElement)) return;

      this.img = image;
      this.calcImgSizes();
      this.centering();

      this.draw();
    },

    drawText() {
      const { width, height } = this.canvas;

      this.ctx.strokeStyle = this.strokeStyle;
      this.ctx.fillStyle = this.color;
      this.ctx.textAlign = 'center';
      this.ctx.lineJoin = 'round';

      if (this.topText) {
        const fontSize = Math.floor((height * this.topCanvasElement.scaleSteps) / 10);
        this.ctx.lineWidth = Math.floor(fontSize / 5);
        this.ctx.font = `${fontSize}px sans-serif`;
        this.ctx.textBaseline = 'top';
        const { left, top } = this.topCanvasElement;
        this.drawTextMultiLineTop(this.topText, width / 2 + left, top, width, fontSize);
      }

      if (this.bottomText) {
        const fontSize = Math.floor((height * this.bottomCanvasElement.scaleSteps) / 10);
        this.ctx.lineWidth = Math.floor(fontSize / 5);
        this.ctx.font = `${fontSize}px sans-serif`;
        this.ctx.textBaseline = 'bottom';
        const { left, top } = this.bottomCanvasElement;
        this.drawTextMultiLineBottom(this.bottomText, width / 2 + left, top, width, fontSize);
      }
    },

    drawTextMultiLineTop(text: string, x: number, top: number, maxWidth: number, fontSize: number) {
      const words = text.split(' ');
      let line = '';
      let y = top + fontSize * 0.1;
      let textHeight = fontSize;

      words.forEach((word, index) => {
        const testLine = `${line + word} `;
        const metrics = this.ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && index > 0) {
          this.ctx.strokeText(line.trim(), x, y);
          this.ctx.fillText(line.trim(), x, y);
          line = `${word} `;
          y += fontSize;
          textHeight += fontSize;
        } else {
          line = testLine;
        }
      });
      this.ctx.strokeText(line.trim(), x, y);
      this.ctx.fillText(line.trim(), x, y);

      this.topCanvasElement.width = maxWidth;
      this.topCanvasElement.height = textHeight;
      this.topCanvasElement.scaledWidth = maxWidth;
      this.topCanvasElement.scaledHeight = textHeight;
    },

    drawTextMultiLineBottom(text: string, x: number, top: number, maxWidth: number, fontSize: number) {
      const words = text.split(' ').reverse();
      let line = '';
      let y = top + this.bottomCanvasElement.height + fontSize * 0.1;
      let textHeight = fontSize;

      words.forEach((word, index) => {
        const testLine = ` ${word + line}`;
        const metrics = this.ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && index > 0) {
          this.ctx.strokeText(line.trim(), x, y);
          this.ctx.fillText(line.trim(), x, y);
          line = ` ${word}`;
          y -= fontSize;
          textHeight += fontSize;
        } else {
          line = testLine;
        }
      });
      this.ctx.strokeText(line.trim(), x, y);
      this.ctx.fillText(line.trim(), x, y);

      this.bottomCanvasElement.top -= textHeight - this.bottomCanvasElement.height;
      this.bottomCanvasElement.width = maxWidth;
      this.bottomCanvasElement.height = textHeight;
      this.bottomCanvasElement.scaledWidth = maxWidth;
      this.bottomCanvasElement.scaledHeight = textHeight;
    },

    saveImage() {
      this.canvas.toDataURL();
      const link = document.createElement('a');
      link.download = 'download.png';
      link.href = this.canvas.toDataURL();
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

    loadStore() {
      const str = getPageCreateState();
      if (!str) return;

      const data = JSON.parse(str);
      if (!data) return;

      Object.assign(this.$data, data);
    },
  },
});
</script>
<style>
.meme,
.meme__generator {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: var(--gap);
  color: var(--color-text);
}

.meme {
  padding-left: 3rem;
  height: 100%;
}

.meme__list {
  height: 100%;
  overflow-y: auto;
}

.meme__generator {
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding-right: 3rem;
  overflow-y: auto;
}

.meme__memes {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--gap);
}

.meme__image {
  width: 14rem;
  height: 14rem;
  object-fit: contain;
}

.meme__settings {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.meme__property {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap);
}

.meme__property-disabled {
  opacity: 0.45;
}

.meme__text,
.meme__number {
  padding: 0.5rem;
  border: 0.2rem solid var(--color-border-inverse-soft);
  background-color: var(--color-background);
  color: inherit;
  border-radius: 1rem;
  transition: 0.5s ease;
}

.meme__color {
  padding: 0 0;
  border: none;
  background: none;
  width: 6.2rem;
  height: 3.2rem;
  transition: 0.5s ease;
}

.meme__color::-webkit-color-swatch-wrapper {
  padding: 0;
}

.meme__color::-webkit-color-swatch {
  border: 0.2rem solid var(--color-border-inverse-soft);
  border-radius: 1rem;
}

.meme__transparent {
  width: 2rem;
  height: 2rem;
  margin: 0.6rem 0;
  accent-color: var(--color-background-inverse);
}

.meme__canvas-wrapper {
  position: relative;
  padding-top: 2rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.meme__control-buttons {
  z-index: 10;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.meme__control-buttons-scale button {
  margin: 0 0.25rem;
  padding: 0;
}

.meme__canvas {
  border: 0.2px solid gray;
}

@media (max-width: 1200px) {
  .meme {
    padding-left: 1.5rem;
  }

  .meme__generator {
    padding-right: 1.5rem;
  }
}
</style>
