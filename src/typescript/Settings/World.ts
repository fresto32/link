import PromptSettings from './Prompt';
import OptionSettings from './OptionSettings';

export default interface WorldSettings {
  prompt: PromptSettings;
  options: OptionSettings[];
}
