import PromptSettings from './Prompt';
import {prop} from '@typegoose/typegoose';

export default class OptionSettings extends PromptSettings {
  @prop({required: true})
  position!: {
    x: number;
    z: number;
  };

  @prop({required: true})
  isCorrectOption!: boolean;
}
