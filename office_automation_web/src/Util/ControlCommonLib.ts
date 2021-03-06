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

export function Guid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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
      isStyle: true,
    },
    height: {
      lable: "高度",
      v: 50,
      des: "控件的高度",
      isStyle: true,
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
    disabled: {
      lable: "是否禁用",
      v: false,
      des: "控件是否禁用的",
    },
    opacity: {
      lable: "透明度",
      v: 1,
      des: "控件的透明度",
      isStyle: true,
    },
    borderRadius: {
      lable: "圆角",
      v: 0,
      des: "控件边缘的圆角弧度",
      isStyle: true,
    },
    borderWidth: {
      lable: "边框大小",
      v: 0,
      des: "控件边框的大小",
      isStyle: true,
    },
    borderStyle: {
      lable: "边框样式",
      v: borderStyleModel,
      dataValue: "none",
      des: "控件边框的样式",
      isStyle: true,
    },
    borderColor: {
      lable: "边框颜色",
      v: "",
      des: "控件边框的颜色",
      isStyle: true,
      isColor: true,
    },
    text: {
      lable: "文本",
      v: "默认内容",
      des: "控件显示的文本",
      isTextarea: true,
    },
    fontSize: {
      lable: "字体大小",
      v: 14,
      des: "控件显示的字体大小",
      isStyle: true,
    },
    color: {
      lable: "字体颜色",
      v: "",
      des: "控件字体颜色",
      isStyle: true,
      isColor: true,
    },
    backgroundColor: {
      lable: "背景颜色",
      v: "",
      des: "控件背景颜色",
      isStyle: true,
      isColor: true,
    },
    textAlign: {
      lable: "对齐方式",
      v: horizontalAlignmentModel,
      dataValue: "center",
      isStyle: true,
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

export function GetPathByDom(dom: HTMLElement) {
  let arr: Array<HTMLElement> = [];
  while (dom.parentElement) {
    arr.push(dom.parentElement);
    dom = dom.parentElement;
  }
  return arr;
}
