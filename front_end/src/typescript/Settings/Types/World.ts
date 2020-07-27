import PromptSettings from './Prompt';
import OptionSettings from './Option';
import SoundsSettings from './Sounds';
import SpawnIslandSettings from './SpawnIsland';

export default interface WorldSettings {
  prompt: PromptSettings;
  options: OptionSettings[];
  sounds: SoundsSettings;
  spawnIsland: SpawnIslandSettings;
}
