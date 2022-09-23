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
          <label class="merch__label" for="bottom">{{ $t('merch.bottom') }}</label>
          <input type="text" class="merch__text" id="bottom" v-model="bottomText" @input="draw()" />
        </div>
        <div class="merch__property">
          <label class="merch__label" for="kText">{{ $t('merch.kText') }}</label>
          <input
            type="number"
            id="kText"
            min="0"
            max="3"
            step="0.1"
            class="merch__number"
            v-model="kText"
            @input="draw()"
          />
        </div>
        <div class="merch__property">
          <label class="merch__label" for="kFont">{{ $t('merch.kFont') }}</label>
          <input
            type="number"
            id="kFont"
            min="0"
            max="1"
            step="0.01"
            class="merch__number"
            v-model="kFont"
            @input="draw()"
          />
        </div>
      </div>
      <div class="merch__settings-row">
        <div class="merch__settings">
          <div class="merch__property">
            <label class="merch__label" for="color">{{ $t('merch.color') }}</label>
            <input type="color" id="color" class="merch__color" v-model="color" @input="draw()" />
          </div>
          <div class="merch__property">
            <label class="merch__label" for="backgroundColor">{{ $t('merch.backgroundColor') }}</label>
            <input type="color" id="backgroundColor" class="merch__color" v-model="backgroundColor" @input="draw()" />
          </div>
        </div>
        <div class="merch__settings">
          <div class="merch__property">
            <label class="merch__label" for="marginTop">{{ $t('merch.marginTop') }}</label>
            <input
              type="number"
              id="marginTop"
              min="0"
              max="250"
              class="merch__number"
              v-model="marginTop"
              @input="draw()"
            />
          </div>
          <div class="merch__property">
            <label class="merch__label" for="marginLeft">{{ $t('merch.marginLeft') }}</label>
            <input
              type="number"
              id="marginLeft"
              min="0"
              max="250"
              class="merch__number"
              v-model="marginLeft"
              @input="draw()"
            />
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
              @click="scaleUp"
            ></custom-btn>
            <custom-btn
              :text="$t('btn.center')"
              imgPath="icon"
              className="btn btn-icon icon-true"
              @click="imgCenter"
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
        <canvas class="merch__canvas" ref="canvas"> </canvas>
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
const { getPageMerchState, setPageMerchState } = usePagesStore();

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
      bottomText: '',
      lines: 0,
      scaleSteps: 0.5,
      canvas: {} as HTMLCanvasElement,
      ctx: {} as CanvasRenderingContext2D,
      imgMeme: {} as HTMLImageElement,
      imgMerch: {} as HTMLImageElement,
      imageX: 0,
      imageY: 0,
      scaledImageWidth: 0,
      scaledImageHeight: 0,
      color: '#000000',
      backgroundColor: '#999999',
      strokeStyle: '#000000',
      marginTop: 0,
      marginLeft: 0,
      kText: 1.5,
      kFont: 0.2,
    };
  },

  async mounted() {
    this.getImages();
    this.loadStore();

    const { canvas } = this.$refs;
    if (!(canvas instanceof HTMLCanvasElement)) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.canvas = canvas;
    this.ctx = ctx;

    const imageMerch = this.loadImage(this.merch[this.indexMerch]);
    const imageMeme = this.loadImage(this.images[this.indexMeme]);

    [this.imgMerch, this.imgMeme] = await Promise.all([imageMerch, imageMeme]);

    this.canvas.width = this.imgMerch.naturalWidth;
    this.canvas.height = this.imgMerch.naturalHeight;
    this.marginLeft = (this.canvas.width - this.imgMeme.naturalWidth * this.scaleSteps) / 2;
    this.marginTop = (this.canvas.height - this.imgMeme.naturalHeight * this.scaleSteps) / 2;

    // Update CTX
    this.draw();
  },

  beforeRouteLeave() {
    setPageMerchState(JSON.stringify(this.$data));
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

    scaleUp() {
      this.scaleSteps = Math.min(2, this.scaleSteps + 0.01);
      this.draw();
    },

    imgCenter() {
      this.marginLeft = (this.canvas.width - this.imgMeme.naturalWidth * this.scaleSteps) / 2;
      this.marginTop = (this.canvas.height - this.imgMeme.naturalHeight * this.scaleSteps) / 2;
      this.draw();
    },

    scaleDown() {
      this.scaleSteps = Math.max(0.1, this.scaleSteps - 0.01);
      this.draw();
    },

    setImgProps() {
      this.scaledImageWidth = this.imgMeme.naturalWidth * this.scaleSteps;
      this.scaledImageHeight = this.scaledImageWidth * (this.imgMeme.naturalHeight / this.imgMeme.naturalWidth);

      this.imageX = this.marginLeft;
      this.imageY = this.marginTop;
    },

    setMerchImage() {
      // create an overlay with solid color
      const tempCanvas = document.createElement('canvas');
      const tempctx = tempCanvas.getContext('2d');
      if (!tempctx) return;

      tempCanvas.width = this.imgMerch.naturalWidth;
      tempCanvas.height = this.imgMerch.naturalHeight;

      tempctx.drawImage(this.imgMerch, 0, 0);

      tempctx.globalCompositeOperation = 'source-atop';
      tempctx.fillStyle = this.backgroundColor;
      tempctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // set canvas size abd fill background
      this.canvas.width = this.imgMerch.naturalWidth;
      this.canvas.height = this.imgMerch.naturalHeight;

      // use compositing to change the overlay of the original image
      this.ctx.drawImage(tempCanvas, 0, 0);
      this.ctx.globalCompositeOperation = 'overlay';
      this.ctx.drawImage(this.imgMerch, 0, 0);

      // always clean up: reset compositing to its default
      this.ctx.globalCompositeOperation = 'source-over';
    },

    draw() {
      // clear background
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // some maths
      this.setImgProps();

      // draw the t-shirt
      this.setMerchImage();

      // draw the image
      this.ctx.drawImage(
        this.imgMeme,
        0,
        0,
        this.imgMeme.naturalWidth,
        this.imgMeme.naturalHeight,
        this.imageX,
        this.imageY,
        this.scaledImageWidth,
        this.scaledImageHeight
      );

      this.drawText(this.ctx);
    },

    updMerch(i: number) {
      this.indexMerch = i;

      const { merch } = this.$refs;
      if (!(merch instanceof Array)) return;

      const image = merch[this.indexMerch];
      if (!(image instanceof HTMLImageElement)) return;

      this.imgMerch = image;

      // Update CTX
      this.draw();
    },

    updImage(i: number) {
      this.indexMeme = i;

      const { imgs } = this.$refs;
      if (!(imgs instanceof Array)) return;

      const image = imgs[this.indexMeme];
      if (!(image instanceof HTMLImageElement)) return;

      this.imgMeme = image;

      // Update CTX
      this.draw();
    },

    drawText(ctx: CanvasRenderingContext2D) {
      const fontSize = Math.floor(this.scaledImageWidth * this.kFont);
      const yOffsetBottom = this.marginTop + this.scaledImageHeight + fontSize * 1.2;
      const xOffset = this.marginLeft + this.scaledImageWidth / 2;

      ctx.strokeStyle = this.strokeStyle; // 'black';
      ctx.lineWidth = Math.floor(fontSize / 4);
      ctx.fillStyle = this.color; // 'white';
      ctx.textAlign = 'center';
      ctx.lineJoin = 'round';
      ctx.font = `${fontSize}px sans-serif`;

      ctx.textBaseline = 'bottom';
      this.drawTextMultiLine(
        ctx,
        this.bottomText,
        xOffset,
        yOffsetBottom,
        this.scaledImageWidth * this.kText,
        fontSize
      );
    },

    drawTextMultiLine(
      ctx: CanvasRenderingContext2D,
      text: string,
      x: number,
      top: number,
      maxWidth: number,
      lineHeight: number
    ) {
      const words = text.split(' ');
      this.lines = 0;
      let line = '';
      let y = top;
      words.forEach((word, index) => {
        const testLine = `${line + word} `;
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && index > 0) {
          ctx.fillText(line, x, y);
          line = `${word} `;
          y += lineHeight;
          this.lines += 1;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line, x, y);
      this.lines += 1;
    },

    prepareForSave(tempCanvas: HTMLCanvasElement, tempctx: CanvasRenderingContext2D) {
      tempctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

      const kWidth = this.bottomText ? this.kText : 1;
      const kHeight = this.bottomText ? 1 + this.kFont * this.lines + this.kFont * 1.2 : 1;
      const scaleSteps = Math.min(
        tempCanvas.width / (this.imgMeme.naturalWidth * kWidth),
        tempCanvas.height / (this.imgMeme.naturalHeight * kHeight)
      );
      const scaledImageWidth = this.imgMeme.naturalWidth * scaleSteps;
      const scaledImageHeight = scaledImageWidth * (this.imgMeme.naturalHeight / this.imgMeme.naturalWidth);
      const imageX = (tempCanvas.width - scaledImageWidth) / 2;
      const imageY = (tempCanvas.height - scaledImageHeight * kHeight) / 2;
      tempctx.drawImage(
        this.imgMeme,
        0,
        0,
        this.imgMeme.naturalWidth,
        this.imgMeme.naturalHeight,
        imageX,
        imageY,
        scaledImageWidth,
        scaledImageHeight
      );

      const fontSize = Math.floor(scaledImageWidth * this.kFont);
      const yOffsetBottom = imageY + scaledImageHeight + fontSize * 1.2;
      const xOffset = imageX + scaledImageWidth / 2;

      const temp = tempctx;
      temp.lineWidth = Math.floor(fontSize / 4);
      temp.fillStyle = this.color;
      temp.textAlign = 'center';
      temp.lineJoin = 'round';
      temp.font = `${fontSize}px sans-serif`;

      temp.textBaseline = 'bottom';
      this.drawTextMultiLine(tempctx, this.bottomText, xOffset, yOffsetBottom, scaledImageWidth * this.kText, fontSize);
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

    loadStore() {
      const str = getPageMerchState();
      if (!str) return;

      const data = JSON.parse(str);
      if (!data) return;

      Object.assign(this.$data, data);
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
  padding: 0 3rem;
}

.merch__generator {
  flex-direction: column;
  align-items: center;
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
</style>
