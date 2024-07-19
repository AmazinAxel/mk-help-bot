/* regscript.js
 * Command registry script:
 * registers all available commands
 */

export async function regscript(env) {
	// Help command shown in the slash commands list
	const helpcmd = {
		name: 'help',
		description: 'Display a commonly-asked help article.'
	};

	// Get env vars for authentication
	const token = env.DISCORD_TOKEN;
	const applicationId = env.DISCORD_APPLICATION_ID;

	// Confirm required env vars are properly set
	if (!token) return 'Missing DISCORD_TOKEN env var';
	if (!applicationId) return 'Missing DISCORD_APPLICATION_ID env var';

	// Register command(s)
	const response = await fetch(
		`https://discord.com/api/v10/applications/${applicationId}/commands`,
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
		return "Registered all commands successfully! Use 'bun run deploy' to deploy";
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
