import { ConfigService } from "@link/config";
import { CardSettings, UserCard } from "@link/schema/build/src/card";
import { Injectable } from "@nestjs/common";
import { getModelForClass, ReturnModelType } from "@typegoose/typegoose";
import * as mongoose from "mongoose";

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

    mongoose.connect(this.configService.get<string>("db.url"), {
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
    if (this.configService.get<string>("NODE_ENV") === "production") {
      throw new Error("Cannot drop production database programmatically.");
    }

    const db = this.connection();
    await db.dropDatabase();
  }
}
