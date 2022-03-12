/**
 * @NApiVersion 2.1
 */
define(['N/log', 'N/record', 'N/search', 'N/error',
        '../const/nuage-landecost-allocation-list',
        '../lib/nuage-landedcost-allocation-settings'
    ],
    /**
 * @param{log} log
 * @param{record} record
 * @param{search} search
 */
    (log, record, search, error, NList, NSetting) => {


        /**
         * Calls the correct
         * @param {Object} params
         * @param {Object} params.items - List of items generated from allocation-receipt module.
         * @param {Object} params.allocation - JSON of allocation ID and amount ie: {"1": 100, "2", 500}
         * @since 2015.2
         */
        const calculate = (params) =>{

            log.debug('LandedCost.calculate', params);

            switch (params.method) {
                case NList.ALLOCATION_METHOD.WEIGHT:
                    _calculateWeight(params);
                    break;

                case NList.ALLOCATION_METHOD.QUANTITY:
                    _calculateQuantity(params);
                    break;

                case NList.ALLOCATION_METHOD.VALUE:
                    _calculateValue(params);
                    break;

                default:
                    break;
            }

        }

        /**
         * Calculated cost based on weight
         * @param {Object} params
         * @param {Record} params.items - List of items generated from allocation-receipt module.
         * @param {Record} params.allocation - JSON of allocation ID and amount ie: {"1": 100, "2", 500}
         * @since 2015.2
         */
        const _calculateWeight = (params) => {
            var total = 0;

            params.items.forEach(function(item,i){
                if(params.applied.indexOf(item.id) == -1) return;


                total += (item.weight * item.qty);
            });

            params.items.forEach(function(item,i){
                if(params.applied.indexOf(item.id) == -1) return;
                item.cost[params.allocation] = item.cost[params.allocation] || 0;
                item.cost[params.allocation] += (((item.weight * item.qty) / total) * params.amount);
            });

        }

        /**
         * Calculated cost based on item quantity
         * @param {Object} params
         * @param {Record} params.items - List of items generated from allocation-receipt module.
         * @param {Record} params.allocation - JSON of allocation ID and amount ie: {"1": 100, "2", 500}
         * @since 2015.2
         */
        const _calculateQuantity = (params) => {
            var total = 0;
            params.items.forEach(function(item,i){
                if(params.applied.indexOf(item.id) == -1) return;
                total += item.qty;
            });

            var cost = params.amount/total;

            log.debug('_calculateQuantity', cost);

            params.items.forEach(function (item, i) {
                if(params.applied.indexOf(item.id) == -1) return;

                log.debug('_calculateQuantity: '+item.id, item);

                item.cost[params.allocation]= item.cost[params.allocation] || 0;
                item.cost[params.allocation] += cost * item.qty;
            });

        }

        /**
         * Calculated cost based on amount/value from receipt
         * @param {Object} params
         * @param {Record} params.items - List of items generated from allocation-receipt module.
         * @param {Record} params.allocation - JSON of allocation ID and amount ie: {"1": 100, "2", 500}
         * @since 2015.2
         */
        const _calculateValue = (params) => {
            var total = 0;
            params.items.forEach(function(item,i){
                if(params.applied.indexOf(item.id) == -1) return;
                total += (item.rate * item.qty);
            });

            params.items.forEach(function(item,i){

                if(params.applied.indexOf(item.id) == -1) return;

                item.cost[params.allocation] = item.cost[params.allocation] || 0;
                item.cost[params.allocation] += ((item.rate * item.qty) / total) *  params.amount;
            });

            log.debug('_calculateQuantity', params.items);
        }


        const constructLandedCost = (params) =>{
            log.debug('constructLandedCost', params)
            let data = {
                subsidiary: params.subsidiary,
                currency: params.currency,
                tranid: params.tranid,
                lines: []
            }

            const BANK = NSetting.getAccount(
                params.subsidiary,
                params.currency
            );

            log.debug('constructLandedCost.BANK', BANK);

            if(!BANK){
                throw {
                    name: 'NO_LANDEDCOST_SETTING_SUBSIDIARY_CURRENCY',
                    message: ['Landed Cost Cash/Bank Account for Subsidiary: ' + params.subsidiary + ' and Currency: '+params.currency+' not found',
                        'Please setup Landed Cost account under Setup > NCG Landed Cost > Settings'].join('\n'),
                };
            }

            let total = 0;
            params.items.forEach(function(item, i){
                for(var i in item.cost){
                    var cost = item.cost[i].toFixed(2);

                    data.lines.push({
                        category: i,
                        account: item.cogs,
                        item: item.id,
                        entity: params.entity,
                        debit: cost
                    });
                    total += Number(cost);
                }
            });

            data.lines.push({
                account: BANK,
                credit:total
            });

            return data;
        }

        return {
            calculate:calculate,
            constructLandedCost
        }

    });
