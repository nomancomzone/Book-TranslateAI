import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const { user } = JSON.parse(event.body || '{}');

  return {
    statusCode: 200,
    body: JSON.stringify({
      app_metadata: {
        ...user.app_metadata,
        roles: ['member'],
      },
    }),
  };
};

export { handler };
