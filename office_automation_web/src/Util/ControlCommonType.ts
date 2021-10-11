export type dragActionType = {
  type: DragType;
  controlType: string;
  serialNumber?: number;
};
export type PropItemType = {
  lable: string;
  v: number | string;
  des: string;
  styleProp?: boolean;
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
