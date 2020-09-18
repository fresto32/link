import {prop} from '@typegoose/typegoose';

export default class BuildingSettings {
  @prop({required: true})
  numWidthSections!: number;

  @prop({required: true})
  numDepthSections!: number;

  @prop({required: true})
  numHeightSections!: number;

  @prop({required: true})
  position!: {
    x: number;
    z: number;
  };
}
