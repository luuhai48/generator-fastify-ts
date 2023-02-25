import { ConnectOptions } from 'mongoose';

import { Connection } from './connection';

export class Db {
  // holds all connections of a given database
  private connections: Array<Connection>;

  constructor() {
    this.connections = [];
  }

  /**
   * Create a new connection of the same database
   * This is useful when we have default connection for handling most operations of our app
   * And we create a new connection to handle slow operations
   * So that it doesn't block our normal queries
   */
  createConnection(name: string, uri: string, opts?: ConnectOptions) {
    const conn = new Connection(name, uri, opts);
    this.connections.push(conn);
  }

  /**
   * Get a given connection by its name
   */
  getConnection(connName = 'fastQueries') {
    return this.connections.find((c) => c.name === connName);
  }

  /**
   * Get all connections
   */
  getConnections() {
    return this.connections;
  }
}
