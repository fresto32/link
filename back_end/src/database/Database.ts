import * as mongoose from 'mongoose';

const MONGO_DB_CONNECTION_URL =
  process.env.NODE_ENV === 'development'
    ? 'mongodb://localhost:27017/development'
    : 'mongodb://localhost:27017/production';

let _connection: mongoose.Connection | undefined = undefined;

export abstract class Database {
  static connection(): mongoose.Connection {
    if (_connection) return _connection;

    mongoose.connect(MONGO_DB_CONNECTION_URL, {useNewUrlParser: true});

    const dbConnection = mongoose.connection;
    dbConnection.on(
      'error',
      console.error.bind(console, 'MongoDB connection error:')
    );

    _connection = dbConnection;
    return dbConnection;
  }

  static async drop() {
    const db = Database.connection();
    await db.dropDatabase();
  }
}
