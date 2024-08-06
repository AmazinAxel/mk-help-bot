/*
 * Helper command registry script -
 * registers all available commands
 */
import { articleItems } from './articles.js';

export async function regscript(env) {
	// Help command shown in the slash commands list
	const helpcmd = [
		{
			name: 'help',
			description: 'Display an informational help article about a certain topic.',
			options: [
				{
					name: 'articletype',
					description: 'Select an article to show',
					type: 3,
					required: true,
					choices: articleItems.map((item) => ({
						name: item,
						value: item
					})),
					autoComplete: true
				},
				/*
					name: 'mentionuser',
					description: 'Ping a user within the embed'
					type: IDEK
				}*/
			]
		}
	];

	// Get env vars for authentication
	const token = env.DISCORD_TOKEN;
	const applicationID = env.DISCORD_APPLICATION_ID;

	// Confirm required env vars are properly set
	if (!token) return 'Missing DISCORD_TOKEN env var';
	if (!applicationID) return 'Missing DISCORD_APPLICATION_ID env var';

	// Register command(s)
	const response = await fetch(
		`https://discord.com/api/v10/applications/${applicationID}/commands`,
		{
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bot ${token}`
			},
			method: 'PUT',
			body: JSON.stringify(helpcmd) // Use a list for multiple commands
		}
	);

	// Get response status
	if (response.ok) {
		return "Registered all commands successfully! Use 'bun run deploy' to deploy.\nNOTE: Do not rerun this script or you will be rate-limited!";
	} else {
		// Throw descriptive error if it fails
		let errorText = `Error registering commands \n ${response.url}: ${response.status} ${response.statusText}`;
		try {
			const error = await response.text();
			if (error) errorText = `${errorText} \n\n ${error}`;
		} catch (err) {
			return 'Error reading body from request:', err;
		}
		return errorText;
	}
}
