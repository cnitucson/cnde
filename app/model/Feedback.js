Ext.define('CNDE.model.Feedback', {
   extend: 'Ext.data.Model',
   fields: [ 
      'geomechRec',
      'errorCode',
      'description'
   ]
   // ,proxy: {
   //    type: 'localstorage',
   //    id: 'feedback'
   // }
});
