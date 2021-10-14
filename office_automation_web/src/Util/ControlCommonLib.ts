import { PropItemType } from "./ControlCommonType";

let pxSuffix = [
  "width",
  "height",
  "top",
  "left",
  "borderradius",
  "fontsize",
  "borderwidth",
];
let percentageSuffix = [""];

export let horizontalAlignmentModel = {
  left: "left",
  center: "center",
  right: "right",
};

export let borderStyleModel = {
  none: "none",
  hidden: "hidden",
  dotted: "dotted",
  dashed: "dashed",
  solid: "solid",
  double: "double",
  groove: "groove",
  ridge: "ridge",
  inset: "inset",
  outset: "outset",
};

export function GetSuffix(k: string) {
  k = k.toLowerCase();
  if (pxSuffix.includes(k)) return "px";
  if (percentageSuffix.includes(k)) return "%";
  return "";
}

export function DocumentEventCenter(
  this: any,
  eventObj: { [x: string]: Function },
  unmount: boolean = false
) {
  for (const envenType in eventObj) {
    document[unmount ? "removeEventListener" : "addEventListener"](
      envenType,
      eventObj[envenType].bind(this)
    );
  }
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
    opacity: {
      lable: "透明度",
      v: 1,
      des: "控件的透明度",
      styleProp: true,
    },
    borderRadius: {
      lable: "圆角",
      v: 0,
      des: "控件边缘的圆角弧度",
      styleProp: true,
    },
    borderWidth: {
      lable: "边框大小",
      v: 0,
      des: "控件边框的大小",
      styleProp: true,
    },
    borderStyle: {
      lable: "边框样式",
      v: borderStyleModel,
      dataValue: "none",
      des: "控件边框的样式",
      styleProp: true,
    },
    borderColor: {
      lable: "边框颜色",
      v: "",
      des: "控件边框的颜色",
      styleProp: true,
    },
    text: {
      lable: "文本",
      v: "默认内容",
      des: "控件显示的文本",
    },
    fontSize: {
      lable: "字体大小",
      v: 14,
      des: "控件显示的字体大小",
      styleProp: true,
    },
    color: {
      lable: "字体颜色",
      v: "",
      des: "控件字体颜色",
      styleProp: true,
    },
    backgroundColor: {
      lable: "背景颜色",
      v: "",
      des: "控件背景颜色",
      styleProp: true,
    },
    textAlign: {
      lable: "对齐方式",
      v: horizontalAlignmentModel,
      dataValue: "center",
      styleProp: true,
      des: "控件文字的对齐方式",
    },
  };
}

export function CloneInstance(obj: any): any {
  let temp = (Array.isArray(obj) ? [] : {}) as any;
  for (const key in obj) {
    let type = typeof obj[key];
    if (type == "object") {
      temp[key] = CloneInstance(obj[key]);
    } else {
      temp[key] = obj[key];
    }
  }
  return temp;
}
