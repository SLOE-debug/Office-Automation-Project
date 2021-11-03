type Control = {
  [x: string]: PropItem;
};

type PropItem = {
  v: number | string | object | boolean;
  dataValue?: string;
};
interface f {
  controls: { [x: string]: Control };
}

class Form  implements f{
  controls: { [x: string]: Control } = {};
}
