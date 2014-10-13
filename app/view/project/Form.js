Ext.define('CNDE.view.project.Form', {
   extend: 'Ext.form.Panel',
   alias: 'widget.projectform',
   uses: [
      'Ext.form.field.Text',
      'Ext.form.field.Checkbox',
   ],
   initComponent: function() {
      var config = {
         height: 'auto',
         width: 400,
         layout: 'anchor',
         defaults: { anchor: '100%' },
         bodyPadding: 10,
         defaultType: 'textfield',
         items: [{
            fieldLabel: 'Mine Property Name',
            name: 'minePropertyName'
         },{
            xtype: 'checkbox',
            fieldLabel: 'Use Metric Units?',
            name: 'isMetricUnits'
         },{
            xtype: 'fieldcontainer',
            layout: 'hbox',
            fieldLabel: 'Variable Lengths',
            defaults: { flex: 1, hideLabel: true, xtype: 'numberfield' },
            items: [{
               margin: '0 5 0 0',
               emptyText: 'VL 1',
               name: 'varLen1'
            },{
               margin: '0 5 0 0',
               emptyText: 'VL 2',
               name: 'varLen2'
            },{
               emptyText: 'VL 3',
               name: 'varLen3'
            }]
         },{
            xtype: 'fieldset',
            title: 'Drill Interval Margin',
            defaultType: 'numberfield',
            items: [{
               fieldLabel: 'Ratio',
               name: 'intervalMarginRatio'
            },{
               fieldLabel: 'Length',
               name: 'intervalMarginConstant'
            }]
         },{
            fieldLabel: 'Geomech Template',
            xtype: 'grid',
            // here's a bunch of smashed in form field methods because
            // i can't figure out how to get the mixin to apply
            isFormField: true,
            getName: function() { return 'gmListTemplate' },
            setValue: function(val) {
               this.formValue = val;
               return this;
            },
            isValid: function() { return true },
            isDirty: function() { return false },
            getModelData: function() {
               var cols = this.getSelectionModel().getSelection()
                  .map(function(r) { return r.data.name });
               return { gmListTemplate: cols };
            },
            height: 300,
            columns: [{
               header: 'Geomech Template',
               dataIndex: 'name',
               flex: 1
            }],
            selType: 'checkboxmodel',
            store: {
               fields: ['name'],
               data: CNDE.model.GeomechData.getFields()
            },
            listeners: {
               afterrender: function() {
                  if (this.formValue) {
                     var grid = this;
                     var val = this.formValue
                        .map(function(v){ return grid.getStore().findRecord('name', v) })
                         // reverse seems to avoid showing the last selected thing all the time
                        .reverse();
                     this.getSelectionModel().select(val);
                  }
               }
            }
         }],
         buttons: [{
            text: 'Save',
            itemId: 'save'
         }]
      };
      Ext.apply(this, config);
      this.callParent(arguments);
   }
});
