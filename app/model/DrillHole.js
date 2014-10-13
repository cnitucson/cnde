Ext.define('CNDE.model.DrillHole', {
   extend: 'Ext.data.Model',
   fields: [
      'id',
      'projectID',
      'mineArea',
      'name',
      'collarX',
      'collarY',
      'collarZ',
      'collarBearing',
      'collarInclination',
      'comments'
   ],
   proxy: {
      type: 'localstorage',
      id: 'drillhole'
   },
   belongsTo: { model: 'Project', name: 'project' },
   hasMany: { model: 'GeomechData', name: 'geomechData' },
   validations: [
      { type: 'presence', field: 'mineArea' },
      { type: 'presence', field: 'name' }
   ]
});

