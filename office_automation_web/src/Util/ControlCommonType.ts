export type dragActionType = {
  type: DragType;
  controlType: string;
  serialNumber?: number;
};
export type PropItemType = {
  lable: string;
  v: number | string | object;
  dataValue?: string;
  des: string;
  isStyle?: boolean;
  onChange?: Function;
  isColor?: boolean;
};

export type ControlItemType = {
  attr: { [x: string]: PropItemType };
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
  onCilck: Function;
  show?: boolean;
};

export type ContextMenuPosType = {
  top: number;
  left: number;
};