/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/log', 'N/record', 'N/search', 'N/url', 'N/redirect','N/ui/message',
        '../const/nuage-landecost-allocation-list'
    ],
    /**
 * @param{log} log
 * @param{record} record
 * @param{search} search
 */
    (log, record, search,url, redirect, message, Nlist) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {

            const PROCESS_BTN = 'custpage_nuagecg_allocation';
            const PROCESS_BTN_LBL = 'Process Landed Cost';
            const FIELDS = {
                SUBLIST_LANDED: 'recmachcustrecord_ngcs_lcost_al_parent',
                SUBLIST_ALLOCATED: 'custrecord_ngcs_lcost_al_confirm'
            };

            if(scriptContext.type != 'view'){
                return;
            }

            var ns = record.load({
                type: scriptContext.newRecord.type,
                id: scriptContext.newRecord.id
            })

            for(var i = 0; i < ns.getLineCount({sublistId: FIELDS.SUBLIST_LANDED}); i++){
                var allocated = ns.getSublistValue({
                    sublistId: FIELDS.SUBLIST_LANDED,
                    fieldId: FIELDS.SUBLIST_ALLOCATED,
                    line: i
                });
                log.debug('Line', allocated)
                if(allocated != 'T'){
                    var link = url.resolveScript({
                        scriptId: Nlist.PROCESS_SL.SCRIPT,
                        deploymentId: Nlist.PROCESS_SL.DEPLOYMENT,
                        params:{
                            billid: ns.id
                        }
                    });

                    scriptContext.form.addButton({
                        id: PROCESS_BTN,
                        label: PROCESS_BTN_LBL,
                        functionName: "eval(window.location='" + link + "')"
                    });
                    break;
                }
            }
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            const UPDATES = ['create', 'edit'];

            if (UPDATES.indexOf(scriptContext.type) == -1) return;

            /*
            var link = url.resolveScript({
                scriptId: Nlist.PROCESS_SL.SCRIPT,
                deploymentId: Nlist.PROCESS_SL.DEPLOYMENT,
            });

            redirect.redirect({
                url: link,
                parameters: {
                    billid: scriptContext.newRecord.id
                }
            })*/
        }


        return {beforeLoad, beforeSubmit, afterSubmit}

    });
