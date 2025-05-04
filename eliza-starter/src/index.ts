import { DirectClient } from "@elizaos/client-direct";
import {
  AgentRuntime,
  elizaLogger,
  settings,
  stringToUuid,
  type Character,
} from "@elizaos/core";
import { bootstrapPlugin } from "@elizaos/plugin-bootstrap";
import { createNodePlugin } from "@elizaos/plugin-node";
import { solanaPlugin } from "@elizaos/plugin-solana";
import fs from "fs";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";
import { initializeDbCache } from "./cache/index.ts";
import { character } from "./character.ts";
import { startChat } from "./chat/index.ts";
import { initializeClients } from "./clients/index.ts";
import {
  getTokenForProvider,
  loadCharacters,
  parseArguments,
} from "./config/index.ts";
import { hederaCredentialMiddleware } from "./config/credentialMiddleware.ts";
import { initializeDatabase } from "./database/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In Docker, always run in daemon mode
if (process.env.DOCKER_ENVIRONMENT === "true" || process.env.NODE_ENV === "production") {
  process.env.DAEMON_PROCESS = "true";
}

export const wait = (minTime: number = 1000, maxTime: number = 3000) => {
  const waitTime =
    Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
  return new Promise((resolve) => setTimeout(resolve, waitTime));
};

let nodePlugin: any | undefined;

export function createAgent(
  character: Character,
  db: any,
  cache: any,
  token: string
) {
  elizaLogger.success(
    elizaLogger.successesTitle,
    "Creating runtime for character",
    character.name,
  );

  nodePlugin ??= createNodePlugin();

  return new AgentRuntime({
    databaseAdapter: db,
    token,
    modelProvider: character.modelProvider,
    evaluators: [],
    character,
    plugins: [
      bootstrapPlugin,
      nodePlugin,
      character.settings?.secrets?.WALLET_PUBLIC_KEY ? solanaPlugin : null,
    ].filter(Boolean),
    providers: [],
    actions: [],
    services: [],
    managers: [],
    cacheManager: cache,
  });
}

async function startAgent(character: Character, directClient: DirectClient) {
  try {
    character.id ??= stringToUuid(character.name);
    character.username ??= character.name;

    const token = getTokenForProvider(character.modelProvider, character);
    const dataDir = path.join(__dirname, "../data");

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const db = initializeDatabase(dataDir);

    await db.init();

    const cache = initializeDbCache(character, db);
    const runtime = createAgent(character, db, cache, token);

    await runtime.initialize();

    runtime.clients = await initializeClients(character, runtime);

    directClient.registerAgent(runtime);

    // report to console
    elizaLogger.debug(`Started ${character.name} as ${runtime.agentId}`);

    return runtime;
  } catch (error) {
    elizaLogger.error(
      `Error starting agent for character ${character.name}:`,
      error,
    );
    console.error(error);
    throw error;
  }
}

const checkPortAvailable = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        resolve(false);
      }
    });

    server.once("listening", () => {
      server.close();
      resolve(true);
    });

    // Explicitly bind to 0.0.0.0 for Render compatibility
    server.listen(port, "0.0.0.0");
  });
};

const startAgents = async () => {
  try {
    const directClient = new DirectClient();
    // Always use PORT environment variable for Render
    process.env.PORT = process.env.PORT || "3000";
    let serverPort: number = parseInt(process.env.PORT);
    const args = parseArguments();
    const startTime = Date.now();
    
    // Add general status endpoint
    directClient.app.get('/status', (req: any, res: any) => {
      // Use any casting to bypass type checking for internal implementation details
      const dc = directClient as any;
      const agentCount = dc.runtimes?.size || dc.agents?.size || 0;
      
      return res.status(200).json({
        status: "active",
        uptime: Math.floor((Date.now() - startTime) / 1000),
        port: serverPort,
        agentCount,
        version: process.env.npm_package_version || "1.0.0"
      });
    });
    
    // Install our middleware to handle user-specific Hedera credentials
    directClient.app.use('/:agentName/message', hederaCredentialMiddleware);

    // Add status endpoint for specific agents
    // directClient.app.get('/:agentName/status', (req: any, res: any) => {
    //   const agentName = req.params.agentName;
      
    //   // Use any casting to bypass type checking for internal implementation details
    //   const dc = directClient as any;
    //   const agentExists = dc.runtimes?.has?.(agentName) || dc.agents?.has?.(agentName) || false;
      
    //   if (agentExists) {
    //     return res.status(200).json({
    //       status: "active",
    //       name: agentName,
    //       isAvailable: true,
    //       uptime: Math.floor((Date.now() - startTime) / 1000),
    //       version: process.env.npm_package_version || "1.0.0"
    //     });
    //   } else {
    //     return res.status(404).json({
    //       status: "not_found",
    //       name: agentName,
    //       isAvailable: false,
    //       error: `Agent '${agentName}' not found`
    //     });
    //   }
    // });

    let charactersArg = args.characters || args.character;
    let characters = [character];

    console.log("charactersArg", charactersArg);
    if (charactersArg) {
      characters = await loadCharacters(charactersArg);
    }
    
    // Start all agents
    for (const character of characters) {
      await startAgent(character, directClient as DirectClient);
    }

    while (!(await checkPortAvailable(serverPort))) {
      elizaLogger.warn(`Port ${serverPort} is in use, trying ${serverPort + 1}`);
      serverPort++;
    }

    // upload some agent functionality into directClient
    directClient.startAgent = async (character: Character) => {
      // wrap it so we don't have to inject directClient later
      return startAgent(character, directClient);
    };

    // Log that we're explicitly using the PORT env var for Render compatibility
    console.log(`Starting server on port ${serverPort} (PORT=${process.env.PORT})`);
    
    try {
      await directClient.start(serverPort);
      
      if (serverPort !== parseInt(settings.SERVER_PORT || "3000")) {
        elizaLogger.log(`Server started on alternate port ${serverPort}`);
      }

      const isDaemonProcess = process.env.DAEMON_PROCESS === "true";
      
      // Only start chat if not running in daemon mode
      if (!isDaemonProcess) {
        elizaLogger.log("Chat started. Type 'exit' to quit.");
        const chat = startChat(characters);
        chat();
      } else {
        elizaLogger.log("Running in daemon mode - interactive chat disabled");
      }
    } catch (serverError) {
      elizaLogger.error("Error starting server:", serverError);
      process.exit(1);
    }
  } catch (error) {
    elizaLogger.error("Unhandled error in startAgents:", error);
    process.exit(1);
  }
};

// Add proper error handling for the main process
process.on('uncaughtException', (error) => {
  elizaLogger.error("Uncaught exception:", error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  elizaLogger.error("Unhandled rejection at:", promise, "reason:", reason);
  process.exit(1);
});

startAgents().catch((error) => {
  elizaLogger.error("Unhandled error in startAgents:", error);
  process.exit(1);
});
