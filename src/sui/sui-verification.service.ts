import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type RpcTxResponse = {
  effects?: { status?: { status?: string } };
  balanceChanges?: Array<{
    owner?: unknown;
    coinType?: string;
    amount?: string;
  }>;
};

function normalizeSuiAddress(addr: string): string {
  const s = addr.trim().toLowerCase();
  if (!s) return '';
  return s.startsWith('0x') ? s : `0x${s}`;
}

function addressOwner(owner: unknown): string | null {
  if (!owner || typeof owner !== 'object') return null;
  const o = owner as { AddressOwner?: unknown };
  if (typeof o.AddressOwner === 'string') return o.AddressOwner;
  return null;
}

@Injectable()
export class SuiVerificationService {
  private readonly logger = new Logger(SuiVerificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  private rpcUrl(): string {
    const override = process.env.SUI_RPC_URL?.trim();
    if (override) return override;
    const net = (process.env.SUI_NETWORK || 'devnet').toLowerCase();
    if (net === 'mainnet') return 'https://fullnode.mainnet.sui.io';
    if (net === 'testnet') return 'https://fullnode.testnet.sui.io';
    return 'https://fullnode.devnet.sui.io';
  }

  private verifyEnabled(): boolean {
    return process.env.SUI_VERIFY_TRANSACTION !== 'false';
  }

  private strictSender(): boolean {
    return process.env.SUI_STRICT_SENDER === 'true';
  }

  private minPaymentMist(): bigint {
    const raw = process.env.SUI_MIN_PAYMENT_MIST?.trim();
    if (!raw) return 1n;
    try {
      const n = BigInt(raw);
      return n > 0n ? n : 1n;
    } catch {
      return 1n;
    }
  }

  private async rpcCall<T>(method: string, params: unknown[]): Promise<T> {
    const url = this.rpcUrl();
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params,
      }),
    });
    if (!res.ok) {
      throw new BadRequestException(
        `Sui RPC HTTP ${res.status} — check SUI_RPC_URL / network`,
      );
    }
    const body = (await res.json()) as {
      error?: { message?: string };
      result?: T;
    };
    if (body.error?.message) {
      throw new BadRequestException(
        `Sui RPC: ${body.error.message}`,
      );
    }
    if (body.result === undefined) {
      throw new BadRequestException('Sui RPC returned no result');
    }
    return body.result;
  }

  /**
   * Loads the transaction from a Sui full node, checks success, and that the farmer's
   * on-file wallet received SUI. Optionally requires the buyer's wallet to show a debit.
   */
  async assertSalePaymentDigest(params: {
    digest: string;
    farmerUserId: string;
    buyerUserId: string | null;
  }): Promise<void> {
    const digest = params.digest?.trim();
    if (!digest) {
      throw new BadRequestException('Missing transaction digest');
    }

    if (!this.verifyEnabled()) {
      this.logger.warn(
        'SUI_VERIFY_TRANSACTION=false — accepting digest WITHOUT on-chain verification (not production-safe)',
      );
      return;
    }

    const farmer = await this.prisma.user.findUnique({
      where: { id: params.farmerUserId },
    });
    const farmerSui = farmer?.suiAddress?.trim();
    if (!farmerSui) {
      throw new BadRequestException(
        'Farmer has no Sui address on file — add it before on-chain settlement can be verified.',
      );
    }
    const farmerNorm = normalizeSuiAddress(farmerSui);

    let buyerSui: string | null = null;
    if (params.buyerUserId) {
      const buyer = await this.prisma.user.findUnique({
        where: { id: params.buyerUserId },
      });
      buyerSui = buyer?.suiAddress?.trim() || null;
      if (this.strictSender() && !buyerSui) {
        throw new BadRequestException(
          'SUI_STRICT_SENDER=true requires the buyer (trader) to save a Sui address on their profile.',
        );
      }
    } else if (this.strictSender()) {
      throw new BadRequestException(
        'SUI_STRICT_SENDER=true requires a buyer on the sale to verify the sender.',
      );
    }

    const tx = await this.rpcCall<RpcTxResponse>('sui_getTransactionBlock', [
      digest,
      {
        showEffects: true,
        showBalanceChanges: true,
      },
    ]);

    const status = tx.effects?.status?.status;
    if (status !== 'success') {
      throw new BadRequestException(
        `On-chain transaction is not successful (status: ${status ?? 'unknown'})`,
      );
    }

    const changes = tx.balanceChanges ?? [];
    if (changes.length === 0) {
      throw new BadRequestException(
        'Could not read balance changes from this transaction — refuse to mark paid.',
      );
    }

    let receivedMist = 0n;
    for (const ch of changes) {
      if (typeof ch.coinType !== 'string' || !ch.coinType.endsWith('::sui::SUI')) {
        continue;
      }
      const addr = addressOwner(ch.owner);
      if (!addr) continue;
      if (normalizeSuiAddress(addr) !== farmerNorm) continue;
      const amt = ch.amount != null ? BigInt(ch.amount) : 0n;
      if (amt > 0n) receivedMist += amt;
    }

    const min = this.minPaymentMist();
    if (receivedMist < min) {
      throw new BadRequestException(
        `Verified SUI received by farmer (${receivedMist} MIST) is below minimum (${min} MIST).`,
      );
    }

    if (this.strictSender() && buyerSui) {
      const buyerNorm = normalizeSuiAddress(buyerSui);
      let sentOk = false;
      for (const ch of changes) {
        if (typeof ch.coinType !== 'string' || !ch.coinType.endsWith('::sui::SUI')) {
          continue;
        }
        const addr = addressOwner(ch.owner);
        if (!addr || normalizeSuiAddress(addr) !== buyerNorm) continue;
        const amt = ch.amount != null ? BigInt(ch.amount) : 0n;
        if (amt < 0n) sentOk = true;
      }
      if (!sentOk) {
        throw new BadRequestException(
          'Strict sender check failed: buyer wallet does not show an outbound SUI debit in this transaction.',
        );
      }
    }
  }
}
