import PromptSettings from './Prompt';
import OptionSettings from './OptionSettings';
import SoundsSettings from './Sounds';

export default interface WorldSettings {
  prompt: PromptSettings;
  options: OptionSettings[];
  sounds: SoundsSettings;
}
