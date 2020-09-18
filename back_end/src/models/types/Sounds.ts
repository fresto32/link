import {prop} from '@typegoose/typegoose';

export default class SoundsSettings {
  @prop({required: true})
  itemSettings!: ItemSettings[];
}

class ItemSettings {
  @prop({required: true})
  name!: string;

  @prop({required: true})
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
