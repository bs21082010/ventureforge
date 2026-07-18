import { createHash } from "crypto";

export interface BlockchainRecord {
  dataHash: string;
  previousHash: string;
  timestamp: number;
  nonce: number;
}

export interface VerificationResult {
  verified: boolean;
  hash: string;
  chainValid: boolean;
  timestamp: Date;
}

class SimpleBlockchain {
  private chain: BlockchainRecord[] = [];
  private difficulty = 2;

  constructor() {
    this.chain.push(this.createGenesisBlock());
  }

  private createGenesisBlock(): BlockchainRecord {
    return {
      dataHash: "0",
      previousHash: "0",
      timestamp: Date.now(),
      nonce: 0,
    };
  }

  private hashBlock(block: Omit<BlockchainRecord, "nonce">, nonce: number): string {
    const data = `${block.dataHash}${block.previousHash}${block.timestamp}${nonce}`;
    return createHash("sha256").update(data).digest("hex");
  }

  addRecord(dataHash: string): BlockchainRecord {
    const previousBlock = this.chain[this.chain.length - 1];
    let nonce = 0;
    let hash = "";

    const blockData = {
      dataHash,
      previousHash: this.hashBlock(previousBlock, 0),
      timestamp: Date.now(),
    };

    do {
      nonce++;
      hash = this.hashBlock(blockData, nonce);
    } while (!hash.startsWith("0".repeat(this.difficulty)));

    const record: BlockchainRecord = {
      ...blockData,
      previousHash: this.hashBlock(previousBlock, 0),
      nonce,
    };

    this.chain.push(record);
    return record;
  }

  verifyRecord(record: BlockchainRecord): boolean {
    const idx = this.chain.findIndex(
      (b) => b.timestamp === record.timestamp && b.dataHash === record.dataHash
    );
    if (idx === -1) return false;
    if (idx === 0) return true;

    const previousBlock = this.chain[idx - 1];
    const recalculatedPreviousHash = this.hashBlock(
      { dataHash: previousBlock.dataHash, previousHash: previousBlock.previousHash, timestamp: previousBlock.timestamp },
      previousBlock.nonce
    );

    return record.previousHash === recalculatedPreviousHash;
  }

  verifyChain(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      const previousHash = this.hashBlock(
        { dataHash: previous.dataHash, previousHash: previous.previousHash, timestamp: previous.timestamp },
        previous.nonce
      );

      if (current.previousHash !== previousHash) return false;

      const currentHash = this.hashBlock(
        { dataHash: current.dataHash, previousHash: current.previousHash, timestamp: current.timestamp },
        current.nonce
      );

      if (!currentHash.startsWith("0".repeat(this.difficulty))) return false;
    }
    return true;
  }

  getChain(): BlockchainRecord[] {
    return [...this.chain];
  }

  getLatestBlock(): BlockchainRecord {
    return this.chain[this.chain.length - 1];
  }
}

export const planBlockchain = new SimpleBlockchain();

export function computeDataHash(data: Record<string, unknown>): string {
  const sorted = Object.keys(data)
    .sort()
    .reduce((acc, key) => {
      acc[key] = data[key];
      return acc;
    }, {} as Record<string, unknown>);

  return createHash("sha256")
    .update(JSON.stringify(sorted))
    .digest("hex");
}

export function certifyPlan(planData: Record<string, unknown>): VerificationResult {
  const dataHash = computeDataHash(planData);
  const record = planBlockchain.addRecord(dataHash);

  return {
    verified: planBlockchain.verifyRecord(record),
    hash: record.dataHash,
    chainValid: planBlockchain.verifyChain(),
    timestamp: new Date(record.timestamp),
  };
}
