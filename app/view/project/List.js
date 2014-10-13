Ext.define('CNDE.view.project.List', {
   extend: 'Ext.grid.Panel',
   alias: 'widget.projectlist',
   initComponent: function() {
      var config = {
         store: 'Project',
         columns: {
            items: [{
               header: 'ID',
               dataIndex: 'id',
               width: 40
            },{
               header: 'Mine Name',
               dataIndex: 'minePropertyName',
               flex: 1
            }]
         },
         tbar: [{
            text: 'New',
            itemId: 'new'
         },{
            text: 'Edit',
            itemId: 'edit'
         },'->',{
            text: 'Delete',
            itemId: 'delete'
         }]
      };
      Ext.apply(this, config);
      this.callParent(arguments);
   }
});
