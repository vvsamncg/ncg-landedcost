/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/log', 'N/record', 'N/ui/serverWidget',
        '../lib/nuage-landedcost-allocation-receipt'

    ],
    /**
 * @param{log} log
 * @param{record} record
 * @param{serverWidget} serverWidget
 */
    (log, record, serverWidget, Nreceipt) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */

        const FIELDS = {
            TRANSACTION: 'custpage_ngcs_receipt',

            SUBLIST_ITEM: 'custpage_ngcs_sublist_items',
            SELECT: 'custpage_ngcs_select',
            ITEM: 'custpage_ngcs_items',
            ITEM_LINE: 'custpage_ngcs_itemline',
            ITEM_DISPLAY: 'custpage_ngcs_items_disp',
            DESCRIPTION: 'custpage_ngcs_description',
            QTY: 'custpage_ngcs_qty'
        }

        const onRequest = (scriptContext) => {

            if(scriptContext.request.method != 'GET'){


                var items = [];
                var req = scriptContext.request;
                for(var x = 0; x < req.getLineCount({group: FIELDS.SUBLIST_ITEM}); x++){
                    var selected = req.getSublistValue({
                        group: FIELDS.SUBLIST_ITEM,
                        name: FIELDS.SELECT,
                        line: x
                    });

                    if(selected == 'T' || selected == true) {
                        items.push(req.getSublistValue({
                            group: FIELDS.SUBLIST_ITEM,
                            name: FIELDS.ITEM,
                            line: x
                        }));
                    }
                }

                var obj = new Object();
                obj.name = "items";
                obj.items  = items;
                var jsonString= JSON.stringify(obj);
                log.error('jsonString',jsonString);
                var sBody = '<html>';
                sBody += '<script>';
                sBody += "window.opener.require([" +
                    "'/SuiteScripts/com.nuagecg.landedcostallocation/components/nuage-landedcost-allocation-cs'], " +
                    "function(myModule) {";
                sBody += "myModule.addItem("+jsonString+");";
                sBody += "}); window.close();";
                sBody += '</script></html>';
                scriptContext.response.write(sBody);
                return;
            }

            try {
                const id = scriptContext.request.parameters.tranid;
                const receipt = scriptContext.request.parameters.receiptid;

                let form = serverWidget.createForm({
                    title: 'Select Items',
                    hideNavBar: true
                });

                form.addSubmitButton({
                    label: 'Add Item'
                })

                let action = form.addField({
                    id: 'custpage_form_action',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Form Action'
                });
                action.defaultValue = 'submit';
                action.updateDisplayType({
                    displayType : serverWidget.FieldDisplayType.HIDDEN
                });

                let receipt_fld = form.addField({
                    id: FIELDS.TRANSACTION,
                    type: serverWidget.FieldType.SELECT,
                    label: 'Transaction',
                    source: record.Type.ITEM_RECEIPT
                });
                receipt_fld.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                receipt_fld.defaultValue = receipt;



                let sublist = form.addSublist({
                    id: FIELDS.SUBLIST_ITEM,
                    type: serverWidget.SublistType.LIST,
                    label: 'Items'
                });
                sublist.addMarkAllButtons();

                sublist.addField({
                    id: FIELDS.SELECT,
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'Select'
                });

                var item_sub = sublist.addField({
                    id: FIELDS.ITEM_LINE,
                    type: serverWidget.FieldType.TEXT,
                    label: 'Item Line',
                    source: 'item'
                })

                item_sub.updateDisplayType({
                    displayType: serverWidget.SublistDisplayType.HIDDEN
                });

                item_id = sublist.addField({
                    id: FIELDS.ITEM,
                    type: serverWidget.FieldType.TEXT,
                    label: 'Item ID'
                })
                item_id.updateDisplayType({
                    displayType: serverWidget.SublistDisplayType.HIDDEN
                });

                sublist.addField({
                    id: FIELDS.ITEM_DISPLAY,
                    type: serverWidget.FieldType.TEXT,
                    label: 'Item'
                })


                sublist.addField({
                    id: FIELDS.DESCRIPTION,
                    type: serverWidget.FieldType.TEXT,
                    label: 'Description'
                });

                sublist.addField({
                    id: FIELDS.QTY,
                    type: serverWidget.FieldType.INTEGER,
                    label: 'Quantity'
                });

                addItems({
                    id: receipt,
                    sublist: sublist
                });

                scriptContext.response.writePage(form);
            }catch(e){
                log.debug('Error', e)
            }

        }

        function addItems(params){
            var items = new Nreceipt.ItemReceipt()
                .getItemsByTransaction({
                tranid: params.id
            });
            items.forEach(function(row,i){
                params.sublist.setSublistValue({
                    id: FIELDS.ITEM_LINE,
                    line: i,
                    value: row.line
                });

                params.sublist.setSublistValue({
                    id: FIELDS.ITEM,
                    line: i,
                    value: row.id
                })
                if(row.description)
                    params.sublist.setSublistValue({
                        id: FIELDS.DESCRIPTION,
                        line: i,
                        value: row.description
                    })

                params.sublist.setSublistValue({
                    id: FIELDS.ITEM_DISPLAY,
                    line: i,
                    value: row.itemname
                })
                params.sublist.setSublistValue({
                    id: FIELDS.QTY,
                    line: i,
                    value: row.qty.toFixed(0)
                })
            })
        }


        return {onRequest}

    });
