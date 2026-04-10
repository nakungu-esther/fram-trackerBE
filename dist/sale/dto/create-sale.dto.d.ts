export declare class CreateSaleDto {
    produce: string;
    quantity: number;
    amount: number;
    buyer: string;
    paymentStatus?: 'pending' | 'paid' | 'partial' | 'credit';
    settlementMethod?: 'sui' | 'credit' | 'manual';
    amountPaid?: number;
    creditDueDate?: string;
    userId?: string;
    procurementId?: number;
    date?: string;
}
