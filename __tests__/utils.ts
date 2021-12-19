import * as execa from 'execa'
import { Connection, createConnection } from 'typeorm'

async function waitUntilDatabaseCreated({
  containerName,
  username,
  password,
  database,
}: {
  containerName: string
  username: string
  password: string
  database: string
}) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await execa.command(
        `docker exec ${containerName} /usr/bin/mysql -u${username} -p"${password}" --database ${database} --execute 'select 1;'`,
        {
          stdio: 'pipe',
          shell: true,
        },
      )
      break
    } catch (e) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
}

const createDb = async ({
  containerName,
  database,
  password,
  username,
}: {
  containerName: string
  username: string
  password: string
  database: string
}): Promise<{
  connection: Connection
  cleanup: () => Promise<void>
}> => {
  await execa.command(
    `docker exec ${containerName} /usr/bin/mysql -u${username} -p"${password}" --execute 'CREATE DATABASE ${database}'`,
    {
      stdio: 'pipe',
      shell: true,
    },
  )

  await waitUntilDatabaseCreated({
    containerName,
    username,
    password,
    database,
  })

  // I can also tell typeorm where the migration files located at so it will run them
  const connection = await createConnection({
    name: `test_connection_${Date.now()}`,
    type: 'mysql',
    port: 3306,
    host: 'localhost',
    username: 'root',
    password: 'example',
  })

  return {
    connection,
    cleanup: async () => {
      await connection.close()
      execa.command(
        `docker exec ${containerName} /usr/bin/mysql -u${username} -p"${password}" --execute 'DROP DATABASE ${database}'`,
        {
          stdio: 'pipe',
          shell: true,
        },
      )
    },
  }
}

export function initTest(): {
  getDatabaseName: () => string;
  getConnection: () => Connection;
}{

  let database: string
  let result: {
    connection: Connection
    cleanup: () => Promise<void>
  }

  beforeEach(async () => {
    database = `test_mssql_db_name_${Date.now()}`
    result = await createDb({
      containerName: 'mysql-test',
      database,
      username: 'root',
      password: 'example',
    })
  })
  
  afterEach(async () => {
    if (result) {
      await result.cleanup()
    }
  })
  
  return {
    getDatabaseName: () => database,
    getConnection: () => result.connection,
  }
}