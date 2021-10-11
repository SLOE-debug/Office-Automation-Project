import { PropItemType } from "./ControlCommonType";

let pxSuffix = ["width", "height", "top", "left", "borderradius"];
let percentageSuffix = [""];

export function GetSuffix(k: string) {
  k = k.toLowerCase();
  if (pxSuffix.includes(k)) return "px";
  if (percentageSuffix.includes(k)) return "%";
  return "";
}

export function GetDefaleProp(): { [x: string]: PropItemType } {
  return {
    width: {
      lable: "宽度",
      v: 100,
      des: "控件的宽度",
      styleProp: true,
    },
    height: {
      lable: "高度",
      v: 50,
      des: "控件的高度",
      styleProp: true,
    },
    minWidth: {
      lable: "最小宽度",
      v: 20,
      des: "控件的最小宽度",
    },
    minHeight: {
      lable: "最小高度",
      v: 20,
      des: "控件的最小高度",
    },
    borderRadius: {
      lable: "圆角",
      v: 0,
      des: "控件边缘的圆角弧度",
      styleProp: true,
    },
    opacity: {
      lable: "透明度",
      v: 1,
      des: "控件的透明度",
      styleProp: true,
    },
  };
}
