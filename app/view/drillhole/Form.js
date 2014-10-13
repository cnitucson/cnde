Ext.define('CNDE.view.drillhole.Form', {
   extend: 'Ext.form.Panel',
   alias: 'widget.drillholeform',
   uses: [
      'Ext.form.field.Text',
      'Ext.form.field.ComboBox',
      'Ext.form.FieldSet',
      'Ext.form.FieldContainer'
   ],
   initComponent: function() {
      var config = {
         layout: 'anchor',
         defaults: { anchor: '100%' },
         bodyPadding: 10,
         defaultType: 'textfield',
         fieldDefaults: { labelWidth: 150 },
         items: [{
            fieldLabel: 'Mine Area',
            name: 'mineArea'
         },{
            fieldLabel: 'Drill Hole ID',
            name: 'name'
         },{
            xtype: 'fieldset',
            title: 'Collar Position',
            items: [{
               xtype: 'fieldcontainer',
               layout: 'hbox',
               fieldLabel: 'Easting, Northing, Elev',
               defaults: { flex: 1, hideLabel: true, xtype: 'numberfield' },
               items: [{
                  margin: '0 5 0 0',
                  emptyText: 'East',
                  name: 'collarX'
               },{
                  margin: '0 5 0 0',
                  emptyText: 'North',
                  name: 'collarY'
               },{
                  emptyText: 'Elev',
                  name: 'collarZ'
               }]
            },{
               xtype: 'fieldcontainer',
               layout: 'hbox',
               fieldLabel: 'Bearing, Inclination',
               defaults: { flex: 1, hideLabel: true, xtype: 'numberfield' },
               items: [{
                  margin: '0 5 0 0',
                  emptyText: 'Bearing',
                  name: 'collarBearing'
               },{
                  emptyText: 'Inclination',
                  name: 'collarInclination'
               }]
            }]
         },{
            xtype: 'textarea',
            fieldLabel: 'Comments',
            name: 'comments'
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
