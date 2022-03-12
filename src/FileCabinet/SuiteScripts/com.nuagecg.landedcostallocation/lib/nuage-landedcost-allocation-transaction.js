/**
 * @NApiVersion 2.1
 */
define(['N/log', 'N/record','N/url'],
    /**
 * @param{log} log
 * @param{record} record
 */
    (log, record, url) => {


        const RECORD_TYPE = 'customtransaction_ngcs_landedcost_tran';
        const FIELDS = {
            SUBSIDIARY: 'subsidiary',
            CURRENCY: 'currency',
            TRANSACTION: 'custbody_ngcs_landedcost_tran_trx',

            LINE: 'line',
            ACCOUNT: 'account',
            DEBIT: 'debit',
            CREDIT: 'credit',
            ENTITY: 'entity',
            ITEM: 'custcol_ngcs_landedcost_tran_item',
            CATEGORY: 'custcol_ngcs_landedcost_tran_cat'
        }

        const createRecord = (params) => {

            var landed = record.create({
                type: RECORD_TYPE,
                isDynamic: true
            });

            landed.setValue({
                fieldId: FIELDS.SUBSIDIARY,
                value: params.subsidiary
            });
            landed.setValue({
                fieldId: FIELDS.CURRENCY,
                value: params.currency
            });
            landed.setValue({
                fieldId: FIELDS.TRANSACTION,
                value: params.tranid
            })

            params.lines.forEach(function(row, i){
                landed.selectNewLine({
                    sublistId: FIELDS.LINE
                });
                landed.setCurrentSublistValue({
                    sublistId: FIELDS.LINE,
                    fieldId: FIELDS.ACCOUNT,
                    value: row.account
                });
                landed.setCurrentSublistValue({
                    sublistId: FIELDS.LINE,
                    fieldId: FIELDS.CATEGORY,
                    value: row.category
                });

                if(row.debit) {
                    log.debug('Amount is debit', row.debit);
                    landed.setCurrentSublistValue({
                        sublistId: FIELDS.LINE,
                        fieldId: FIELDS.DEBIT,
                        value: row.debit
                    });
                }
                if(row.credit){
                    log.debug('Amount is credit', row.credit);
                    landed.setCurrentSublistValue({
                        sublistId: FIELDS.LINE,
                        fieldId: FIELDS.CREDIT,
                        value: row.credit
                    });
                }
                if(row.entity) {
                    landed.setCurrentSublistValue({
                        sublistId: FIELDS.LINE,
                        fieldId: FIELDS.ENTITY,
                        value: row.entity
                    })
                }
                if(row.item) {
                    landed.setCurrentSublistValue({
                        sublistId: FIELDS.LINE,
                        fieldId: FIELDS.ITEM,
                        value: row.item
                    });
                }

                landed.commitLine({
                    sublistId: FIELDS.LINE
                });
            });

            return landed.save({
                ignoreMandatoryFields: true
            });
        }

        const resolveRecord = (params) => {
            return '<a href="' + url.resolveRecord({
                recordType: RECORD_TYPE,
                recordId: params.id
            })+ '">View</a>' ;
        }
        return {createRecord, resolveRecord}

    });
