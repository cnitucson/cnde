Ext.define('CNDE.view.drillhole.List', {
   extend: 'Ext.grid.Panel',
   alias: 'widget.drillholelist',
   requires: ['widget.splitbutton'],
   initComponent: function() {
      var config = {
         store: 'DrillHole',
         columns: {
            items: [{
               header: 'ID',
               dataIndex: 'id',
               width: 40
            },{
               header: 'Area',
               dataIndex: 'mineArea',
               flex: 1
            },{
               header: 'Drill Hole ID',
               dataIndex: 'name',
               flex: 1
            }]
         },
         tbar: [{
            text: 'New',
            itemId: 'new'
         },{
            text: 'Edit',
            itemId: 'edit'
         },{
            xtype: 'splitbutton',
            text: 'Export',
            itemId: 'export',
            menu: [{
               text: 'CSV',
               itemId: 'csv-export'
            },{
               text: 'Transfer',
               itemId: 'json-export'
            }]
         },'->',{
            text: 'Delete',
            itemId: 'delete'
         }]
      };
      Ext.apply(this, config);
      this.callParent(arguments);
   }
});
