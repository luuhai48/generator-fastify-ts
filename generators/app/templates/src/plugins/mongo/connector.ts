import { ConnectOptions } from 'mongoose';

import { Db } from './db';

export interface IMongoDBPluginOpts {
  [key: string]: {
    uri: string;
    opts?: ConnectOptions;
  };
}

/**
 * mongoConnector takes responsibility to hold db access
 * then delegates the corresponding task to a given db
 */
export async function mongoConnector(dbsOpts: IMongoDBPluginOpts) {
  const dbs = Object.entries(dbsOpts).reduce(
    (allDbs: { [key: string]: Db }, [dbAliasName, dbOpts]) => {
      const { uri, opts } = dbOpts;
      const db = new Db();
      // Default connection for handle most operations (fast operation)
      // In case we have some slow operations, use `createConnection`
      // to create another connection and queue all slow operations in there.
      // so it doesn't block this default fast connection
      db.createConnection('fastQueries', uri, opts);

      allDbs[dbAliasName] = db;
      return allDbs;
    },
    {},
  );

  // get all connections of all databases then connect it
  // throw error if any of them fails
  const allConnections = Object.values(dbs).flatMap((db) => db.getConnections());
  await Promise.all(allConnections.map((c) => c.connect()));

  const dbsManager = {
    getDb: (dbName: string) => dbs[dbName],
    closeAllConnections: () => Promise.all(allConnections.map((c) => c.close())),
  };

  return dbsManager;
}
