/**
 * @NApiVersion 2.1
 */
define(['N/log'],
    /**
 * @param{log} log
 */
    (log) => {

        const PROCESS_SL = {
            SCRIPT: 'customscript_ngcs_lcost_al_process',
            DEPLOYMENT: 'customdeploy_ngcs_lcost_al_process'
        }

        const ALLOCATION_METHOD = {
            WEIGHT: '1',
            QUANTITY: '2',
            VALUE: '3'
        }

        const STATUS = {
            PENDING: '1',
            IN_PROGRESS: '2',
            COMPLETED: '3',
            FAILED: '4',
            CANCELLED: '5'
        }

        return {PROCESS_SL, ALLOCATION_METHOD, STATUS}

    });
