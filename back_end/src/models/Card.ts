import {prop} from '@typegoose/typegoose';
import ResourcesSettings from './types/Resources';
import WorldSettings from './types/World';

export default class CardSettings {
  @prop({required: true})
  public resources!: ResourcesSettings;

  @prop({required: true})
  public world!: WorldSettings;
}
