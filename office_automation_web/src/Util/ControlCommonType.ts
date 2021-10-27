export type dragActionType = {
  type: DragType;
  controlType: string;
  serialNumber?: number;
};
export type PropItemType = {
  lable: string;
  v: number | string | object | boolean;
  dataValue?: string;
  des: string;
  isStyle?: boolean;
  onChange?: Function;
  isColor?: boolean;
  isTextarea?: boolean;
  selected?: boolean;
};

export type ControlItemType = {
  Id: string;
  attr: { [x: string]: PropItemType };
  props?: { [x: string]: PropItemType };
  controlType: string;
};

export enum DragHelperMoveType {
  Resize = "Resize",
  Move = "Move",
  None = "",
}

export enum DragType {
  Place = "Place",
  None = "",
}

export type ContextMenuItemType = {
  title: string;
  onClick: Function;
  show?: boolean;
};

export type ContextMenuPosType = {
  top: number;
  left: number;
};

export type JustifyingType =
  | "left"
  | "verticalCenter"
  | "right"
  | "top"
  | "horizontalCenter"
  | "bottom";

export type EqualType = "width" | "height" | "widthAndHeight";
