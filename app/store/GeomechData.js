Ext.define('CNDE.store.GeomechData', {
   extend: 'Ext.data.Store',
   model: 'CNDE.model.GeomechData',
   filterNew: function(item) {
      return item.phantom === true && !item.isBlank()
   },
   // we want dirty rows even if they're not valid
   filterUpdated: function(item) {
      return item.dirty === true && item.phantom !== true;
   },
   syncWithoutValidation: function() {
      this.getModifiedRecords().forEach( function(rec) {
         if (!rec.isBlank()) rec.save();
      });
   }
});
