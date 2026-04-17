"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSaleLocked = isSaleLocked;
exports.snapshotSale = snapshotSale;
function isSaleLocked(row) {
    if (row.suiTxDigest)
        return true;
    if (row.paymentStatus === 'paid') {
        const paid = row.amountPaid ?? 0;
        if (paid >= row.amount - 1e-9)
            return true;
    }
    return false;
}
function snapshotSale(row) {
    return {
        id: row.id,
        produce: row.produce,
        quantity: row.quantity,
        amount: row.amount,
        buyer: row.buyer,
        paymentStatus: row.paymentStatus,
        amountPaid: row.amountPaid,
        creditDueDate: row.creditDueDate,
        settlementMethod: row.settlementMethod,
        suiTxDigest: row.suiTxDigest,
        buyerUserId: row.buyerUserId,
        procurementId: row.procurementId,
        userId: row.userId,
        date: row.date,
        recordCreatedAt: row.recordCreatedAt,
        updatedAt: row.updatedAt,
        createdByUserId: row.createdByUserId,
        lastUpdatedByUserId: row.lastUpdatedByUserId,
    };
}
//# sourceMappingURL=sale-audit.util.js.map