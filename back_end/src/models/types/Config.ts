import {prop} from '@typegoose/typegoose';

export default class ConfigSettings {
  @prop({required: true})
  debug!: boolean;

  @prop({required: true})
  showBoundingBoxes!: boolean;

  @prop({required: true})
  touch!: boolean;
}
