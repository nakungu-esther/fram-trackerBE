"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SuiVerificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuiVerificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
function normalizeSuiAddress(addr) {
    const s = addr.trim().toLowerCase();
    if (!s)
        return '';
    return s.startsWith('0x') ? s : `0x${s}`;
}
function addressOwner(owner) {
    if (!owner || typeof owner !== 'object')
        return null;
    const o = owner;
    if (typeof o.AddressOwner === 'string')
        return o.AddressOwner;
    return null;
}
let SuiVerificationService = SuiVerificationService_1 = class SuiVerificationService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SuiVerificationService_1.name);
    }
    rpcUrl() {
        const override = process.env.SUI_RPC_URL?.trim();
        if (override)
            return override;
        const net = (process.env.SUI_NETWORK || 'devnet').toLowerCase();
        if (net === 'mainnet')
            return 'https://fullnode.mainnet.sui.io';
        if (net === 'testnet')
            return 'https://fullnode.testnet.sui.io';
        return 'https://fullnode.devnet.sui.io';
    }
    verifyEnabled() {
        return process.env.SUI_VERIFY_TRANSACTION !== 'false';
    }
    strictSender() {
        return process.env.SUI_STRICT_SENDER === 'true';
    }
    minPaymentMist() {
        const raw = process.env.SUI_MIN_PAYMENT_MIST?.trim();
        if (!raw)
            return 1n;
        try {
            const n = BigInt(raw);
            return n > 0n ? n : 1n;
        }
        catch {
            return 1n;
        }
    }
    async rpcCall(method, params) {
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
            throw new common_1.BadRequestException(`Sui RPC HTTP ${res.status} — check SUI_RPC_URL / network`);
        }
        const body = (await res.json());
        if (body.error?.message) {
            throw new common_1.BadRequestException(`Sui RPC: ${body.error.message}`);
        }
        if (body.result === undefined) {
            throw new common_1.BadRequestException('Sui RPC returned no result');
        }
        return body.result;
    }
    async assertSalePaymentDigest(params) {
        const digest = params.digest?.trim();
        if (!digest) {
            throw new common_1.BadRequestException('Missing transaction digest');
        }
        if (!this.verifyEnabled()) {
            this.logger.warn('SUI_VERIFY_TRANSACTION=false — accepting digest WITHOUT on-chain verification (not production-safe)');
            return;
        }
        const farmer = await this.prisma.user.findUnique({
            where: { id: params.farmerUserId },
        });
        const farmerSui = farmer?.suiAddress?.trim();
        if (!farmerSui) {
            throw new common_1.BadRequestException('Farmer has no Sui address on file — add it before on-chain settlement can be verified.');
        }
        const farmerNorm = normalizeSuiAddress(farmerSui);
        let buyerSui = null;
        if (params.buyerUserId) {
            const buyer = await this.prisma.user.findUnique({
                where: { id: params.buyerUserId },
            });
            buyerSui = buyer?.suiAddress?.trim() || null;
            if (this.strictSender() && !buyerSui) {
                throw new common_1.BadRequestException('SUI_STRICT_SENDER=true requires the buyer (trader) to save a Sui address on their profile.');
            }
        }
        else if (this.strictSender()) {
            throw new common_1.BadRequestException('SUI_STRICT_SENDER=true requires a buyer on the sale to verify the sender.');
        }
        const tx = await this.rpcCall('sui_getTransactionBlock', [
            digest,
            {
                showEffects: true,
                showBalanceChanges: true,
            },
        ]);
        const status = tx.effects?.status?.status;
        if (status !== 'success') {
            throw new common_1.BadRequestException(`On-chain transaction is not successful (status: ${status ?? 'unknown'})`);
        }
        const changes = tx.balanceChanges ?? [];
        if (changes.length === 0) {
            throw new common_1.BadRequestException('Could not read balance changes from this transaction — refuse to mark paid.');
        }
        let receivedMist = 0n;
        for (const ch of changes) {
            if (typeof ch.coinType !== 'string' || !ch.coinType.endsWith('::sui::SUI')) {
                continue;
            }
            const addr = addressOwner(ch.owner);
            if (!addr)
                continue;
            if (normalizeSuiAddress(addr) !== farmerNorm)
                continue;
            const amt = ch.amount != null ? BigInt(ch.amount) : 0n;
            if (amt > 0n)
                receivedMist += amt;
        }
        const min = this.minPaymentMist();
        if (receivedMist < min) {
            throw new common_1.BadRequestException(`Verified SUI received by farmer (${receivedMist} MIST) is below minimum (${min} MIST).`);
        }
        if (this.strictSender() && buyerSui) {
            const buyerNorm = normalizeSuiAddress(buyerSui);
            let sentOk = false;
            for (const ch of changes) {
                if (typeof ch.coinType !== 'string' || !ch.coinType.endsWith('::sui::SUI')) {
                    continue;
                }
                const addr = addressOwner(ch.owner);
                if (!addr || normalizeSuiAddress(addr) !== buyerNorm)
                    continue;
                const amt = ch.amount != null ? BigInt(ch.amount) : 0n;
                if (amt < 0n)
                    sentOk = true;
            }
            if (!sentOk) {
                throw new common_1.BadRequestException('Strict sender check failed: buyer wallet does not show an outbound SUI debit in this transaction.');
            }
        }
    }
};
exports.SuiVerificationService = SuiVerificationService;
exports.SuiVerificationService = SuiVerificationService = SuiVerificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SuiVerificationService);
//# sourceMappingURL=sui-verification.service.js.map