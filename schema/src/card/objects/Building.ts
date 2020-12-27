import {Severity, modelOptions, prop} from '@typegoose/typegoose';

@modelOptions({options: {allowMixed: Severity.ALLOW}})
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
