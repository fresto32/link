import {ConfigService} from '@link/config';
import {CardSettings, UserCard} from '@link/schema';
import {Logger} from '@link/logger';
import {Injectable} from '@nestjs/common';
import {getModelForClass, ReturnModelType} from '@typegoose/typegoose';
import * as mongoose from 'mongoose';
import ono from 'ono';

/**
 * Service for controlling the database connection
 * settings.
 */
@Injectable()
export class DatabaseService {
  private _logger = Logger.create('DatabaseService');
  private _connection: mongoose.Connection | undefined = undefined;

  public userCardModel: ReturnModelType<typeof UserCard, {}>;
  public cardSettingsModel: ReturnModelType<typeof CardSettings, {}>;

  constructor(private configService: ConfigService) {
    this.userCardModel = getModelForClass(UserCard, {
      existingConnection: this.connection(),
    });
    this.cardSettingsModel = getModelForClass(CardSettings, {
      existingConnection: this.connection(),
    });
  }

  public connection(): mongoose.Connection {
    if (this._connection) return this._connection;

    mongoose.connect(this.configService.get<string>('db.url'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const dbConnection = mongoose.connection;
    dbConnection.on('error', error => this._logger.error(error));

    this._connection = dbConnection;
    return dbConnection;
  }

  public async dropDatabase() {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    if (nodeEnv === 'production') {
      throw ono('Cannot drop production database programmatically.', {
        nodeEnv,
      });
    }

    const db = this.connection();
    await db.dropDatabase();
  }
}
