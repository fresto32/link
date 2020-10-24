import {getModelForClass, prop} from '@typegoose/typegoose';
import {Database} from '../database/Database';
import ConfigSettings from './types/Config';
import ResourcesSettings from './types/Resources';
import WorldSettings from './types/World';

export class CardSettings {
  @prop({required: true})
  public config!: ConfigSettings;

  @prop({required: true})
  public resources!: ResourcesSettings;

  @prop({required: true})
  public world!: WorldSettings;
}

export const CardSettingsModel = getModelForClass(CardSettings, {
  existingConnection: Database.connection(),
});
