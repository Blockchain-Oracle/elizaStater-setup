import {
    AccountCreateTransaction,
    AccountId,
    AccountUpdateTransaction,
    Client,
    Hbar,
    PrivateKey,
    TokenId,
    TopicId,
} from "@hashgraph/sdk";
import { AccountData, hederaPrivateKeyFromString } from "./testnetUtils";
import {
    AirdropResult,
    CreateFTOptions,
    CreateNFTOptions,
    CreateTopicResult,
    HederaAgentKit,
    HederaNetworkType,
} from "hedera-agent-kit";
import { AirdropRecipient, SubmitMessageResult } from "hedera-agent-kit";
export class NetworkClientWrapper {
    private readonly accountId: AccountId;
    private readonly privateKey: PrivateKey;
    private readonly client: Client;
    private readonly agentKit: HederaAgentKit;

    constructor(
        accountIdString: string,
        privateKeyString: string,
        keyType: string,
        networkType: HederaNetworkType
    ) {
        this.accountId = AccountId.fromString(accountIdString);
        this.privateKey = hederaPrivateKeyFromString({
            key: privateKeyString,
            keyType,
        }).privateKey;

        this.client = Client.forTestnet();
        this.client.setOperator(this.accountId, this.privateKey);

        this.agentKit = new HederaAgentKit(
            this.accountId.toString(),
            this.privateKey.toString(),
            networkType
        );
    }

    async createAccount(
        initialHBARAmount: number = 0,
        maxAutoAssociation: number = -1 // defaults to setting max auto association to unlimited
    ): Promise<AccountData> {
        const accountPrivateKey = PrivateKey.generateECDSA();
        const accountPublicKey = accountPrivateKey.publicKey;

        const tx = new AccountCreateTransaction()
            .setKey(accountPublicKey)
            .setInitialBalance(new Hbar(initialHBARAmount))
            .setMaxAutomaticTokenAssociations(maxAutoAssociation);
        const txResponse = await tx.execute(this.client);
        const receipt = await txResponse.getReceipt(this.client);
        const txStatus = receipt.status;

        if (!txStatus.toString().includes("SUCCESS"))
            throw new Error("Token Association failed");

        const accountId = receipt.accountId;

        return {
            accountId: accountId!.toString(),
            privateKey: accountPrivateKey.toStringRaw(),
        };
    }

    async setMaxAutoAssociation(maxAutoAssociation: number): Promise<void> {
        const tx = new AccountUpdateTransaction()
            .setAccountId(this.accountId)
            .setMaxAutomaticTokenAssociations(maxAutoAssociation)
            .freezeWith(this.client);
        const txResponse = await tx.execute(this.client);
        await txResponse.getReceipt(this.client);
    }

    async createFT(options: CreateFTOptions): Promise<string> {
        const result = await this.agentKit.createFT(options);
        return result.tokenId.toString();
    }

    async transferToken(
        receiverId: string,
        tokenId: string,
        amount: number
    ): Promise<void> {
        await this.agentKit.transferToken(
            TokenId.fromString(tokenId),
            receiverId,
            amount
        );
    }

    async airdropToken(
        tokenId: string,
        recipients: AirdropRecipient[]
    ): Promise<AirdropResult> {
        return this.agentKit.airdropToken(
            TokenId.fromString(tokenId),
            recipients
        );
    }

    getAccountId(): string {
        return this.accountId.toString();
    }

    createTopic(
        topicMemo: string,
        submitKey: boolean
    ): Promise<CreateTopicResult> {
        return this.agentKit.createTopic(topicMemo, submitKey);
    }

    submitTopicMessage(topicId: string, message: string): Promise<SubmitMessageResult> {
        return this.agentKit.submitTopicMessage(
            TopicId.fromString(topicId),
            message
        );
    }

    associateToken(tokenId: string) {
        return this.agentKit.associateToken(TokenId.fromString(tokenId));
    }

    async createNFT(options: CreateNFTOptions): Promise<string> {
        const result = await this.agentKit.createNFT(options);
        return result.tokenId.toString();
    }
}
