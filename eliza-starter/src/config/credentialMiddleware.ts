import { elizaLogger } from '@elizaos/core';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to handle user-specific Hedera credentials
 * This middleware will temporarily override environment variables
 * with user-specific credentials if provided in the request
 */

export const hederaCredentialMiddleware = (req: Request, res: Response, next: NextFunction) => {
    elizaLogger.info("hederaCredentialMiddleware");
  try {
    const { hederaCredentials } = req.body;

    // Store original env variables to restore later
    const originalEnv = {
      HEDERA_ACCOUNT_ID: process.env.HEDERA_ACCOUNT_ID,
      HEDERA_PRIVATE_KEY: process.env.HEDERA_PRIVATE_KEY,
      HEDERA_PUBLIC_KEY: process.env.HEDERA_PUBLIC_KEY,
      HEDERA_NETWORK_TYPE: process.env.HEDERA_NETWORK_TYPE,
      HEDERA_KEY_TYPE: process.env.HEDERA_KEY_TYPE
    };

    // If user provided credentials, temporarily override environment variables
    if (hederaCredentials && hederaCredentials.privateKey) {
      elizaLogger.info(`Using custom Hedera credentials for account: ${hederaCredentials.accountId}`);
      
      // Override environment variables for this request
      process.env.HEDERA_ACCOUNT_ID = hederaCredentials.accountId;
      process.env.HEDERA_PRIVATE_KEY = hederaCredentials.privateKey;
      process.env.HEDERA_PUBLIC_KEY = hederaCredentials.publicKey;
      
      if (hederaCredentials.networkType) {
        process.env.HEDERA_NETWORK_TYPE = hederaCredentials.networkType;
      }
      
      if (hederaCredentials.keyType) {
        process.env.HEDERA_KEY_TYPE = hederaCredentials.keyType;
      }
      
      // After response is sent, restore original environment variables
      res.on('finish', () => {
        elizaLogger.info('Restoring original Hedera credentials');
        process.env.HEDERA_ACCOUNT_ID = originalEnv.HEDERA_ACCOUNT_ID;
        process.env.HEDERA_PRIVATE_KEY = originalEnv.HEDERA_PRIVATE_KEY;
        process.env.HEDERA_PUBLIC_KEY = originalEnv.HEDERA_PUBLIC_KEY;
        process.env.HEDERA_NETWORK_TYPE = originalEnv.HEDERA_NETWORK_TYPE;
        process.env.HEDERA_KEY_TYPE = originalEnv.HEDERA_KEY_TYPE;
      });
    }

    next();
  } catch (error) {
    console.error('Error in Hedera credential middleware:', error);
    next();
  }
}; 