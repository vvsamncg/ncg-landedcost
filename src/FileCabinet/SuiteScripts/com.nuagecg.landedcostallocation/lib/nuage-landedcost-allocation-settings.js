/**
 * @NApiVersion 2.1
 */
define(['N/search'],
    /**
 * @param{search} search
 */
    (search) => {

        const RECORD_TYPE = 'customrecord_ngcs_lcost_al_setting';
        const Fields = {
            SUBSIDIARY: 'custrecord_ngcs_lcost_al_subsidiary',
            CURRENCY: 'custrecord_ngcs_lcost_al_setting_cur',
            ACCOUNT: 'custrecord_ngcs_lcost_al_setting_cash'
        }

        const getAccount = (subsidiaryId, currencyId) => {
            let currency = ['@NONE@'];
            if(currencyId) currency.push(currencyId);

            return search.create({
               type: RECORD_TYPE,
               filters:[
                    search.createFilter({
                        name: Fields.SUBSIDIARY,
                        operator: search.Operator.ANYOF,
                        values: [subsidiaryId]
                    }),
                   search.createFilter({
                       name: Fields.CURRENCY,
                       operator: search.Operator.ANYOF,
                       values: currency
                   })
               ],
               columns:[
                    search.createColumn({
                        name: Fields.CURRENCY,
                        sort: search.Sort.DESC
                    }),
                   search.createColumn({
                       name: Fields.ACCOUNT
                   })
               ]
            })
            .run()
            .getRange({start:0,end:1})
                .reduce(function(res, result) {
                    return result.getValue({name: Fields.ACCOUNT}) || null;
                }, null);
        }

        return {getAccount}

    });
