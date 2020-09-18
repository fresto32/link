import {prop} from '@typegoose/typegoose';
import PromptSettings from './Prompt';
import OptionSettings from './Option';
import SoundsSettings from './Sounds';
import SpawnIslandSettings from './SpawnIsland';

export default class WorldSettings {
  @prop({required: true})
  prompt!: PromptSettings;

  @prop({required: true})
  options!: OptionSettings[];

  @prop({required: true})
  sounds!: SoundsSettings;

  @prop({required: true})
  spawnIsland!: SpawnIslandSettings;
}
