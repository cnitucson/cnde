Ext.define('CNDE.view.feedback.List', {
   extend: 'Ext.grid.Panel',
   alias: 'widget.feedbacklist',
   uses: [
      'Ext.grid.RowNumberer'
   ],
   initComponent: function() {
      var config = {
         store: 'Feedback',
         columns: {
            items: [{
               xtype: 'rownumberer',
               width: 45
            },{
               header: 'Line Number',
               dataIndex: 'geomechRec',
               width: 100
            }, {
               header: 'Error',
               dataIndex: 'errorCode',
               width: 100
            }, {
               header: 'Description',
               dataIndex: 'description',
               flex: 1
            }]
         }
      };
      Ext.apply(this, config);
      this.callParent(arguments);
   }
});
