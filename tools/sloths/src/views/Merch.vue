<template>
  <div class="merch">
    <div class="merch__list list-aside">
      <div class="merch__option">
        <div
          :title="$t('btn.change')"
          class="merch__change"
          :class="`merch__change_${currItems}`"
          @click="changeItems"
        ></div>
      </div>
      <h3>{{ $t('merch.description') }}</h3>
      <div class="merch__images">
        <img
          ref="imgs"
          v-for="(item, index) in images"
          :key="item.id"
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
          :key="item.id"
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
          <input type="text" class="merch__text" id="top" v-model="topCanvasElement.text" @input="draw()" />
        </div>
        <div class="merch__property">
          <label class="merch__label" for="bottom">{{ $t('create.bottom') }}</label>
          <input type="text" class="merch__text" id="bottom" v-model="bottomCanvasElement.text" @input="draw()" />
        </div>
      </div>
      <div class="merch__settings-row">
        <div class="merch__settings">
          <div class="merch__property">
            <label class="merch__label" for="color">{{ $t('merch.color') }}</label>
            <input type="color" id="color" class="merch__color" v-model="canvasProps.textColor" @input="draw()" />
          </div>
          <div class="merch__property">
            <label class="merch__label" for="backgroundColor">{{ $t('merch.backgroundColor') }}</label>
            <input type="color" id="itemColor" class="merch__color" v-model="canvasProps.itemColor" @input="draw()" />
          </div>
        </div>
      </div>

      <div class="merch__canvas-wrapper">
        <div class="merch__control-buttons">
          <icon-btn
            :text="$t('btn.download')"
            imgPath="icon"
            className="btn btn-icon icon-download"
            @click="saveImage"
          ></icon-btn>
          <div class="merch__control-buttons-scale">
            <icon-btn
              :text="$t('btn.scaleUp')"
              imgPath="icon"
              className="btn btn-icon icon-plus"
              @click="scaleUp()"
            ></icon-btn>
            <icon-btn
              :text="$t('btn.trueSize')"
              imgPath="icon"
              className="btn btn-icon icon-true"
              @click="scaleTrue()"
            ></icon-btn>
            <icon-btn
              :text="$t('btn.center')"
              imgPath="icon"
              className="btn btn-icon icon-center"
              @click="centering"
            ></icon-btn>
            <icon-btn
              :text="$t('btn.scaleDown')"
              imgPath="icon"
              className="btn btn-icon icon-minus"
              @click="scaleDown()"
            ></icon-btn>
          </div>
          <icon-btn
            :text="$t('btn.copy')"
            imgPath="icon"
            className="btn btn-icon icon-copy"
            @click="copyImage"
          ></icon-btn>
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
import IconBtn from '@/components/buttons/IconBtn.vue';
import usePagesStore from '@/stores/pages-store';
import useCleanedStore from '@/stores/cleaned';
import type { CanvasElement } from '@/common/types';
import * as CanvasUtils from '@/utils/canvas-utils';

const { cleanedFilelist, originalFilelist } = useCleanedStore();
const { getPageMerchState, setPageMerchState } = usePagesStore();

type ImageItem = {
  id: number;
  path: string;
};

export default defineComponent({
  name: 'MerchView',

  components: {
    IconBtn,
  },

  data() {
    return {
      images: [] as ImageItem[],
      indexMeme: 0,
      merch: [] as ImageItem[],
      indexMerch: 0,
      canvas: {} as HTMLCanvasElement,
      canvasProps: CanvasUtils.initProperties(0.5, 1, 1.5),
      ctx: {} as CanvasRenderingContext2D,
      imgMeme: {} as HTMLImageElement,
      imgMerch: {} as HTMLImageElement,
      imgCanvasElement: CanvasUtils.initElement(0, 0, 0.5, 0.1, 0.5, 2, false),
      topCanvasElement: CanvasUtils.initElement(0, 0, 0.5, 0.1, 0.5, 2),
      bottomCanvasElement: CanvasUtils.initElement(0, 0, 0.5, 0.1, 0.5, 2),
      layers: [] as CanvasElement[],
      currItems: 'cleaned',
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

    const imageMerch = CanvasUtils.loadImage(this.merch[this.indexMerch].path);
    const imageMeme = CanvasUtils.loadImage(this.images[this.indexMeme].path);

    [this.imgMerch, this.imgMeme] = await Promise.all([imageMerch, imageMeme]);

    CanvasUtils.calcCanvasSizes(this.canvas, this.canvasProps.scaleSteps);
    CanvasUtils.calcElementsSizes(
      this.imgMeme,
      this.imgCanvasElement,
      this.topCanvasElement,
      this.bottomCanvasElement,
      this.canvasProps.scaleSteps
    );
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
    cursorPointer() {
      return CanvasUtils.getCursor(this.layers);
    },
  },

  methods: {
    getImages() {
      this.images = this.mappingImages(this.currItems === 'cleaned' ? cleanedFilelist : originalFilelist);
      this.merch = this.mappingImages([
        './img/merch/tshirt.png',
        './img/merch/hoodie.png',
        './img/merch/mug.png',
        './img/merch/thermo.png',
      ]);
    },

    changeItems() {
      this.images = this.mappingImages(this.currItems !== 'cleaned' ? cleanedFilelist : originalFilelist);
      setTimeout(() => {
        this.updImage(this.indexMeme);
        this.currItems = this.currItems === 'cleaned' ? 'original' : 'cleaned';
      }, 100);
    },

    mappingImages(stringArray: string[]): ImageItem[] {
      return stringArray.map((path, id) => {
        return { path, id };
      });
    },

    getImg(i: number): string {
      return this.images[i].path;
    },

    getMerch(i: number): string {
      return this.merch[i].path;
    },

    scaleUp() {
      CanvasUtils.scaleUpCanvas(this.canvasProps);

      this.draw();
    },

    scaleTrue() {
      CanvasUtils.scaleTrueCanvas(this.canvasProps, this.layers);

      this.draw();
    },

    scaleDown() {
      CanvasUtils.scaleDownCanvas(this.canvasProps);

      this.draw();
    },

    centering() {
      CanvasUtils.centeringElements(
        this.imgCanvasElement,
        this.topCanvasElement,
        this.bottomCanvasElement,
        this.canvasProps.scaleSteps,
        true
      );

      this.draw();
    },

    draw() {
      CanvasUtils.calcCanvasSizes(this.canvas, this.canvasProps.scaleSteps);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      CanvasUtils.drawMerchImage(this.canvas, this.ctx, this.imgMerch, this.canvasProps.itemColor);

      CanvasUtils.calcElementsSizes(
        this.imgMeme,
        this.imgCanvasElement,
        this.topCanvasElement,
        this.bottomCanvasElement,
        this.canvasProps.scaleSteps
      );

      CanvasUtils.calcElementsPosition(this.layers, this.canvasProps.scaleSteps);

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

      const { scaleSteps } = this.canvasProps;
      const { height } = this.canvas;
      CanvasUtils.drawTextUp(height, this.ctx, this.canvasProps, this.topCanvasElement, scaleSteps);
      CanvasUtils.drawTextDown(height, this.ctx, this.canvasProps, this.bottomCanvasElement, scaleSteps);

      const color = CanvasUtils.invertHex(this.canvasProps.itemColor);
      this.layers.forEach((el) => CanvasUtils.drawBorder(el, this.ctx, color));
    },

    handleMouseMove(e: MouseEvent) {
      CanvasUtils.moveElements(e, this.canvas, this.layers, this.canvasProps.scaleSteps);

      this.draw();
    },

    handleMouseDown(e: MouseEvent) {
      CanvasUtils.selectElements(e, this.canvas, this.layers);

      this.draw();
    },

    handleMouseUp() {
      CanvasUtils.deselectElements(this.layers);

      this.draw();
    },

    handleMouseOut() {
      CanvasUtils.unhoverElements(this.layers);

      this.handleMouseUp();
    },

    handleWheel(e: WheelEvent) {
      CanvasUtils.scalingElements(e, this.layers, this.canvasProps);

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
      CanvasUtils.calcElementsSizes(
        this.imgMeme,
        this.imgCanvasElement,
        this.topCanvasElement,
        this.bottomCanvasElement,
        this.canvasProps.scaleSteps
      );
      this.centering();

      this.draw();
    },

    calcsScaleSteps(tempCanvas: HTMLCanvasElement, tempctx: CanvasRenderingContext2D) {
      tempctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      const minLeft =
        Math.min.apply(
          null,
          this.layers.map((el) => el.scaledLeft)
        ) / this.canvasProps.scaleSteps;
      const maxRight =
        Math.max.apply(
          null,
          this.layers.map((el) => el.scaledLeft + el.scaledWidth)
        ) / this.canvasProps.scaleSteps;
      const maxWidth = maxRight - minLeft;

      const minTop =
        Math.min.apply(
          null,
          this.layers.map((el) => el.scaledTop)
        ) / this.canvasProps.scaleSteps;
      const maxBottom =
        Math.max.apply(
          null,
          this.layers.map((el) => el.scaledTop + el.scaledHeight)
        ) / this.canvasProps.scaleSteps;
      const maxHeight = maxBottom - minTop;

      return {
        minLeft,
        minTop,
        scaleSteps: Math.min(tempCanvas.width / maxWidth, tempCanvas.height / maxHeight),
      };
    },

    prepareForSave(tempCanvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
      const tempctx = ctx;
      tempctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      const { minLeft, minTop, scaleSteps } = this.calcsScaleSteps(tempCanvas, tempctx);

      const imgCanvasElement = { ...this.imgCanvasElement };
      const topCanvasElement = { ...this.topCanvasElement };
      const bottomCanvasElement = { ...this.bottomCanvasElement };
      const layers = [imgCanvasElement, topCanvasElement, bottomCanvasElement];

      layers.forEach((el) => {
        const canvasElement = el;
        canvasElement.left -= minLeft;
        canvasElement.top -= minTop;
        canvasElement.bottom -= minTop;
      });

      CanvasUtils.calcElementsSizes(this.imgMeme, imgCanvasElement, topCanvasElement, bottomCanvasElement, scaleSteps);
      CanvasUtils.calcElementsPosition(layers, scaleSteps);

      tempctx.drawImage(
        this.imgMeme,
        0,
        0,
        imgCanvasElement.width,
        imgCanvasElement.height,
        imgCanvasElement.scaledLeft,
        imgCanvasElement.scaledTop,
        imgCanvasElement.scaledWidth,
        imgCanvasElement.scaledHeight
      );

      const height = (this.canvas.height / this.canvasProps.scaleSteps) * scaleSteps;
      CanvasUtils.drawTextUp(height, tempctx, this.canvasProps, topCanvasElement, scaleSteps);
      CanvasUtils.drawTextDown(height, tempctx, this.canvasProps, bottomCanvasElement, scaleSteps);
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

.merch__option {
  margin: 0 auto;
}

.merch__change {
  width: 24rem;
  height: 16.7rem;
  transition: 0.5s ease;
}

.merch__change_cleaned {
  background: no-repeat center center / contain url('/img/merch/merch-cleaned.svg');
}

.merch__change_original {
  background: no-repeat center center / contain url('/img/merch/merch-original.svg');
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
  cursor: v-bind(cursorPointer);
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
