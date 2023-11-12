'use strict'
const mysqlx = require('@mysql/xdevapi');

module.exports = async function (fastify, options) {
  fastify.get('/', async function (request, reply) {
    reply.code(200);

    return { data: await listScheduledMessages() };
  });


  fastify.post('/', async function (request, reply) {
    const session = await mysqlx.getSession(process.env.MYSQLX_SCHEDULED_MESSAGES_DATABASE_URL);
    await session.sql('SET @id = ?;')
                    .bind(request.body.id)
                    .execute();
    await session.sql('SET @date = ?;')
                    .bind(request.body.date)
                    .execute();
    await session.sql('SET @hour = ?;')
                    .bind(request.body.hour)
                    .execute();
    await session.sql('SET @minute = ?;')
                    .bind(request.body.minute)
                    .execute();
    const statement = "CALL new_procedure(@id, @date, @hour, @minute)";
    const result = await session.sql(statement).execute();
    const hardware = await result.fetchOne();
    console.log(hardware);

    await session.close();

    return hardware;
  });


}

async function listScheduledMessages() {
  const config = process.env.MYSQLX_SCHEDULED_MESSAGES_DATABASE_URL;

  let session;

  try {
    session = await mysqlx.getSession(config);

    const result = await session.sql('CALL list_all_scheduled_messages').execute();

    const data = result.fetchAll();

    return data;
  } catch (err) {
    const { message, stack } = err;

    console.error(JSON.stringify({ message, stack }));

    process.exitCode = 1;
  } finally {
    await session?.close();
  }
}



async function createScheduledMessage(id,message,date,hour,minute){
  const config = process.env.MYSQLX_SCHEDULED_MESSAGES_DATABASE_URL;

  let session;

  try {
    session = await mysqlx.getSession(config);

    await session.sql('SET @id = ?;')
      .bind(id)
      .execute();
      await session.sql('SET @message = ?;')
      .bind(message)
      .execute();
      await session.sql('SET @date = ?;')
      .bind(date)
      .execute();
      await session.sql('SET @hour = ?;')
      .bind(hour)
      .execute();
      await session.sql('SET @minute = ?;')
      .bind(minute)
      .execute();

    const result = await session.sql('CALL create_scheduled_message(@id,@message,@date,@hour,@minute)').execute();

    const data = result.fetchAll();

    return data;
  } catch (err) {
    const { message, stack } = err;

    console.error(JSON.stringify({ message, stack }));

    process.exitCode = 1;
  } finally {
    await session?.close();
  }
}