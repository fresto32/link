import { Injectable } from "@nestjs/common";
import { UserCard, CardSettings } from "@link/schema/build/src/card";
import * as mongoose from "mongoose";
import { getModelForClass, ReturnModelType } from "@typegoose/typegoose";
import { ConfigService } from "./../configuration/config.service";

/**
 * Service for controlling the database connection
 * settings.
 */
@Injectable()
export class DatabaseService {
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

    mongoose.connect(this.configService.databaseUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const dbConnection = mongoose.connection;
    dbConnection.on(
      "error",
      console.error.bind(console, "MongoDB connection error:")
    );

    this._connection = dbConnection;
    return dbConnection;
  }

  public async dropDatabase() {
    if (process.env.NODE_ENV !== "development") {
      throw new Error("Cannot drop non-development database programmatically.");
    }

    const db = this.connection();
    await db.dropDatabase();
  }
}
