import {getModelForClass, prop} from '@typegoose/typegoose';
import ConfigSettings from './Config';
import {Connection} from 'mongoose';
import ResourcesSettings from './Resources';
import WorldSettings from './objects/World';

export class CardSettings {
  @prop({required: true})
  public config!: ConfigSettings;

  @prop({required: true})
  public resources!: ResourcesSettings;

  @prop({required: true})
  public world!: WorldSettings;
}

export function cardSettingsModel(connection: Connection) {
  return getModelForClass(CardSettings, {
    existingConnection: connection,
  });
}
