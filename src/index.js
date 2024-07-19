import { AutoRouter } from 'itty-router';
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from 'discord-interactions';
//import { InteractionResponseFlags } from 'discord-interactions';
import { regscript } from './regscript.js'

class JsonResponse extends Response {
  constructor(body, init) {
    const jsonBody = JSON.stringify(body);
    init = init || {
      headers: {
        'content-type': 'application/json;charset=UTF-8'
      }
    };
    super(jsonBody, init);
  };
};

const router = AutoRouter();

/*
 * Only register the commandreg script if
 * on localdev, otherwise it may be abused
 */
router.get('/', async (env, vars) => {
  return (vars.DEV)
  ? new Response(await regscript(env))
  : new Response('👋 Minekeep Discord help bot endpoint\nGive your feedback and suggestions to a Minekeep staff member so we can improve!');
});

/*
 * Main route for all requests recieved by Discord
 * Incoming JSON payload docs:
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
router.post('/', async (request, env) => {
  const { isValid, interaction } = await server.verifyDiscordRequest(
    request,
    env,
  );
  if (!isValid || !interaction)
    return new Response('Bad request signature', { status: 401 });

  // Ping required during the initial webhook handshake
  // to configure the webhook in the developer portal
  if (interaction.type === InteractionType.PING) {
    return new JsonResponse({
      type: InteractionResponseType.PONG,
    });
  }

  // Handle user command and reply with the data
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    interaction.data.name.toLowerCase()
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Hello! This works!!!! line 65',
      },
    });
  };
});
router.all('*', () => new Response('Endpoint Not Found', { status: 404 }));

async function verifyDiscordRequest(request, env) {
  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');
  const body = await request.text();
  const isValidRequest =
    signature &&
    timestamp &&
    (await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY));
  if (!isValidRequest) {
    return { isValid: false };
  }

  return { interaction: JSON.parse(body), isValid: true };
}

const server = {
  verifyDiscordRequest,
  fetch: router.fetch,
};

export default server;