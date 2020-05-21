import PromptSettings from './Prompt';

export default interface OptionSettings extends PromptSettings {
  position: {
    x: number;
    z: number;
  };
  isCorrectOption: boolean;
}
