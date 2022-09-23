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
            v-model="transparent"
            @change="draw()"
          />
        </div>
        <div class="meme__property" :class="{ 'meme__property-disabled': transparent }">
          <label class="meme__label" for="backgroundColor">{{ $t('create.backgroundColor') }}</label>
          <input
            type="color"
            id="backgroundColor"
            class="meme__color"
            v-model="backgroundColor"
            @input="draw()"
            :disabled="transparent"
          />
        </div>
        <div class="meme__property">
          <label class="meme__label" for="margin">{{ $t('create.margin') }}</label>
          <input type="number" id="margin" min="0" max="100" class="meme__number" v-model="margin" @input="draw()" />
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
              @click="scaleUp"
            ></custom-btn>
            <custom-btn
              :text="$t('btn.trueSize')"
              imgPath="icon"
              className="btn btn-icon icon-true"
              @click="scaleTrue"
            ></custom-btn>
            <custom-btn
              :text="$t('btn.scaleDown')"
              imgPath="icon"
              className="btn btn-icon icon-minus"
              @click="scaleDown"
            ></custom-btn>
          </div>
          <custom-btn
            :text="$t('btn.copy')"
            imgPath="icon"
            className="btn btn-icon icon-copy"
            @click="copyImage"
          ></custom-btn>
        </div>
        <canvas class="meme__canvas" ref="canvas"> </canvas>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import CustomBtn from '@/components/buttons/CustomBtn.vue';
import usePagesStore from '@/stores/pages-store';
import useCleanedStore from '@/stores/cleaned';

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
      topText: '',
      bottomText: '',
      scaleSteps: 1,
      canvas: {} as HTMLCanvasElement,
      ctx: {} as CanvasRenderingContext2D,
      img: {} as HTMLImageElement,
      imageX: 0,
      imageY: 0,
      scaledImageWidth: 0,
      scaledImageHeight: 0,
      imageWidth: 0,
      imageHeight: 0,
      imageRight: 0,
      imageBottom: 0,
      color: '#ffffff',
      backgroundColor: '#777777',
      transparent: false,
      strokeStyle: '#000000',
      margin: 50,
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
      // Grab position info
      this.imageRight = this.imageX + this.img.width;
      this.imageBottom = this.imageY + this.img.height;

      // Update CTX
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
      this.images = cleanedFilelist;
    },

    getImg(i: number): string {
      return this.images[i];
    },

    scaleUp() {
      this.scaleSteps = Math.min(2, this.scaleSteps + 0.1);
      this.draw();
    },

    scaleTrue() {
      this.scaleSteps = 1;
      this.draw();
    },

    scaleDown() {
      this.scaleSteps = Math.max(0.1, this.scaleSteps - 0.1);
      this.draw();
    },

    draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // some maths
      this.scaledImageWidth = this.img.naturalWidth * this.scaleSteps;
      this.scaledImageHeight = this.scaledImageWidth * (this.img.naturalHeight / this.img.naturalWidth);

      this.imageX = this.margin * this.scaleSteps;
      this.imageY = this.margin * this.scaleSteps;

      // canvas size
      this.canvas.width = this.scaledImageWidth
        ? this.scaledImageWidth + this.margin * 2 * this.scaleSteps
        : this.canvas.width;
      this.canvas.height = this.scaledImageHeight
        ? this.scaledImageHeight + this.margin * 2 * this.scaleSteps
        : this.canvas.height;

      // image background
      if (!this.transparent) {
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }

      // draw the image
      this.ctx.drawImage(
        this.img,
        0,
        0,
        this.img.naturalWidth,
        this.img.naturalHeight,
        this.imageX,
        this.imageY,
        this.scaledImageWidth,
        this.scaledImageHeight
      );
      this.imageRight = this.imageX + this.scaledImageWidth;
      this.imageBottom = this.imageY + this.scaledImageHeight;

      this.drawText();
    },

    updImage(i: number) {
      this.index = i;

      const { imgs } = this.$refs;
      if (!(imgs instanceof Array)) return;

      const image = imgs[this.index];
      if (!(image instanceof HTMLImageElement)) return;

      this.img = image;

      // Grab position info
      this.imageRight = this.imageX + this.img.width;
      this.imageBottom = this.imageY + this.img.height;

      // Update CTX
      this.draw();
    },

    drawText() {
      const { width, height } = this.canvas;
      const fontSize = Math.floor(width / 10);
      const yOffset = height / 25;

      this.ctx.strokeStyle = this.strokeStyle; // 'black';
      this.ctx.lineWidth = Math.floor(fontSize / 4);
      this.ctx.fillStyle = this.color; // 'white';
      this.ctx.textAlign = 'center';
      this.ctx.lineJoin = 'round';
      this.ctx.font = `${fontSize}px sans-serif`;

      this.ctx.textBaseline = 'top';
      this.drawTextMultiLineTop(this.topText, width / 2, yOffset, this.canvas.width, fontSize);

      this.ctx.textBaseline = 'bottom';
      this.drawTextMultiLineBottom(this.bottomText, width / 2, height - yOffset, this.canvas.width, fontSize);
    },

    drawTextMultiLineTop(text: string, x: number, top: number, maxWidth: number, lineHeight: number) {
      const words = text.split(' ');
      let line = '';
      let y = top;
      words.forEach((word, index) => {
        const testLine = `${line + word} `;
        const metrics = this.ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && index > 0) {
          this.ctx.strokeText(line, x, y);
          this.ctx.fillText(line, x, y);
          line = `${word} `;
          y += lineHeight;
        } else {
          line = testLine;
        }
      });
      this.ctx.strokeText(line, x, y);
      this.ctx.fillText(line, x, y);
    },

    drawTextMultiLineBottom(text: string, x: number, top: number, maxWidth: number, lineHeight: number) {
      const words = text.split(' ').reverse();
      let line = '';
      let y = top;
      words.forEach((word, index) => {
        const testLine = ` ${word + line}`;
        const metrics = this.ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && index > 0) {
          this.ctx.strokeText(line, x, y);
          this.ctx.fillText(line, x, y);
          line = ` ${word}`;
          y -= lineHeight;
        } else {
          line = testLine;
        }
      });
      this.ctx.strokeText(line, x, y);
      this.ctx.fillText(line, x, y);
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
