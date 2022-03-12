/**
 * @NApiVersion 2.1
 */
define(['N/log', 'N/record'],
    /**
 * @param{log} log
 * @param{record} record
 */
    (log, record) => {
        const RECORD_TYPE = 'customrecord_ngcs_lcost_al';
        const FIELDS = {
            STATUS: 'custrecord_ngcs_lcost_al_status',
            MESSAGE: 'custrecord_ngcs_lcost_al_msg',
            ALLOCATED: 'custrecord_ngcs_lcost_al_confirm',
            NEW_ALLOCATION: 'custrecord_ngcs_lcost_al_period'
        }

        const updateLog = (params) => {

            var f = {};
            if(params.status){
                f[FIELDS.STATUS] = params.status;
            }
            if(params.newallocation){
                f[FIELDS.NEW_ALLOCATION] = params.newallocation;
            }
            if(params.message){
                f[FIELDS.MESSAGE] = params.message;
            }
            if(params.allocated == true){
                f[FIELDS.ALLOCATED] = true
            }else{
                f[FIELDS.ALLOCATED] = false;
            }

            record.submitFields({
                type: RECORD_TYPE,
                id: params.id,
                values: f
            });
        }

        return {updateLog}

    });
