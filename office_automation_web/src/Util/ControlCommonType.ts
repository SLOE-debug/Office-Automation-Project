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
  styleProp?: boolean;
  onChange?: Function;
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
};

export type ContextMenuPosType = {
  top: number;
  left: number;
};
