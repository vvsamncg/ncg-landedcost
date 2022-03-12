/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record', 'N/url', 'N/currentRecord', 'N/ui/dialog'],
/**
 * @param{log} log
 * @param{record} record
 */
function(log, record, url, currentRecord, dialog) {


    const FIELDS = {
        SELECT: 'custrecord_ngcs_lcost_al_select',
        TOTAL: 'usertotal',

        SUBLIST_LANDED: 'recmachcustrecord_ngcs_lcost_al_parent',
        SUBLIST_RECEIPT: 'custrecord_ngcs_lcost_al_trx',
        SUBLIST_ITEM: 'custrecord_ngcs_lcost_al_items',
        SUBLIST_ALLOCATED: 'custrecord_ngcs_lcost_al_confirm',
        SUBLIST_AMOUNT: 'custrecord_ngcs_lcost_al_amount',
        SUBLIST_CATEGORY: 'custrecord_ngcs_lcost_al_method'
    }

    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {

    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {

        log.debug('Receipt', scriptContext);

        if(scriptContext.fieldId != FIELDS.SELECT){
            return true;
        };

        var receiptid = scriptContext.currentRecord.getCurrentSublistValue({
            sublistId: FIELDS.SUBLIST_LANDED,
            fieldId: FIELDS.SUBLIST_RECEIPT
        });

        log.debug('Receipt', receiptid);
        console.log('receiptid');

        if(!receiptid){
            return;
        }

        scriptContext.currentRecord.setCurrentSublistValue({
            sublistId: FIELDS.SUBLIST_LANDED,
            fieldId: scriptContext.fieldId,
            value: false,
            ignoreFieldChange: true
        });

        var sUrl = url.resolveScript({
            scriptId: 'customscript_ngcs_lcost_al_item_view',//list.PROCESS_SL.SCRIPT,
            deploymentId: 'customdeploy_ngcs_lcost_al_item_view',//list.PROCESS_SL.DEPLOYMENT
        }) + '&receiptid=' + receiptid;

        log.debug('sUrl', sUrl);

        window.open(
            sUrl,
            'Add Items',
            'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + 1200 + ', height=' + 600);
    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {

    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(scriptContext) {
        if(scriptContext.sublistId != FIELDS.SUBLIST_LANDED) return true;

        var allocated = scriptContext.currentRecord.getCurrentSublistValue({
            sublistId: FIELDS.SUBLIST_LANDED,
            fieldId: FIELDS.SUBLIST_ALLOCATED
        });
        var subobj =  scriptContext.currentRecord.getSublist({
            sublistId: FIELDS.SUBLIST_LANDED
        });

        console.log(allocated);
        if(allocated == 'T'){
            subobj.getColumn({
                fieldId: FIELDS.SUBLIST_AMOUNT
            }).isDisabled = true;

            subobj.getColumn({
                fieldId: FIELDS.SUBLIST_CATEGORY
            }).isDisabled = true;
            subobj.getColumn({
                fieldId: FIELDS.SELECT
            }).isDisabled = true;
        }else{

            subobj.getColumn({
                fieldId: FIELDS.SUBLIST_AMOUNT
            }).isDisabled = false;
            subobj.getColumn({
                fieldId: FIELDS.SUBLIST_CATEGORY
            }).isDisabled = false;
            subobj.getColumn({
                fieldId: FIELDS.SELECT
            }).isDisabled = false;
        }
    }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(scriptContext) {

    }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(scriptContext) {
      
    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
        var line = 0;
        var total = Number(scriptContext.currentRecord.getValue({fieldId: FIELDS.TOTAL}));

        for(var i = 0; i < scriptContext.currentRecord.getLineCount({sublistId:FIELDS.SUBLIST_LANDED}); i++){
            line += Number(scriptContext.currentRecord.getSublistValue({
                sublistId:FIELDS.SUBLIST_LANDED,
                fieldId: FIELDS.SUBLIST_AMOUNT,
                line: i
            }));
        }

        if(line != 0 && total < line){
            dialog.alert({
               title: 'Invalid allocation',
               message: 'Total allocated amount is not equal to Transaction Total.'
            });
            return false;
        }
        return true;
    }

    function addItem(data){
        console.log(data);
        currentRecord.get().setCurrentSublistValue({
            sublistId: FIELDS.SUBLIST_LANDED,
            fieldId: FIELDS.SUBLIST_ITEM,
            value: data.items
        })
    }

    return {
        fieldChanged: fieldChanged,
        addItem:addItem,
        lineInit:lineInit,
        saveRecord:saveRecord
    };
    
});
