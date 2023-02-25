import {
  Connection as MongooseConnection,
  ConnectOptions,
  createConnection,
} from 'mongoose';

export class Connection {
  name: string;
  private uri: string;
  private opts: ConnectOptions;
  private mongooseConn: MongooseConnection;

  constructor(name: string, uri: string, opts?: ConnectOptions) {
    this.name = name;
    this.uri = uri;
    this.opts = {
      ...{ maxPoolSize: 10, authSource: 'admin' },
      ...opts,
    };
    this.mongooseConn = createConnection(); // Initialize now, connect later
  }

  connect() {
    return this.mongooseConn.openUri(this.uri, this.opts);
  }

  close() {
    return this.mongooseConn.close();
  }

  getMongooseConnection() {
    return this.mongooseConn;
  }
}
