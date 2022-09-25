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
          @click="updateImage(index)"
        />
      </div>
    </div>
    <div class="meme__generator list-main">
      <div class="meme__settings">
        <div class="meme__property">
          <label class="meme__label" for="top">{{ $t('create.top') }}</label>
          <input type="text" class="meme__text" id="top" v-model="canvasProps.topText" @input="draw()" />
        </div>
        <div class="meme__property">
          <label class="meme__label" for="bottom">{{ $t('create.bottom') }}</label>
          <input type="text" class="meme__text" id="bottom" v-model="canvasProps.bottomText" @input="draw()" />
        </div>
      </div>
      <div class="meme__settings">
        <div class="meme__property">
          <label class="meme__label" for="color">{{ $t('create.color') }}</label>
          <input type="color" id="color" class="meme__color" v-model="canvasProps.textColor" @input="draw()" />
        </div>
        <div class="meme__property">
          <label class="meme__label" for="strokeStyle">{{ $t('create.stroke') }}</label>
          <input type="color" id="strokeStyle" class="meme__color" v-model="canvasProps.strokeColor" @input="draw()" />
        </div>
        <div class="meme__property">
          <label class="meme__label" for="backgroundTransparent">{{ $t('create.backgroundTransparent') }}</label>
          <input
            type="checkbox"
            id="backgroundTransparent"
            class="meme__transparent"
            v-model="canvasProps.backgroundTransparent"
            @change="draw()"
          />
        </div>
        <div class="meme__property" :class="{ 'meme__property-disabled': canvasProps.backgroundTransparent }">
          <label class="meme__label" for="backgroundColor">{{ $t('create.backgroundColor') }}</label>
          <input
            type="color"
            id="backgroundColor"
            class="meme__color"
            v-model="canvasProps.backgroundColor"
            @input="draw()"
            :disabled="canvasProps.backgroundTransparent"
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
              @click="scaleUp()"
            ></custom-btn>
            <custom-btn
              :text="$t('btn.trueSize')"
              imgPath="icon"
              className="btn btn-icon icon-true"
              @click="scaleTrue()"
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
              @click="scaleDown()"
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
import useCleanedStore from '@/stores/cleaned';
import type { CanvasElement } from '@/common/types';
import * as CanvasUtils from '@/utils/canvas-utils';

const { cleanedFilelist } = useCleanedStore();
const { getPageCreateState, setPageCreateState } = usePagesStore();

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
      canvasProps: CanvasUtils.initProperties(0.5, 1, 1.5),
      ctx: {} as CanvasRenderingContext2D,
      img: {} as HTMLImageElement,
      imgCanvasElement: CanvasUtils.initElement(0, 0, 1, 0.1, 1, 2, false),
      topCanvasElement: CanvasUtils.initElement(CanvasUtils.textMargin, 0, 1, 0.1, 1, 2),
      bottomCanvasElement: CanvasUtils.initElement(0, CanvasUtils.canvasSize - CanvasUtils.textMargin, 1, 0.1, 1, 2),
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

    this.img = await CanvasUtils.loadImage(this.images[this.index]);
    CanvasUtils.calcCanvasSizes(this.canvas, this.canvasProps.scaleSteps);
    CanvasUtils.calcElementsSizes(
      this.img,
      this.imgCanvasElement,
      this.topCanvasElement,
      this.bottomCanvasElement,
      this.canvasProps.scaleSteps
    );
    if (!loaded) this.centering();

    this.layers[0] = this.imgCanvasElement;
    this.layers[1] = this.topCanvasElement;
    this.layers[2] = this.bottomCanvasElement;

    this.draw();
  },

  beforeRouteLeave() {
    setPageCreateState(JSON.stringify(this.$data));
  },

  computed: {
    getCursor() {
      return CanvasUtils.getCursor(this.layers);
    },
  },

  methods: {
    async getImages() {
      this.images = cleanedFilelist;
    },

    getImg(i: number): string {
      return this.images[i];
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
        this.canvasProps.scaleSteps
      );

      this.draw();
    },

    draw() {
      CanvasUtils.calcCanvasSizes(this.canvas, this.canvasProps.scaleSteps);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      CanvasUtils.drawBackground(this.canvas, this.ctx, this.canvasProps);

      CanvasUtils.calcElementsSizes(
        this.img,
        this.imgCanvasElement,
        this.topCanvasElement,
        this.bottomCanvasElement,
        this.canvasProps.scaleSteps
      );
      CanvasUtils.calcElementsPosition(this.layers, this.canvasProps.scaleSteps);

      this.ctx.drawImage(
        this.img,
        0,
        0,
        this.imgCanvasElement.width,
        this.imgCanvasElement.height,
        this.imgCanvasElement.scaledLeft,
        this.imgCanvasElement.scaledTop,
        this.imgCanvasElement.scaledWidth,
        this.imgCanvasElement.scaledHeight
      );

      let text = this.canvasProps.topText;
      CanvasUtils.drawTextDown(this.canvas, this.ctx, this.canvasProps, text, this.topCanvasElement, true);
      text = this.canvasProps.bottomText;
      CanvasUtils.drawTextUp(this.canvas, this.ctx, this.canvasProps, text, this.bottomCanvasElement, true);

      const color = CanvasUtils.invertHex(this.canvasProps.backgroundColor, this.canvasProps.backgroundTransparent);
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

    updateImage(i: number) {
      this.index = i;

      const { imgs } = this.$refs;
      if (!(imgs instanceof Array)) return;

      const image = imgs[this.index];
      if (!(image instanceof HTMLImageElement)) return;

      this.img = image;
      CanvasUtils.calcElementsSizes(
        this.img,
        this.imgCanvasElement,
        this.topCanvasElement,
        this.bottomCanvasElement,
        this.canvasProps.scaleSteps
      );
      this.centering();

      this.draw();
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

    loadStore(): boolean {
      const str = getPageCreateState();
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
.meme__canvas:hover {
  cursor: v-bind(getCursor);
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
