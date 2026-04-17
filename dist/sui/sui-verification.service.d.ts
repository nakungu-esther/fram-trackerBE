import { PrismaService } from '../prisma/prisma.service';
export declare class SuiVerificationService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private rpcUrl;
    private verifyEnabled;
    private strictSender;
    private minPaymentMist;
    private rpcCall;
    assertSalePaymentDigest(params: {
        digest: string;
        farmerUserId: string;
        buyerUserId: string | null;
    }): Promise<void>;
}
