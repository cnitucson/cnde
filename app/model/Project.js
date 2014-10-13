Ext.define('CNDE.model.Project', {
   extend: 'Ext.data.Model',
   fields: [
      'id',
      'minePropertyName',
      'isMetricUnits',
      'varLen1',
      'varLen2',
      'varLen3',
      { name: 'intervalMarginRatio',    defaultValue: 1.2 },
      { name: 'intervalMarginConstant', defaultValue: 0.8 },
      'gmListTemplate'
   ],
   proxy: {
      type: 'localstorage',
      id: 'project'
   },
   hasMany: { model: 'DrillHole', name: 'drillHoles' },
   validations: [
      { type: 'presence', field: 'minePropertyName' }
   ]
});

