# Deployment Guide

## Environment Variables Configuration

When deploying this application, you need to configure environment variables correctly. There are several ways to do this:

### Option 1: Environment Variables File

Create a `.env` file in your deployment environment (not in version control):

```bash
# Core settings
NODE_ENV=production
SERVER_PORT=3000

# Hedera configuration
HEDERA_ACCOUNT_ID=0.0.XXXXX
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY
HEDERA_NETWORK_TYPE=testnet  # or mainnet, previewnet
HEDERA_KEY_TYPE=ED25519      # or ECDSA

# AI provider keys (if needed)
OPENAI_API_KEY=sk-xxxxx
ANTHROPIC_API_KEY=sk-xxxxx

# Add other variables as needed
```

Then run with:

```bash
docker-compose --env-file .env up -d
```

### Option 2: Export Environment Variables

Export variables directly in your environment:

```bash
export HEDERA_ACCOUNT_ID=0.0.XXXXX
export HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY
export HEDERA_NETWORK_TYPE=testnet
export HEDERA_KEY_TYPE=ED25519
export OPENAI_API_KEY=sk-xxxxx
# Add other variables...

docker-compose up -d
```

### Option 3: Edit docker-compose.yml

For a production deployment, you might want to directly edit the docker-compose.yml file with your actual values instead of using environment variable substitution.

## Required Environment Variables

### Hedera Plugin (Required)
- `HEDERA_ACCOUNT_ID`: Your Hedera account ID (e.g., "0.0.5864628")
- `HEDERA_PRIVATE_KEY`: Your Hedera private key
- `HEDERA_NETWORK_TYPE`: Network to use ("testnet", "mainnet", or "previewnet")
- `HEDERA_KEY_TYPE`: Key type ("ED25519" or "ECDSA")

### AI Providers (Optional, based on your needs)
- `OPENAI_API_KEY`: OpenAI API key
- `ANTHROPIC_API_KEY`: Anthropic API key

See the example .env files in the repository for additional configuration options. 