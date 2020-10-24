import {prop} from '@typegoose/typegoose';

export default class SoundsSettings {
  @prop({required: true, type: () => [ItemSettings]})
  itemSettings!: ItemSettings[];
}

class ItemSettings {
  @prop({required: true})
  name!: string;

  @prop({required: true, type: () => [String]})
  sounds!: string[];

  @prop({required: true})
  minDelta!: number;

  @prop({required: true})
  volumeMin!: number;

  @prop({required: true})
  volumeMax!: number;

  @prop({required: true})
  rateMin!: number;

  @prop({required: true})
  rateMax!: number;
}
