Ext.define('CNDE.controller.GeomechData', {
   extend: 'Ext.app.Controller',
   views: ['geomechdata.List', 'feedback.List'],
   stores: ['GeomechData','Feedback'],
   models: ['GeomechData', 'Feedback', 'DrillHole', 'Project'],
   refs: [{
      ref: 'feedbackList',
      selector: '[xtype="feedbacklist"]'
   },{
      ref: 'geomechList',
      selector: 'geomechlist'
   }],
   init: function() {
      this.control({
         'geomechlist': {
            selectionchange: function(selModel, selection) {
               var pos = selModel.getCurrentPosition();
               // add in a new row if selection is last row
               if (pos && pos.row == selModel.getStore().count() - 1) {
                  selModel.getStore().add({});
               }
            }
         },
         'geomechlist button[itemId=save]': {
            click: function(me) {
               this.getGeomechDataStore().syncWithoutValidation();
            }
         },
         'geomechlist button[itemId=validate]': {
            click: function(me) {
               var allErrors = [];
               this.getGeomechDataStore().each(function(rec) {
                  if (rec.isValid())
                     console.log('Row failed validation', rec);
                  var errors = rec.validate();
                  errors.each(function(e) { console.warn(e.message, e) });
                  allErrors = allErrors.concat(
                     errors.getRange().map(function(e) {
                        e.geomechRec = rec;
                        return e
                     })
                  );
               });
               console.log('total errors', allErrors);
               if (allErrors.length === 0) {
                  this.getFeedbackList().hide();
               } else {
                  this.getFeedbackList().show();
                  this.getFeedbackStore().loadData(
                     allErrors.map(function(e) {
                        e.description = e.message;
                        return e
                     })
                  );
               }
            }
         },
         'geomechlist button[itemId=discard]': {
            click: function(me) {
               this.getGeomechDataStore().reload();
               this.getFeedbackList().hide();
            }
         },
         'geomechlist button[itemId=deleterow]': {
            click: function(me) {
               var row = me.up('geomechlist')
                  .getSelectionModel().getSelection().pop();
               if (row) {
                  this.getGeomechDataStore().remove(row);
               }
            }
         },
         'feedbacklist': {
            itemdblclick: function(grid, rec, el, index) {
               var gmGrid = this.getGeomechList();
               console.log('show this row: ', rec.get('geomechRec'));
               gmGrid.getSelectionModel().select([rec.get('geomechRec')]);
            },
            show: {
               single: true,
               // i'd rather have this in the feedback view but i'm not sure how...
               fn: function(grid) {
                  var col = grid.columns
                     .filter(function(c){return c.dataIndex === 'geomechRec'}).pop();
                  var scope = this;
                  col.renderer = function(val) {
                     var index = scope.getGeomechDataStore().indexOf(val);
                     return index !== undefined ? index + 1 : '?'
                  };
               }
            }
         }
      });
      this.getGeomechDataStore().on({
         filterchange: function(store) {
            if (store.getCount() === 0) {
               store.add({});
               Ext.log('empty store, added blank row');
            }
         },
         add: function(store, recs) {
            console.log('added record, tack on drill hole', recs, recs.length);
            console.log('bp:', store.baseParams);
            if (store.baseParams) {
               recs.forEach(function(r) {
                  r.set(store.baseParams);
                  // don't call it dirty until the user edits it
                  r.dirty = false;
               });
            }
            if (recs.length === 1) {
               var rec = recs[0];
               // copy previous line's core size to new one
               var index = store.indexOf(rec);
               if (index > 0) {
                  console.log('add coresize to row at index ', index);
                  rec.set('coreSize', store.getAt(index - 1).get('coreSize'));
                  rec.dirty = false;
               }
            }
         }
      });
   }
});
