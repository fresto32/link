import {prop} from '@typegoose/typegoose';

export default class UnaryLandmarkSettings {
  @prop({required: true})
  model!: string;

  @prop({required: true})
  scale!: number;

  @prop({required: true})
  position!: {
    x: number;
    z: number;
  };
}
