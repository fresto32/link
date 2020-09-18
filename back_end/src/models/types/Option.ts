import {prop} from '@typegoose/typegoose';
import PromptSettings from './Prompt';

export default class OptionSettings extends PromptSettings {
  @prop({required: true})
  position!: {
    x: number;
    z: number;
  };

  @prop({required: true})
  isCorrectOption!: boolean;
}
