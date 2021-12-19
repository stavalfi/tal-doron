import { initTest } from "./utils"

// each test file will run this line
const { getConnection, getDatabaseName} = initTest()


test('do something', async () => {
  console.log(`mysql-db: ${getDatabaseName()} was created and you can use it!:) THIS is a real db!!!!! \
you can connect to it using datagrip or other ui for debugging your test!`)
  // insert some initial data
  await getConnection().query('select 1')

  // start app....

  // do some http call or something else

  // check that something has changed in db

  const result = await getConnection().query('select 1')
  expect(result).toBeTruthy()
})
