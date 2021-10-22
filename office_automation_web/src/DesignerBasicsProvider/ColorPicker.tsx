import { Options, Vue } from "vue-class-component";
import "@/assets/css/DesignerBasicsProvider/ColorPicker.less";
import { DocumentEventCenter } from "@/Util/ControlCommonLib";
import { Prop, Watch } from "vue-property-decorator";

Options({
  emits: ["Change"],
});
export default class DragHelper extends Vue {
  @Prop({ default: "" }) value!: string;
  @Prop({ default: "left" }) direction!: string;
  slidingBlockTop = 0;
  canMoveSliding = false;
  canMoveColorSliding = false;
  hueRect: DOMRect = new DOMRect();
  PickerAreaRect: DOMRect = new DOMRect();
  hue: number = 0;
  topPercentage = 0;
  leftPercentage = 0;
  colorSlidingBorderColor = "gray";
  hex = "";
  get hexColor() {
    let hsv = this.RgbToHsv(this.HexToRgb(this.hex));
    return hsv[2] > 80 ? "black" : "white";
  }

  HexToRgb(hex: string) {
    return [
      parseInt("0x" + hex.slice(1, 3)),
      parseInt("0x" + hex.slice(3, 5)),
      parseInt("0x" + hex.slice(5, 7)),
    ];
  }

  RgbToHsv(arr: Array<number>) {
    let h = 0,
      s = 0,
      v = 0;
    let r = arr[0],
      g = arr[1],
      b = arr[2];
    arr.sort((a: number, b: number) => {
      return a - b;
    });
    let max = arr[2];
    let min = arr[0];
    v = max / 255;
    if (max === 0) {
      s = 0;
    } else {
      s = 1 - min / max;
    }
    if (max === min) {
      h = 0;
    } else if (max === r && g >= b) {
      h = 60 * ((g - b) / (max - min)) + 0;
    } else if (max === r && g < b) {
      h = 60 * ((g - b) / (max - min)) + 360;
    } else if (max === g) {
      h = 60 * ((b - r) / (max - min)) + 120;
    } else if (max === b) {
      h = 60 * ((r - g) / (max - min)) + 240;
    }
    h = parseInt(h.toString());
    s = parseInt((s * 100).toString());
    v = parseInt((v * 100).toString());
    return [h, s, v];
  }

  HsvToRgb(h: number, s: number, v: number) {
    if (h < 0) h = 0;
    if (s < 0) s = 0;
    if (v < 0) v = 0;
    if (h >= 360) h = 359;
    if (s > 100) s = 100;
    if (v > 100) v = 100;
    s /= 100.0;
    v /= 100.0;
    let C = v * s;
    let hh = h / 60.0;
    let X = C * (1.0 - Math.abs((hh % 2) - 1.0));
    let r = 0,
      g = 0,
      b = 0;
    if (hh >= 0 && hh < 1) {
      r = C;
      g = X;
    } else if (hh >= 1 && hh < 2) {
      r = X;
      g = C;
    } else if (hh >= 2 && hh < 3) {
      g = C;
      b = X;
    } else if (hh >= 3 && hh < 4) {
      g = X;
      b = C;
    } else if (hh >= 4 && hh < 5) {
      r = X;
      b = C;
    } else {
      r = C;
      b = X;
    }
    let m = v - C;
    r += m;
    g += m;
    b += m;
    r *= 255.0;
    g *= 255.0;
    b *= 255.0;
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    let hex = (r * 65536 + g * 256 + b) as any;
    hex = hex.toString(16, 6);
    let len = hex.length;
    if (len < 6) for (let i = 0; i < 6 - len; i++) hex = "0" + hex;
    this.hex = "#" + hex;
    return { rgb: [r, g, b], hex: "#" + hex };
  }

  get BgColor(): string {
    let hslaStr = "";
    if (this.PickerAreaRect.width != 0) {
      let l = 0;
      let s = 100;
      if (this.PickerAreaRect) {
        l = Math.round(
          (1 - this.topPercentage / this.PickerAreaRect.height) * 100
        );
        s = Math.round((this.leftPercentage / this.PickerAreaRect.width) * 100);
      }
      let rgbColor = this.HsvToRgb(this.hue, s, l);
      hslaStr = rgbColor.hex;

      this.$emit("change", hslaStr);
    } else {
      hslaStr = this.value;
    }
    return hslaStr;
  }

  get SwatchesColor(): string {
    return `hsla(${this.hue},100%,50%,1)`;
  }

  SelectNewGamut(e: MouseEvent) {
    let n = e.y - this.hueRect.y;
    if (n >= 0 && n <= this.hueRect.height) this.slidingBlockTop = n;
    this.hue = Math.round((n / this.hueRect.height) * 360 * 100) / 100;
  }

  SlidingBlockMove(e: MouseEvent) {
    if (this.canMoveSliding) this.SelectNewGamut(e);
    if (this.canMoveColorSliding) this.PlaceNewPosition(e);
  }

  PlaceNewPosition(e: MouseEvent) {
    let left = e.x - this.PickerAreaRect.x;
    let top = e.y - this.PickerAreaRect.y;

    if (left >= 0 && left <= this.PickerAreaRect.width)
      this.leftPercentage = e.x - this.PickerAreaRect.x;
    if (top >= 0 && top <= this.PickerAreaRect.height)
      this.topPercentage = e.y - this.PickerAreaRect.y;

    let lightness = Math.round(
      (1 - this.topPercentage / this.PickerAreaRect.height) * 100
    );
    let saturability = Math.round(
      (this.leftPercentage / this.PickerAreaRect.width) * 100
    );
    if (lightness > 80 && saturability < 20)
      this.colorSlidingBorderColor = "gray";
    else this.colorSlidingBorderColor = "white";
  }

  documentEvents: { [x: string]: any } = {
    mouseup: () => {
      this.canMoveSliding = false;
      this.canMoveColorSliding = false;
    },
    mousemove: this.SlidingBlockMove,
    click: () => {
      if (this.hiddenPickerArea) this.hiddenPickerArea = false;
    },
  };

  created() {
    if (this.value[0] == "#") {
      this.hex = this.value;
    }
    DocumentEventCenter.call(this, this.documentEvents);
  }
  unmounted() {
    DocumentEventCenter.call(this, this.documentEvents, false);
  }

  UpdateHsvByHex(hex: string) {
    let rgb = this.HexToRgb(hex);
    let hsv = this.RgbToHsv(rgb);
    this.hue = hsv[0];
    this.leftPercentage = this.PickerAreaRect.width * (hsv[1] / 100);
    this.topPercentage = Math.abs(
      this.PickerAreaRect.height - this.PickerAreaRect.height * (hsv[2] / 100)
    );
    this.slidingBlockTop =
      (this.hueRect.height * Math.round((this.hue / 360) * 100)) / 100;
  }

  @Watch("hiddenPickerArea")
  HiddenPickerAreaWatch(n: boolean, o: boolean) {
    if (n) {
      if (this.PickerAreaRect.width == 0)
        this.$nextTick(() => {
          this.hueRect = this.$refs["HuePicker"].getBoundingClientRect();
          this.PickerAreaRect = this.$refs[
            "PickerArea"
          ].getBoundingClientRect();
          this.UpdateHsvByHex(this.hex);
        });
    }
  }

  hiddenPickerArea = false;
  render() {
    return (
      <div
        id="ColorPicker"
        style={{ backgroundColor: this.BgColor }}
        onClick={(e: MouseEvent) => {
          if (!this.hiddenPickerArea) this.hiddenPickerArea = true;
          e.stopPropagation();
        }}
      >
        <input
          type="text"
          class="ColorDisplay"
          style={{ color: this.hexColor }}
          v-model={this.hex}
          onChange={(e) => {
            this.UpdateHsvByHex(this.hex);
            e.stopPropagation();
          }}
        />
        <div
          class="PickerAreaPopups"
          v-show={this.hiddenPickerArea}
          style={{ [this.direction]: "-40%" }}
        >
          <div
            class="PickerArea"
            ref="PickerArea"
            style={{ backgroundColor: this.SwatchesColor }}
            onMousedown={(e: MouseEvent) => {
              this.canMoveColorSliding = true;
              this.PlaceNewPosition(e);
            }}
          >
            <div
              class="ColorSlidingBlock"
              style={{
                border: `1px solid ${this.colorSlidingBorderColor}`,
                top: this.topPercentage + "px",
                left: this.leftPercentage + "px",
              }}
            ></div>
          </div>
          <div
            class="HuePicker"
            ref="HuePicker"
            onMousedown={(e: MouseEvent) => {
              this.canMoveSliding = true;
              this.SelectNewGamut(e);
            }}
          >
            <div
              class="slidingBlock"
              style={"top:" + this.slidingBlockTop + "px"}
            ></div>
          </div>
        </div>
      </div>
    );
  }
}
