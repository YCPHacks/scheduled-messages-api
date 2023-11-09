'use strict'
const mysqlx = require('@mysql/xdevapi');

module.exports = async function (fastify, options) {
  fastify.get('/', async function (request, reply) {
    reply.code(200);

    return { data: await listScheduledMessages() };
  });


  fastify.post('/', async function (request, reply) {
    const { id } = request.body;

    await createScheduledMessage(id);

    reply.code(201);

    return;
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
//stinky boys here
async function createScheduledMessage(id) {
  const config = process.env.MYSQLX_SCHEDULED_MESSAGES_DATABASE_URL;

  let session;

  try {
    session = await mysqlx.getSession(config);

    await session.sql('SET @id = ?;')
      .bind(id)
      .execute();

    const result = await session.sql('CALL _create_scheduled_message(@id);').execute();

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