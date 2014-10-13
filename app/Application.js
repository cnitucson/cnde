Ext.application({
   name: 'CNDE',
   requires: ['Ext.container.Viewport', 'Ext.layout.container.Border'],
   controllers: [ 'Project', 'GeomechData', 'ImportExport' ],
   launch: function() {
      Ext.create('Ext.container.Viewport', {
         layout: 'border',
         defaults: {
            border: false,
         },
         items: [{
            title: 'Project Selection',
            region: 'west',
            collapsible: true,
            split: true,
            layout: {
               type: 'vbox',
               align: 'stretch'
            },
            flex: 1,
            items: [{
               xtype: 'projectlist',
               flex: 1
            },{
               xtype: 'drillholelist',
               title: 'Drill Holes',
               flex: 1
            }]
         },{
            title: 'Geomech Data',
            region: 'center',
            layout: 'border',
            flex: 3,
            items: [{
               xtype: 'geomechlist',
               disabled: true,
               region: 'center',
               flex: 3
            },{
               xtype: 'feedbacklist',
               title: 'Feedback',
               region: 'south',
               split: true,
               hidden: true,
               flex: 1
            }]
         }]
      });
   }
});
