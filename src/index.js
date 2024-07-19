import { AutoRouter } from 'itty-router';
import { InteractionResponseType, InteractionType, verifyKey } from 'discord-interactions';
import { regscript } from './regscript.js';
import { articleItems, articles } from './articles.js'

/*
 -- TODO LIST
  - use an embed instead of posting plaintext
  - add more articles
  - ping option for notifying users
  - switch away from using commands and use user applications instead
    use option 3: https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types
  - use built-in router instead of using AutoRouter/itty-router
    for reducing CPU time and better performance
  - convert to Typescript for better type safety
*/

class JsonResponse extends Response {
	constructor(body, init) {
		const jsonBody = JSON.stringify(body);
		init = init || {
			headers: {
				'content-type': 'application/json;charset=UTF-8'
			}
		};
		super(jsonBody, init);
	}
}

const router = AutoRouter();

/*
 * Only register the commandreg script if
 * on localdev, otherwise it may be abused
 */
router.get('/', async (vars) => {
	return vars.DEV
		? new Response(await regscript(vars))
		: new Response(
				'👋 Minekeep Discord help bot endpoint\nGive your feedback and suggestions to a Minekeep staff member so we can improve!'
			);
});

/*
 * Routing for all Discord requests following this JSON payload:
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
router.post('/', async (request, vars) => {
	const { isValid, interaction } = await server.verifyDiscordRequest(request, vars);
	if (!isValid || !interaction) return new Response('Bad request signature', 401);

	// Ping required during the initial webhook handshake
	// to configure the webhook in the developer portal
	if (interaction.type === InteractionType.PING) {
		return new JsonResponse({
			type: InteractionResponseType.PONG
		});
	}

	// Handle user command and reply with the data
	else if (interaction.type === InteractionType.APPLICATION_COMMAND) {
		const article = articleItems.indexOf(interaction.data.options[0].value);

		if (article == -1) return new Response('Bad request - article not found', 404)
		
		return new JsonResponse({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: articles[article]
			}
		});
	}
});
router.all('*', () => new Response('Endpoint not found', 404));

/*
 * Verify request to make sure Discord is the proper sender
 * to prevent attacks and possible exceptions
 */
async function verifyDiscordRequest(request, vars) {
	const signature = request.headers.get('x-signature-ed25519');
	const timestamp = request.headers.get('x-signature-timestamp');
	const body = await request.text();
	const isValidRequest =
		signature &&
		timestamp &&
		(await verifyKey(body, signature, timestamp, vars.DISCORD_PUBLIC_KEY));
	if (!isValidRequest)
		return { isValid: false };
	return { isValid: true, interaction: JSON.parse(body) };
}

// Create router and request handler
const server = {
	verifyDiscordRequest,
	fetch: router.fetch
};
export default server;
