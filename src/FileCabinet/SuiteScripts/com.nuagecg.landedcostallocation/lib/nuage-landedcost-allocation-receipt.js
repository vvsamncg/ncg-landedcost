define(['N/record'],function(record){

    const FIELDS = {
        ITEM: 'item',
        ITEM_LINE: 'orderline',
        ITEM_NAME: 'itemname',
        QTY: 'quantity',
        DESCRIPTION: 'description',
        WEIGHT: 'itemweight',
        RATE: 'rate',
        COGS_ACCOUNT: 'custcol_ngcs_lcost_cogs',


        LANDEDCOST: 'landedcost',
        LANDEDCOST_DATA: 'landedcostdata',
        LANDEDCOST_LINE: 'landedcostperline',
        COST_CATEGORY : 'costcategory',
        COST_AMOUNT: 'amount',

        ELIGIBLE: 'custcol_ngcs_lcost_al_el_item'
    };

    function ItemReceipt(){
        this.record = null
    }

    ItemReceipt.prototype.getItemsByTransaction = function(params){
        log.debug('getItemsByTransaction', params)
        var items = [];
        this.record = record.load({
            type: 'itemreceipt',
            id: params.tranid,
            isDynamic: true
        });

        for(var i = 0; i < this.record.getLineCount({sublistId: FIELDS.ITEM}); i++){
            if(this.record.getSublistValue({sublistId: FIELDS.ITEM, fieldId: FIELDS.ELIGIBLE, line: i})) {
                var itemid = this.record.getSublistValue({sublistId: FIELDS.ITEM, fieldId: FIELDS.ITEM, line: i});

                items.push({
                    id: itemid ,
                    cogs: this.record.getSublistValue({sublistId: FIELDS.ITEM, fieldId: FIELDS.COGS_ACCOUNT, line: i}),
                    line: this.record.getSublistValue({sublistId: FIELDS.ITEM, fieldId: FIELDS.ITEM_LINE, line: i}),
                    itemname: this.record.getSublistValue({sublistId: FIELDS.ITEM, fieldId: FIELDS.ITEM_NAME, line: i}),
                    qty: this.record.getSublistValue({sublistId: FIELDS.ITEM, fieldId: FIELDS.QTY, line: i}),
                    description: this.record.getSublistValue({
                        sublistId: FIELDS.ITEM,
                        fieldId: FIELDS.DESCRIPTION,
                        line: i
                    }),
                    rate: this.record.getSublistValue({sublistId: FIELDS.ITEM, fieldId: FIELDS.RATE, line: i}),
                    weight: Number(this.record.getSublistValue({sublistId: FIELDS.ITEM, fieldId: FIELDS.WEIGHT, line: i})),
                    cost: {}
                })
            }
        }

        return items
    }

    ItemReceipt.prototype.updateAllocation = function(params){
        var itemreceipt = this.record;

        if(!this.record.getValue({
            fieldId: FIELDS.LANDEDCOST_LINE
        })){
            this.record.setValue({
                fieldId: FIELDS.LANDEDCOST_LINE,
                value: true
            })
        }

        params.items.forEach(function(item, i){
            var line = itemreceipt.findSublistLineWithValue({
                sublistId: FIELDS.ITEM,
                fieldId: FIELDS.ITEM_LINE,
                value: item.line
            });

            if(line == -1) return;

            itemreceipt.selectLine({
                sublistId: FIELDS.ITEM,
                line: line
            });

            var landedcost = itemreceipt.getCurrentSublistSubrecord({
                sublistId: FIELDS.ITEM,
                fieldId: FIELDS.LANDEDCOST
            });

            log.debug('landedcost', params);

            for(var cost in item.cost){
                var line =  landedcost.findSublistLineWithValue({
                    sublistId:FIELDS.LANDEDCOST_DATA,
                    fieldId: FIELDS.COST_CATEGORY,
                    value: cost
                })
                if(line > -1){
                    landedcost.selectLine({
                        sublistId: FIELDS.LANDEDCOST_DATA,
                        line: line
                    });
                }else {
                    landedcost.selectNewLine({
                        sublistId: FIELDS.LANDEDCOST_DATA
                    });
                }
                landedcost.setCurrentSublistValue({
                    sublistId: FIELDS.LANDEDCOST_DATA,
                    fieldId: FIELDS.COST_CATEGORY,
                    value: cost
                });
                landedcost.setCurrentSublistValue({
                    sublistId: FIELDS.LANDEDCOST_DATA,
                    fieldId: FIELDS.COST_AMOUNT,
                    value: item.cost[cost]
                });
                landedcost.commitLine({
                    sublistId: FIELDS.LANDEDCOST_DATA
                })
            }

            log.debug('landedcost -length', landedcost.getLineCount({
                sublistId: FIELDS.LANDEDCOST_DATA
            }));

            itemreceipt.commitLine({
                sublistId: FIELDS.ITEM
            })
        })

        itemreceipt.save({
            ignoreMandatoryFields: true
        })
    }

    ItemReceipt.prototype.appliedToItems = function(params){
        var items = [];
        params.items.forEach(function(item, i){
            if(params.appliedTo.indexOf(item.id) > -1){
                items.push(item.id);
            }
        });
        return items;
    }

    return {
        ItemReceipt: ItemReceipt
    }
})