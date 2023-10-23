'use strict'
const mysqlx = require('@mysql/xdevapi');

module.exports = async function (fastify, options) {
  fastify.get('/', async function (request, reply) {
    reply.code(200);

    return { data: await listScheduledMessages() };
  });


  fastify.post('/', async function (request, reply) {
    reply.code(201);

    return { key: 'value' };
  });
}

async function listScheduledMessages() {
  const config = process.env.MYSQLX_SCHEDULED_MESSAGES_DATABASE_URL;

  let session;

  try {
    session = await mysqlx.getSession(config);

    const result = await session.sql('CALL find_schedule_no_post').execute();

    const data = await result.fetchAll();

    return data;
  } catch (err) {
    const { message, stack } = err;

    console.error(JSON.stringify({ message, stack }));

    process.exitCode = 1;
  } finally {
    await session?.close();
  }
}
