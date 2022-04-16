import SQLite from 'react-native-sqlite-storage';

export const executeQuery = (sql, params = []) =>
  new Promise((resolve, reject) => {
    SQLite.openDatabase(
      {name: 'thonbers_db.db', createFromLocation: 1},
      (db) => {
        db.transaction((trx) => {
          trx.executeSql(
            sql,
            params,
            (trx, results) => {
              resolve(results);
            },
            (error) => {
              reject(error);
            },
          );
        });
      },
    );
  });
