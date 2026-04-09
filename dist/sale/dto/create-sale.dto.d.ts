export declare class CreateSaleDto {
    produce: string;
    quantity: number;
    amount: number;
    buyer: string;
    paymentStatus?: 'paid' | 'partial' | 'credit';
    amountPaid?: number;
    creditDueDate?: string;
    userId?: string;
    date?: string;
}
