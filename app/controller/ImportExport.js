Ext.define('CNDE.controller.ImportExport', {
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
      this.control({
         'drillholelist splitbutton[itemId=export]': {
            click: this.exportHoleCSV
         },
         'drillholelist menuitem[itemId=csv-export]': {
            click: this.exportHoleCSV
         },
         'drillholelist menuitem[itemId=json-export]': {
            click: this.exportHoleJSON
         }
      });
      document.addEventListener('dragover', function(e) {
         //TODO provide some visual feedback that this is a thing
         e.stopPropagation();
         e.preventDefault();
         e.dataTransfer.dropEffect = 'copy';
      });
      document.addEventListener('drop', this.importHoleJSON.bind(this) );
   },
   // these export functions should be de-duped where possible
   exportHoleCSV: function(me) {
      // we need an unfiltered store
      var gmStore = new CNDE.store.GeomechData().load();
      var hole = me.up('drillholelist')
         .getSelectionModel().getSelection().pop();
      if (hole) {
         var project = this.getProjectStore()
            .getById(hole.get('projectID'));
         var template = project.get('gmListTemplate');
         template = CNDE.model.GeomechData.canonicalFieldSort(template);

         var rows = gmStore.getRange()
            .filter(function(r) { return r.data.drillHoleID === hole.data.id })
            .map(function(r) { return r.fieldSlice(template).join(',') })
            .join('\n');
         var filename = hole.get('name').replace(/\W/g,'_')
            .concat(Ext.Date.format(new Date(), '-Y-m-d'));

         // show configured varlens headers
         template = template.map( function(name) {
            if (name.match(/varlen(\d)/i)) {
               return name +'_'+ project.get(name);
            }
            else return name;
         });

         saveAs(
            new Blob( [[ template.join(','), rows ].join('\n')],
               {type: 'text/csv'} ),
            filename+'.csv');
      }
   },
   exportHoleJSON: function(me) {
      var pack,
         gmStore = new CNDE.store.GeomechData().load(),
         hole = me.up('drillholelist')
         .getSelectionModel().getSelection().pop();
      if (hole) {
         console.log('json export for hole', hole.data.id);
         var project = this.getProjectStore()
            .getById(hole.get('projectID'));
         pack = hole.getData();
         pack.project = project.getData();
         pack.geomechData = gmStore.getRange()
            .filter(function(r) { return r.data.drillHoleID === hole.data.id })
            .map(function(r) { return r.getData() })
         console.log('export this', pack);

         var filename = hole.get('name').replace(/\W/g,'_')
            .concat(Ext.Date.format(new Date(), '-Y-m-d'));
         saveAs(
            new Blob( [JSON.stringify(pack, null, 4)],
               {type: 'application/json'} ),
            filename+'.json');
      }
   },
   importHoleJSON: function(e) {
      e.stopPropagation();
      e.preventDefault();
      console.log('import', e.dataTransfer.files);
      if (e.dataTransfer.files) {
         Ext.each(e.dataTransfer.files, function(file) {
            var reader = new FileReader();
            reader.onloadend = this.exceptionWrapper(this.handleFileLoad).bind(this);
            console.log('import file', file.name);
            reader.readAsText(file);
         }, this);
      }
   },
   handleFileLoad: function(evnt) {
      var dhStore = new CNDE.store.DrillHole().load(),
         gmStore = new CNDE.store.GeomechData().load(),
         importHole, project, hole;
      try {
         importHole = JSON.parse(evnt.target.result)
      } catch (e) {
         throw 'JSONParseFail'
      }
      importHole = this.sanitizeImportHole(importHole);
      console.log('looks like this: ', importHole);
      project = this.getProjectStore()
         .findRecord('minePropertyName', importHole.project.minePropertyName);
      if (! project ) {
         project = this.getProjectStore().add(importHole.project).pop();
         this.getProjectStore().sync();

         hole = this.addHole(dhStore, importHole, project);
         this.addGmData(gmStore, importHole.geomechData, hole);
      } else {
         // check project is the same
         if (! this.doProjectsMatch(project.getData(), importHole.project) )
            throw {
               type: 'projDiff',
               name: project.get('minePropertyName'),
               diff: this.compareProjects(project.getData(), importHole.project),
               toString: function() { return this.type }
            };
         // check for hole
         dhStore.filter('projectID', project.get('id'));
         hole = dhStore.findRecord('name', importHole.name);
         if (! hole ) {
            hole = this.addHole(dhStore, importHole, project);
            this.addGmData(gmStore, importHole.geomechData, hole);
         } else {
            // check hole is the same
            if (! this.doHolesMatch(hole.getData(), importHole) )
               throw {
                  type: 'holeDiff',
                  name: hole.get('name'),
                  diff: this.compareHoles(hole.getData(), importHole),
                  toString: function() { return this.type }
               };
            // overwrite data
            console.log('overwriting gm data for hole: ', importHole.name);
            gmStore.getRange()
               .filter(function(r) { return r.data.drillHoleID === hole.data.id })
               .forEach(function(r) { gmStore.remove(r) });

            this.addGmData(gmStore, importHole.geomechData, hole);
         }
      }
      console.log('import successful', project.get('minePropertyName'), hole.get('name'));
      Ext.Msg.show({
         title: 'Import Successful',
         msg: Ext.String.format('Drill Hole "{0}" in project "{1}" successfully imported.',
            project.get('minePropertyName'), hole.get('name') ),
            modal: false,
            buttons: Ext.Msg.OK,
            icon: Ext.Msg.INFO
      });
   },
   sanitizeImportHole: function(holeConfig) {
      // clear out stuff we don't care about
      delete holeConfig.project.id;
      delete holeConfig.projectID;
      delete holeConfig.id;
      return holeConfig;
   },
   addHole: function(dhStore, holeConfig, projectRec) {
      holeConfig.projectID = projectRec.get('id');
      var hole = dhStore.add(holeConfig).pop();
      dhStore.sync();
      console.log('new hole', hole);
      return hole;
   },
   addGmData: function(gmStore, rows, holeRec) {
      gmStore.add(
         rows.map(function(r) {
            delete r.id;
            r.drillHoleID = holeRec.get('id');
            return r;
         })
      );
      gmStore.sync();
   },
   doProjectsMatch: function(a, b) {
      var x = this.compareProjects(a, b);
      return Ext.Object.isEmpty(x.configDiffs) &&
         Ext.Object.isEmpty(x.templateDiffs);
   },
   compareProjects: function(a, b) {
      delete a.id;
      delete b.id;
      var diffs = this.compare(a, b);
      console.log('project diffs', diffs);
      var templateDiffs = this.compare(a.gmListTemplate, b.gmListTemplate);
      console.log('template diffs', templateDiffs);
      return { configDiffs: diffs, templateDiffs: templateDiffs };
   },
   doHolesMatch: function(a, b) {
      var x = this.compareHoles(a, b);
      return Ext.Object.isEmpty(x);
   },
   compareHoles: function(a, b) {
      delete a.id;
      delete b.id;
      delete a.project;
      delete b.project;
      delete a.projectID;
      delete b.projectID;
      var diffs = this.compare(a, b);
      console.log('hole diffs', diffs);
      return diffs;
   },
   compare: function(a, b) {
      var diffs = {};
      for (var key in a) {
         if (a[key] !== b[key] && !Ext.isArray(a[key]))
            diffs[key] = true;
      }
      for (var key in b) {
         if (a[key] !== b[key] && !Ext.isArray(b[key]))
            diffs[key] = true;
      }
      return diffs;
   },
   exceptionWrapper: function(fn) {
      var errors = {
         JSONParseFail: function() {
            return 'Import failed. The file selected does not '+
               'appear to be a valid drill hole export file.';
         },
         projDiff: function() {
            return 'Your project ' + this.name + ' differs from the imported project. ' +
               'Import can\'t continue.<br> ' +
               'Differing fields: ' + Object.keys(this.diff.configDiffs).join(', ') +
               (Ext.Object.isEmpty(this.diff.templateDiffs) ? '': ', geomechTemplate');
         },
         holeDiff: function() {
            return 'Your drill hole ' + this.name + ' differs from the imported file. ' +
               'Import can\'t continue.<br> ' +
               'Differing fields: ' + Object.keys(this.diff).join(', ');
         }
      };
      return function() {
         try {
            fn.apply(this, arguments);
         } catch (e) {
            console.error('exception!', e);
            Ext.Msg.show({
               title: 'Import Error',
               msg: errors[e] ? errors[e].call(e) : 'Error code: '+ e,
               buttons: Ext.Msg.OK,
               icon: Ext.Msg.ERROR
            })
         }
      }
   }
});

