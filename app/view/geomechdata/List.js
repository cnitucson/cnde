Ext.define('CNDE.view.geomechdata.List', {
   extend: 'Ext.grid.Panel',
   alias: 'widget.geomechlist',
   uses: [
      'Ext.grid.plugin.CellEditing',
      'Ext.grid.plugin.BufferedRenderer',
      'Ext.form.field.Number',
      'Ext.grid.RowNumberer'
   ],
   initComponent: function() {
      var config = {
         store: 'GeomechData',
         selType: 'rowmodel',
         columns: {
            defaults: { defaults: { width: 110, editor: 'numberfield' } },
            items: this.convertColumnTemplate( this.defaultColumnLayout() )
         },
         plugins: [{
            ptype: 'cellediting',
            clicksToEdit: 1
         },{
            ptype: 'bufferedrenderer',
            trailingBufferZone: 20,
            leadingBufferZone: 50
         }],
         tbar: [{
            text: 'Save',
            itemId: 'save'
         },{
            text: 'Validate',
            itemId: 'validate'
         },'->',{
            text: 'Delete Row',
            itemId: 'deleterow'
         },{
            text: 'Discard Changes',
            itemId: 'discard'
         }]
      };
      Ext.apply(this, config);
      this.callParent(arguments);
   },
   convertColumnTemplate: function(template) {
      var varLens = this.varLengths || [];
      var columns = [{
         xtype: 'rownumberer',
         width: 40,
      },{
         header: 'ID',
         dataIndex: 'id'
      },{
         text: 'Drill Interval',
         columns: [{
            header: 'From',
            dataIndex: 'intervalFrom'
         }, {
            header: 'To',
            dataIndex: 'intervalTo'
         }]
      }, {
         header: 'Recovered<br />Length',
         editor: 'numberfield',
         dataIndex: 'recoveryLen'
      }, {
         text: 'Rock Quality and Fracture Frequency',
         columns: [{
            header: '# of<br />Whole Pieces',
            dataIndex: 'wholePieceCount'
         }, {
            header: 'Whole Core<br />Length',
            dataIndex: 'wholeCoreLen'
         }, {
            header: 'Length of<br />Longest Piece',
            dataIndex: 'longestPieceLen'
         }, {
            header: varLens[0] ?
               'Length Greater<br />Than '+varLens[0] :
               'Variable<br />Length 1',
            dataIndex: 'varLen1'
         }, {
            header: varLens[1] ?
               'Length Greater<br />Than '+varLens[1] :
               'Variable<br />Length 2',
            dataIndex: 'varLen2'
         }, {
            header: 'RQD Length',
            dataIndex: 'rqdLen'
         }, {
            header: varLens[2] ?
               'Length Greater<br />Than '+varLens[2] :
               'Variable<br />Length 3',
            dataIndex: 'varLen3'
         }, {
            header: 'Length of<br />Broken Zone',
            dataIndex: 'brokenZoneLen'
         }, {
            header: 'Length of<br />Rubble Zone',
            dataIndex: 'rubbleZoneLen'
         }, {
            header: 'Hardness <= 2<br />Length',
            dataIndex: 'h2len'
         }, {
            header: 'Average<br />Hardness',
            dataIndex: 'aveHardness'
         }]
      }, {
         text: 'Joint <br />Condition',
         columns: [{
            header: '# of<br />Joint Sets',
            dataIndex: 'jointSetCount'
         }, {
            header: 'Joint<br />Roughness',
            dataIndex: 'jointRoughness',
            editor: {
               xtype: 'combo',
               displayField: 'value',
               store: {
                  type: 'array',
                  fields: [ 'code', 'roughness', 'value' ],
                  data: [
                     ['A', 'Discontinuous joints', 4],
                     ['B', 'Rough / irregular, undulating', 3],
                     ['C', 'Smooth, undulating',  2],
                     ['D', 'Slickensided, undulating', 1.5],
                     ['E', 'Rough / irregular, planar',  1.5],
                     ['F', 'Smooth, planar', 1],
                     ['G', 'Slickensided, planar',  .5],
                     ['H', 'Clay fill',  1],
                     ['J', 'Sand / gravel filled',  1]
                  ]
               },
               listConfig: {
                  itemTpl: '{code}: {roughness} &mdash; {value}',
                  minWidth: 250
               }
            }
         }, {
            header: 'Joint<br />Alteration',
            dataIndex: 'jointAlteration',
            editor: {
               xtype: 'combo',
               displayField: 'value',
               store: {
                  type: 'array',
                  fields: [ 'code', 'alteration', 'value' ],
                  data: [
                     ['A', 'Tightly healed', .75],
                     ['B', 'Unaltered', 1],
                     ['C', 'Slightly altered',  2],
                     ['D', 'Silt / sand coating', 3]
                  ]
               },
               listConfig: {
                  itemTpl: '{code}: {alteration} &mdash; {value}',
                  minWidth: 250
               }
            }
         }, {
            header: 'Joint<br />Expression',
            dataIndex: 'jointExpression',
            editor: {
               xtype: 'combo',
               displayField: 'code',
               store: {
                  type: 'array',
                  fields: [ 'code', 'shape', 'roughness' ],
                  data: [
                     [0, 'No Joints / Fractures','N/A'],
                     [1, 'Stepped / Irregular',  'Rough'],
                     [2, 'Stepped / Irregular',  'Smooth'],
                     [3, 'Stepped / Irregular',  'Slickensided'],
                     [4, 'Undulating',  'Rough'],
                     [5, 'Undulating',  'Smooth'],
                     [6, 'Undulating',  'Slickensided'],
                     [7, 'Planar',  'Rough'],
                     [8, 'Planar',  'Smooth'],
                     [9, 'Planar',  'Polished']
                  ]
               },
               listConfig: {
                  itemTpl: '{code}: {shape} &mdash; {roughness}',
                  minWidth: 250
               }
            }
         }, {
            header: 'Joint<br />Filling',
            dataIndex: 'jointFilling',
            editor: {
               xtype: 'combo',
               displayField: 'code',
               store: {
                  type: 'array',
                  fields: [ 'code', 'filling', 'roughness' ],
                  data: [
                     [0, 'No Filling','N/A'],
                     [1, 'Nonsoftening and sheared',  'Coarse'],
                     [2, 'Nonsoftening and sheared',  'Medium'],
                     [3, 'Nonsoftening and sheared',  'Fine'],
                     [4, 'Soft sheared (e.g. talc)',  'Coarse'],
                     [5, 'Soft sheared (e.g. talc)',  'Medium'],
                     [6, 'Soft sheared (e.g. talc)',  'Fine'],
                     [7, 'Clay gouge (does not separate fracture)',  'N/A'],
                     [8, 'Clay gouge (separates fracture)',  'N/A']
                  ]
               },
               listConfig: {
                  itemTpl: '{code}: {filling} &mdash; {roughness}',
                  minWidth: 250
               }
            }
         }, {
            header: 'Joint Wall<br />Alteration',
            dataIndex: 'jointWallAlteration',
            editor: {
               xtype: 'combo',
               displayField: 'code',
               store: {
                  type: 'array',
                  fields: [ 'code', 'alteration' ],
                  data: [
                     [0, 'No Alteration'],
                     [1, 'Alteration']
                  ]
               },
               listConfig: {
                  itemTpl: '{code}: {alteration}',
                  minWidth: 100
               }
            }
         }]
      }, {
         text: 'Misc',
         columns: [{
            header: 'Core (Bit) Size',
            dataIndex: 'coreSize',
            editor: {
               xtype: 'combo',
               queryMode: 'local',
               displayField: 'coreSize',
               store: 'CoreSize',
               listConfig: {
                  itemTpl: '{coreSize} - D:{diameter}{diaUnit}, RQD: {rqdLen}{rqdUnit}',
                  minWidth: 250
               }
            }
         },{
            header: 'Extra #1',
            dataIndex: 'extra1'
         }, {
            header: 'Extra #2',
            dataIndex: 'extra2'
         }, {
            header: 'Extra #3',
            dataIndex: 'extra3'
         }, {
            header: 'Extra #4',
            dataIndex: 'extra4'
         }, {
            header: 'Comments',
            editor: 'textfield',
            dataIndex: 'comments'
         }, {
            header: 'Sample Count',
            dataIndex: 'sampleCount'
         }]
      }];
      // make a lookup out of the field list
      var lookup = {};
      template.forEach(function (s) { lookup[s] = true });
      // traverse the columns, hiding columns not in the lookup
      var check = function(col) {
         if (col.columns) col.columns.forEach(check);
         if (col.dataIndex && !lookup[col.dataIndex]) col.hidden = true;
      };
      columns.forEach(check);
      return columns;
   },
   layoutColumns: function(template) {
      var columns = this.convertColumnTemplate(template);
      this.reconfigure(null, columns);
   },
   defaultColumnLayout: function() {
      return [
         'intervalFrom',
         'intervalTo',
         'recoveryLen',
         'wholePieceCount',
         'wholeCoreLen',
         'longestPieceLen',
         'varLen1',
         'rqdLen',
         'brokenZoneLen',
         'rubbleZoneLen',
         'h2len',
         'aveHardness',
         'jointSetCount',
         'extra1',
         'comments',
         'sampleCount'
      ]
   },
   resetColumns: function() {
      this.layoutColumns(this.defaultColumnLayout());
   },
   setVariableLengthValues: function(varLens) {
      console.log('set vl', varLens);
      this.varLengths = varLens;
   }
});
