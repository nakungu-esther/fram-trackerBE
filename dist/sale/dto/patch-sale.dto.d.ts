export declare class PatchSaleDto {
    amountPaid?: number;
    paymentStatus?: 'pending' | 'paid' | 'partial' | 'credit';
    settlementMethod?: 'sui' | 'credit' | 'manual' | null;
    suiTxDigest?: string | null;
    creditDueDate?: string | null;
}
