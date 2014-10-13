Ext.define('CNDE.controller.Project', {
   extend: 'Ext.app.Controller',
   views: [
      'project.List',
      'project.Form',
      'drillhole.List',
      'drillhole.Form',
      'geomechdata.List'
   ],
   stores: ['Project', 'DrillHole', 'GeomechData', 'CoreSize'],
   models: ['Project', 'DrillHole', 'GeomechData'],
   refs: [{
      ref: 'projectList',
      selector: 'projectlist'
   },{
      ref: 'drillHoleList',
      selector: 'drillholelist'
   },{
      ref: 'geomechDataList',
      selector: 'geomechlist'
   },{
      ref: 'feedbackList',
      selector: 'feedbacklist'
   }],
   init: function() {
      var deleteDrillHole = function(hole) {
         var gmStore = new CNDE.store.GeomechData().load();
         gmStore.filter({ property: 'drillHoleID', value: hole.data.id });
         gmStore.remove(gmStore.getRange());
         gmStore.clearFilter();
         gmStore.sync();
         var dhStore = hole.store;
         dhStore.remove(hole);
         dhStore.sync();
      };
      this.control({
         projectlist: {
            select: function(selModel, rec) {
               var dhStore = this.getDrillHoleStore(),
                  gmStore = this.getGeomechDataStore(),
                  gmGrid = this.getGeomechDataList(),
                  dhGrid = this.getDrillHoleList();
               dhStore.load();
               dhStore.clearFilter();
               dhStore.filter({ property: 'projectID', value: rec.data.id });
               dhStore.baseParams = {
                  projectID: rec.data.id,
                  isMetricUnits: rec.data.isMetricUnits
               };

               dhGrid.getSelectionModel().deselectAll();
               dhGrid.setTitle(rec.data.minePropertyName + ' - Drill Holes');
               this.getFeedbackList().hide();
               gmGrid.disable();

               rec.data.isMetricUnits ?
                  this.getCoreSizeStore().setMetricMode() :
                  this.getCoreSizeStore().setEnglishMode();

               gmStore.baseParams = {
                  isMetricUnits: rec.data.isMetricUnits,
                  varLengths: [rec.data.varLen1, rec.data.varLen2, rec.data.varLen3],
                  intervalMarginRatio: rec.data.intervalMarginRatio,
                  intervalMarginConstant: rec.data.intervalMarginConstant
               };
               gmGrid.setVariableLengthValues(gmStore.baseParams.varLengths);
               var template = rec.get('gmListTemplate');
               if (template)
                  gmGrid.layoutColumns(template);
               else
                  gmGrid.resetColumns();
            }
         },
         'projectlist button[itemId=new]': {
            click: function(me) {
               var form = Ext.create('widget.projectform');
               form.grid = me.up('projectlist');
               var rec = this.getModel('Project').create({});
               form.loadRecord(rec);
               Ext.create('widget.window', {
                  layout: 'fit',
                  title: 'New Project',
                  items: [form]
               }).show();
            }
         },
         'projectlist button[itemId=edit]': {
            click: function(me) {
               var project = me.up('projectlist')
                  .getSelectionModel().getSelection().pop();
               if (project) {
                  var form = Ext.create('widget.projectform');
                  form.grid = me.up('projectlist');
                  form.loadRecord(project);
                  Ext.create('widget.window', {
                     layout: 'fit',
                     title: 'Edit Project',
                     items: [form]
                  }).show();
               }
            }
         },
         'projectlist button[itemId=delete]': {
            click: function(me) {
               var project = me.up('projectlist')
                  .getSelectionModel().getSelection().pop();
               if (project) {
                  Ext.Msg.show({
                     title: 'Delete Project?',
                     msg: 'Do you want to delete this project?',
                     buttons: Ext.Msg.OKCANCEL,
                     buttonText: {ok: 'Delete It', cancel: 'Cancel'},
                     scope: this,
                     fn: function(button) {
                        if (button === 'ok') {
                           var dhStore = new CNDE.store.DrillHole().load();
                           dhStore.filter({
                              property: 'projectID',
                              value: project.data.id
                           });
                           dhStore.getRange().forEach(deleteDrillHole);
                           dhStore.clearFilter();
                           dhStore.sync();
                           var pStore = project.store;
                           pStore.remove(project);
                           pStore.sync();
                        }
                     }
                  })
               }
            }
         },
         'drillholelist': {
            select: function(selModel, rec) {
               var gmStore = this.getGeomechDataStore();
               console.log('set GM store hole id to ', rec.data.id);
               gmStore.baseParams =
                  Ext.apply({},{ drillHoleID: rec.data.id }, gmStore.baseParams);
               gmStore.load();
               gmStore.clearFilter();
               gmStore.filter({ property: 'drillHoleID', value: rec.data.id });
               this.getGeomechDataList().up('[region="center"]')
                  .setTitle(rec.data.name + ' - Geomech Data');
               this.getFeedbackList().hide();
               this.getGeomechDataList().enable();
            }
         },
         'drillholelist button[itemId=new]': {
            click: function(me) {
               var bp = this.getDrillHoleStore().baseParams,
                  form = Ext.create('widget.drillholeform'),
                  rec = this.getModel('DrillHole').create(bp);
               form.grid = me.up('drillholelist');
               form.loadRecord(rec);
               Ext.create('widget.window', {
                  height: 400,
                  width: 450,
                  layout: 'fit',
                  title: 'New Drill Hole',
                  items: [form]
               }).show();
            }
         },
         'drillholelist button[itemId=edit]': {
            click: function(me) {
               var hole = me.up('drillholelist')
                  .getSelectionModel().getSelection().pop();
               if (hole) {
                  var form = Ext.create('widget.drillholeform');
                  form.grid = me.up('drillholelist');
                  form.loadRecord(hole);
                  Ext.create('widget.window', {
                     height: 400,
                     width: 450,
                     layout: 'fit',
                     title: 'Edit Drill Hole',
                     items: [form]
                  }).show();
               }
            }
         },
         'drillholelist button[itemId=delete]': {
            click: function(me) {
               var hole = me.up('drillholelist')
                  .getSelectionModel().getSelection().pop();
               if (hole) {
                  Ext.Msg.show({
                     title: 'Delete Drill Hole?',
                     msg: 'Do you want to delete this drill hole?',
                     buttons: Ext.Msg.OKCANCEL,
                     buttonText: {ok: 'Delete It', cancel: 'Cancel'},
                     scope: this,
                     fn: function(button) {
                        if (button === 'ok') {
                           deleteDrillHole(hole);
                        }
                     }
                  })
               }
            }
         },
         'window form button[itemId=save]': {
            click: function(me) {
               var form = me.up('form').getForm();
               var rec = form.updateRecord().getRecord();
               if (rec.isValid()) {
                  rec.save();
                  var grid = me.up('form').grid;
                  grid.getStore().reload();
                  grid.getSelectionModel().select(rec);
                  me.up('window').close();
               } else {
                  form.markInvalid(rec.validate());
               }
            }
         },
         'projectlist, drillholelist': {
            beforeselect: function(selModel, rec) {
               if (this.getGeomechDataStore().getModifiedRecords().length) {
                  console.log('unsaved changes in GM grid!');
                  Ext.Msg.alert('Unsaved Changes',
                     'There is unsaved data in the Geomechanical Data Grid. Save or discard your changes before switching to another drill hole or project.');
                  return false;
               }
            }
         },
         'projectform checkbox[name=isMetricUnits]': {
            change: function(field, newVal, oldVal) {
               var marginDefaults = {
                  false: { ratio: 1.2, constant: 0.8 }, // US
                  true : { ratio: 1.2, constant: 0.2 }  // metric
               };
               var ratioField = field.up('form').down('[name=intervalMarginRatio]');
               var constField = field.up('form').down('[name=intervalMarginConstant]');
               var isOldDefault =
                  ratioField.getValue() === marginDefaults[oldVal].ratio &&
                  constField.getValue() === marginDefaults[oldVal].constant;
               if (isOldDefault) {
                  ratioField.setValue(marginDefaults[newVal].ratio);
                  constField.setValue(marginDefaults[newVal].constant);
               }
            }
         }
      });
   }
});
