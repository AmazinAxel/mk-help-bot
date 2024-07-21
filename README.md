# Minekeep Discord Help Bot

Discord bot utilizing the Cloudflare Workers platform to show embedded help messages using commands.

Project adapted from [github:discord/cloudflare-sample-app](https://github.com/discord/cloudflare-sample-app)

## Setup w/ Wrangler

Clone repo, `bun i` to install, [create a Discord bot](https://discord.dev) and copy the token, public key and application ID

Use `bunx wrangler secret put DISCORD_TOKEN` and log in with Cloudflare. Do the same for DISCORD_PUBLIC_KEY and DISCORD_APPLICATION_ID.

Go to the Installation tab and click 'copy' on the install tab. Open the link and add the bot to the server.

Use `bun run dev` to start the dev server and visit the hosted link to register the command. Use `bun run deploy` to deploy the application to Cloudflare. Change the endpoint URL to point toward the Worker.

## 🧑‍💻 Useful commands

`bun run deploy` **- deploy the worker**
`bun run dev` - start the development server on :4040

`bun run ngrok` - run an ngrok server for quick local development (requires dev server to be running)
`bun run lint` - lint the codebase
`bun run format` - format the codebase (after linting)

## ❄️ NixOS development w/ Wrangler

NixOS local development is partially broken due to an unset SSL_CERT_PATH pointer when using Wrangler for SSL authentication
To fix this, simply export the proper path: `export SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt` ((read more about Nix issues here)[https://github.com/scottwillmoore/cloudflare-workers-with-nix])
