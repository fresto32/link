import {Severity, modelOptions, prop} from '@typegoose/typegoose';

@modelOptions({options: {allowMixed: Severity.ALLOW}})
export default class ConfigSettings {
  @prop({required: true})
  debug!: boolean;

  @prop({required: true})
  showBoundingBoxes!: boolean;

  @prop({required: true})
  touch!: boolean;
}
