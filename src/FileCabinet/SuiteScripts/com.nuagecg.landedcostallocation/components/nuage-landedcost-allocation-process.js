/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/log', 'N/record', 'N/search',
        '../lib/nuage-landedcost-allocation-receipt',
        '../lib/nuage-landedcost',
        '../lib/nuage-landedcost-allocation-logs',
        '../lib/nuage-landedcost-allocation-transaction',

        '../const/nuage-landecost-allocation-list'
    ],
    /**
 * @param{log} log
 * @param{record} record
 * @param{search} search
 */
    (log, record, search,
     NReceipt,
     NLandedCost, NLogs, NTran, NList) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {

            const billid = scriptContext.request.parameters.billid;

            var REC = record.load({
                type: record.Type.VENDOR_BILL,
                id: billid
            })

            const METHOD = REC.getValue({
                fieldId: BILL_FIELDS.COST_METHOD
            });

            if(!METHOD){
                log.debug('Processing', 'No method define.');
                return;
            }

            var receipts = {};

            for (var i = 0; i < REC.getLineCount({sublistId: FIELDS.LANDEDCOST}); i++) {
                let id =  REC.getSublistValue({
                    sublistId: FIELDS.LANDEDCOST,
                    fieldId: FIELDS.RECEIPT,
                    line: i
                });

                let process =  REC.getSublistValue({
                    sublistId: FIELDS.LANDEDCOST,
                    fieldId: FIELDS.ALLOCATED,
                    line: i
                });

                if(process == 'T' || process == true){
                    continue;
                }

                receipts[id] = receipts[id] ||  {
                    allocation:{},
                    lines: []
                }

                receipts[id].lines.push(REC.getSublistValue({
                    sublistId: FIELDS.LANDEDCOST,
                    fieldId: FIELDS.ID,
                    line: i
                }))

                let allocation = REC.getSublistValue({
                    sublistId: FIELDS.LANDEDCOST,
                    fieldId: FIELDS.METHOD,
                    line: i
                })

                if(!receipts[id].allocation[allocation]){
                    receipts[id].allocation[allocation] = {

                        items: REC.getSublistValue({
                            sublistId: FIELDS.LANDEDCOST,
                            fieldId: FIELDS.ITEMS,
                            line: i
                        }),
                        amount: 0
                    };
                }

                receipts[id].allocation[allocation].amount += Number(REC.getSublistValue({
                    sublistId: FIELDS.LANDEDCOST,
                    fieldId: FIELDS.AMOUNT,
                    line: i
                }))
            }

            log.debug('Receipts', receipts);

            for(var r in receipts){
                let newal = '';
                let status = NList.STATUS.FAILED;
                let allocated = false;
                let message = 'Please review related allocations included on this Receipt. ';

                try {

                    var recobj = new NReceipt.ItemReceipt();
                    var items = recobj.getItemsByTransaction({
                        tranid: r
                    });

                    for (var a in receipts[r].allocation) {
                        let applied = receipts[r].allocation[a].items;

                        NLandedCost.calculate({
                            applied: applied,
                            items: items,
                            method: METHOD,
                            allocation: a,
                            amount: receipts[r].allocation[a].amount
                        });
                    }

                    log.debug('Allocation', items);
                    recobj.updateAllocation({
                        category: METHOD,
                        items: items
                    });

                    receipts[r].lines.forEach(function(line){
                        NLogs.updateLog({
                            id: line,
                            status: NList.STATUS.COMPLETED,
                            allocated: true,
                            message: 'Successfully updated.'
                        })
                    });

                }catch(e){
                    message += e.message;
                    if(e.name.indexOf('CLOSED_PERIOD') > -1){
                        try {
                            //log.debug('Close period data', 'Period closed!');
                            const data = NLandedCost.constructLandedCost({
                                tranid: r,
                                entity: REC.getValue({
                                    fieldId: FIELDS.ENTITY
                                }),
                                subsidiary: REC.getValue({
                                    fieldId: FIELDS.SUBSIDIARY
                                }),
                                currency: REC.getValue({
                                    fieldId: FIELDS.CURRENCY
                                }),
                                items: items
                            });
                            log.debug('Close period data', data);

                            newal = NTran.createRecord(data);
                            newal = newal ? NTran.resolveRecord({id: newal}) : '';
                            status =  NList.STATUS.COMPLETED;
                            allocated =  true;
                            message = 'Period is closed. New allocation record created.'
                        }catch(e){
                            message = 'Period is closed. Failed to created new allocation. '+ e.message;
                        }
                    }

                    receipts[r].lines.forEach(function(line){
                        NLogs.updateLog({
                            id: line,
                            status: status,
                            allocated: allocated,
                            newallocation: newal,
                            message:message
                        })
                    })
                }
            }
            scriptContext.response.sendRedirect({
                identifier: REC.type,
                type: 'RECORD',
                id: REC.id,
                parameters:{
                    landedcost:'T'
                }
            })
        }

        const BILL_FIELDS = {
            COST_METHOD: 'custbody_ngcs_lcost_al_cost_method'
        };


        const FIELDS = {
            ENTITY: 'entity',
            SUBSIDIARY: 'subsidiary',
            CURRENCY: 'currency',

            LANDEDCOST: 'recmachcustrecord_ngcs_lcost_al_parent',
            ID: 'id',
            RECEIPT: 'custrecord_ngcs_lcost_al_trx',
            AMOUNT: 'custrecord_ngcs_lcost_al_amount',
            METHOD: 'custrecord_ngcs_lcost_al_method',
            ITEMS: 'custrecord_ngcs_lcost_al_items',
            ALLOCATED: 'custrecord_ngcs_lcost_al_confirm'
        }

        return {onRequest}

    });
