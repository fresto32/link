import {Logger} from '@link/logger';
import {Injectable} from '@nestjs/common';
import {compare, hash} from 'bcrypt';
import ono from 'ono';

/**
 * Number of times the plaintext is hashed.
 */
const ROUNDS = 11;

@Injectable()
export class CryptoService {
  private logger = Logger.create('CryptoService');

  /**
   * Checks whether `plaintext` resolves to `hash`.
   */
  async verifyAgainstHash(plaintext: string, hash: string) {
    const isPasswordMatching = await compare(plaintext, hash);

    if (!isPasswordMatching) {
      this.logger.error('Password is wrong', {plaintext, hash});
      throw ono('Password does not resolve to the hashed plaintext');
    }

    this.logger.debug('Password verified', {plaintext, hash});
    return true;
  }

  /**
   * Hashes `plaintext`.
   */
  async hashOf(plaintext: string) {
    return await hash(plaintext, ROUNDS);
  }
}
