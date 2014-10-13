Ext.define('CNDE.store.CoreSize', {
   extend: 'Ext.data.ArrayStore',
   fields: [ 'coreSize', 'diameter', 'rqdLen', 'diaUnit', 'rqdUnit' ],
   setMetricMode: function() {
      console.log('metric core size');
      this.loadRawData([
         //       mm    cm
         ['PQ',   85.0, 17, 'mm', 'cm'],
         ['PQ-3', 83.0, 17, 'mm', 'cm'],
         ['HQ',   63.5, 13, 'mm', 'cm'],
         ['HQ-3', 61.1, 12, 'mm', 'cm'],
         ['NQ',   47.6, 10, 'mm', 'cm'],
         ['NQ-3', 45.0,  9, 'mm', 'cm'],
         ['BQ',   36.4,  7, 'mm', 'cm'],
         ['BQ-3', 33.5,  7, 'mm', 'cm']
      ]);
   },
   setEnglishMode: function() {
      console.log('english core size');
      this.loadRawData([
         //       inch   ft
         ['PQ',   3.345, 0.6, 'in', 'ft'],
         ['PQ-3', 3.270, 0.6, 'in', 'ft'],
         ['HQ',   2.500, 0.4, 'in', 'ft'],
         ['HQ-3', 2.406, 0.4, 'in', 'ft'],
         ['NQ',   1.875, 0.3, 'in', 'ft'],
         ['NQ-3', 1.775, 0.3, 'in', 'ft'],
         ['BQ',   1.433, 0.2, 'in', 'ft'],
         ['BQ-3', 1.320, 0.2, 'in', 'ft']
      ]);
   }
});
