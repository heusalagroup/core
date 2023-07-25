// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { LogService } from "../../../LogService";
import { Table } from "../../../data/Table";
import { Entity } from "../../../data/Entity";
import { createOpTransactionDTO, explainOpTransactionDTO, isOpTransactionDTO, OpTransactionDTO } from "../../dto/OpTransactionDTO";
import { Id } from "../../../data/Id";
import { Column } from "../../../data/Column";
import { UpdateTimestamp } from "../../../data/UpdateTimestamp";
import { CreationTimestamp } from "../../../data/CreationTimestamp";

const LOG = LogService.createLogger('OpTransactionEntity');

@Table("op_transaction")
export class OpTransactionEntity extends Entity {

    // The constructor
    public constructor ();
    public constructor (dto : OpTransactionDTO);

    public constructor (dto ?: OpTransactionDTO & {opAccountId: string, opSurrogateId: string}) {
        super();
        this.opAccountId                = dto.opAccountId;
        this.opSurrogateId              = dto.opSurrogateId;
        this.amount                     = dto.amount;
        this.balanceBefore              = dto.balanceBefore;
        this.balanceAfter               = dto.balanceAfter;
        this.message                    = dto.message;
        this.currency                   = dto.currency;
        this.objectId                   = dto.objectId;
        this.archiveId                  = dto.archiveId;
        this.debtorBic                  = dto.debtorBic;
        this.reference                  = dto.reference;
        this.rfReference                = dto.rfReference;
        this.valueDate                  = dto.valueDate;
        this.debtorName                 = dto.debtorName;
        this.bookingDate                = dto.bookingDate;
        this.creditorBic                = dto.creditorBic;
        this.paymentDate                = dto.paymentDate;
        this.creditorName               = dto.creditorName;
        this.debtorAccount              = dto.debtorAccount;
        this.creditorAccount            = dto.creditorAccount;
        this.endToEndId                 = dto.endToEndId;
        this.timestamp                  = dto.timestamp;
        this.transactionTypeCode        = dto.transactionTypeCode;
        this.transactionTypeDescription = dto.transactionTypeDescription;
        this.uetr                       = dto.uetr;
    }

    @Id()
    @Column("op_transaction_id", 'BIGINT', { updatable : false, insertable: false })
    public opTransactionId?: string;

    @Column("op_account_id", 'BIGINT')
    public opAccountId?: string;

    @Column("op_surrogate_id")
    public opSurrogateId?: string;

    @UpdateTimestamp()
    @Column("updated", 'TIMESTAMP')
    public updated?: string;

    @CreationTimestamp()
    @Column("created", 'TIMESTAMP')
    public created?: string;

    @Column("amount")
    public amount ?: string;

    @Column("balance_before")
    public balanceBefore ?: string;

    @Column("balance_after")
    public balanceAfter ?: string;

    @Column("message")
    public message ?: string | null;

    @Column("currency")
    public currency ?: string | null;

    @Column("object_id")
    public objectId ?: string;

    @Column("archive_id")
    public archiveId ?: string;

    @Column("debtor_bic")
    public debtorBic ?: string;

    @Column("reference")
    public reference ?: string | null;

    @Column("rf_reference")
    public rfReference ?: string | null;

    @Column("value_date")
    public valueDate ?: string;

    @Column("debtor_name")
    public debtorName ?: string;

    @Column("booking_date")
    public bookingDate ?: string;

    @Column("creditor_bic")
    public creditorBic ? : string | null;

    @Column("payment_date")
    public paymentDate ?: string;

    @Column("creditor_name")
    public creditorName ?: string;

    @Column("debtor_account")
    public debtorAccount ?: string;

    @Column("creditor_account")
    public creditorAccount ?: string | null;

    @Column("end_to_end_id")
    public endToEndId ?: string | null;

    @Column("timestamp", 'BIGINT')
    public timestamp ?: number;

    @Column("transaction_type_code")
    public transactionTypeCode ?: string;

    @Column("transaction_type_description")
    public transactionTypeDescription ?: string;

    @Column("uetr")
    public uetr ?: string;

    public static toDTO (entity: OpTransactionEntity) : OpTransactionDTO {
        const dto : OpTransactionDTO = createOpTransactionDTO(
            entity.amount,
            entity.balanceBefore,
            entity.balanceAfter,
            entity.message,
            entity.currency,
            entity.objectId,
            entity.archiveId,
            entity.debtorBic,
            entity.reference,
            entity.rfReference,
            entity.valueDate,
            entity.debtorName,
            entity.bookingDate,
            entity.creditorBic,
            entity.paymentDate,
            entity.creditorName,
            entity.debtorAccount,
            entity.creditorAccount,
            entity.endToEndId,
            entity.timestamp,
            entity.transactionTypeCode,
            entity.transactionTypeDescription,
            entity.uetr,
        );
        // Redundant fail safe
        if (!isOpTransactionDTO(dto)) {
            LOG.debug(`toDTO: dto / entity = `, dto, entity);
            throw new TypeError(`Failed to create valid OpTransactionDTO: ${explainOpTransactionDTO(dto)}`);
        }
        return dto;
    }

}
