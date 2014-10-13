Ext.define('CNDE.model.GeomechData', {
   extend: 'Ext.data.Model',
   fields: [
      'id',
      'intervalFrom',
      'intervalTo',
      'recoveryLen',
   // number of whole core pieces
      'wholePieceCount',
   // whole core length
      'wholeCoreLen',
   // longest piece length
      'longestPieceLen',
   // variable lengths
      'varLen1',
      'varLen2',
   // rqd length
      'rqdLen',
      'varLen3',
   // broken zone length
      'brokenZoneLen',
   // rubble zone length
      'rubbleZoneLen',
   // hardness <= 2 length
      'h2len',
   // average hardness
      'aveHardness',
   // number of joint sets
      'jointSetCount',
   // joint expression (optional)
      'jointExpression',
   // joint filling (optional)
      'jointFilling',
   // joint wall alteration (optional)
      'jointWallAlteration',
      'jointRoughness',
      'jointAlteration',
   // misc
      'coreSize',
      'extra1',
      'extra2',
      'extra3',
      'extra4',
      'comments',
      'sampleCount',
   // internal use
      'drillHoleID',
      'varLengths', // array of project-set variable lengths
      'isMetricUnits'
   ],
   proxy: {
      type: 'localstorage',
      id: 'geomechdata'
   },
   belongsTo: { model: 'DrillHole', name: 'drillHole' },
   statics: {
      privateFields: function() {
         return ['drillHoleID','varLengths','isMetricUnits']
      },
      ignoredFieldsForBlankChecks: function() {
         return ['intervalFrom','intervalTo', 'coreSize']
      },
      canonicalFieldSort: function(fields) {
         return this.getFields()
            .filter(function(f) {return fields.indexOf(f.name) >= 0})
            .map(function(f) {return f.name})
      },
      metricCoreSizes: function() {
         // values in meters
         return {
            'PQ':   .17,
            'PQ-3': .17,
            'HQ':   .13,
            'HQ-3': .12,
            'NQ':   .10,
            'NQ-3': .09,
            'BQ':   .07,
            'BQ-3': .07
         }
      },
      usCoreSizes: function() {
         // in feet
         return {
            'PQ':   0.6,
            'PQ-3': 0.6,
            'HQ':   0.4,
            'HQ-3': 0.4,
            'NQ':   0.3,
            'NQ-3': 0.3,
            'BQ':   0.2,
            'BQ-3': 0.2
         }
      }

   },
   isBlank: function() {
      var data = this.getData(),
         ignoredFields = this.statics().privateFields()
            .concat(this.statics().ignoredFieldsForBlankChecks()),
         isBlank = true;
      for (var key in data) {
         if ( ignoredFields.indexOf(key) < 0 ) {
            isBlank = isBlank &&
               (data[key] === '' || data[key] === undefined || data[key] === null )
         }
      }
      return isBlank;
   },
   fieldSlice: function(fields) {
      return fields.map(function(f) { return this.get(f) },this);
   },
   storeVarLengths: function() {
      if (this.store && this.store.baseParams) {
         return this.store.baseParams.varLengths
      } else {
         console.error('No store for GM rec!?', this);
      }
   },
   // convenience accessors for the VL configs
   VL1: function() { return this.storeVarLengths()[0] },
   VL2: function() { return this.storeVarLengths()[1] },
   VL3: function() { return this.storeVarLengths()[2] },

   isMetricUnits: function() {
      if (this.store && this.store.baseParams) {
         return !!this.store.baseParams.isMetricUnits
      } else {
         console.error('No store for GM rec!?', this);
      }
   },

   getCoreSizeValue: function() {
      var codes = this.isMetricUnits() ?
         this.statics().metricCoreSizes() :
         this.statics().usCoreSizes();
      return codes[ this.get('coreSize') ];
   },

   intervalMarginRatio: function() {
      if (this.store && this.store.baseParams) {
         return this.store.baseParams.intervalMarginRatio || 1.2
      } else {
         console.error('No store for GM rec!?', this);
      }
   },

   intervalMarginConstant: function() {
      if (this.store && this.store.baseParams) {
         return this.store.baseParams.intervalMarginConstant || 0.8
      } else {
         console.error('No store for GM rec!?', this);
      }
   },

   // validations are called in the scope of the record instance
   validations: [{
      type: 'model',
      message: 'Drill Interval "From" must be less than "To".',
      fn: function(rec) {
         return rec.intervalFrom < rec.intervalTo;
      }
   },{
      type: 'model',
      errorCode: 1,
      message: function() {
         return "Recovery is > Interval * " + this.intervalMarginRatio()
            + " and Recovery > Interval + "+ this.intervalMarginConstant();
      },
      fn: function(rec) {
         var interval = rec.intervalTo - rec.intervalFrom,
            bound1 = rec.recoveryLen > interval * this.intervalMarginRatio(),
            bound2 = rec.recoveryLen > interval + this.intervalMarginConstant();
         return !( bound1 && bound2 );
      }
   },{
      type: 'model',
      errorCode: 2,
      message: 'Recovery is < 0 or Null',
      fn: function(rec) {
         return !( rec.recoveryLen < 0 || rec.recoveryLen === null );
      }
   },{
      type: 'model',
      errorCode: 3,
      message: 'Length of 2X Core is > Recovery + .01',
      fn: function(rec) {
         return rec.rqdLen <  rec.recoveryLen + 0.01
      }
   },{
      type: 'model',
      errorCode: 4,
      message: 'Length of 2X Core is < 0 or Null',
      fn: function(rec) {
         return !( rec.rqdLen < 0 || rec.rqdLen === null );
      }
   },{
      type: 'model',
      errorCode: 5,
      message: 'Number of Whole Pieces is < 0 or Null',
      fn: function(rec) {
         return !( rec.wholePieceCount < 0 || rec.wholePieceCount === null );
      }
   },{
      type: 'model',
      errorCode: 6,
      message: 'Number of Whole Pieces = 1 and the Length of Longest Piece does not equal the Length of Whole Core',
      fn: function(rec) {
         if (rec.wholePieceCount === 1)
            return rec.longestPieceLen === rec.wholeCoreLen
         return true;
      }
   },{
      type: 'model',
      errorCode: 7,
      message: 'Number of Whole Pieces = 0 and Length of Whole Core > 0',
      fn: function(rec) {
         return !(rec.wholePieceCount === 0 && rec.wholeCoreLen > 0)
      }
   },{
      type: 'model',
      errorCode: 8,
      message: 'Length of Broken is > Recovery + .01',
      fn: function(rec) {
         return rec.brokenZoneLen < rec.recoveryLen + 0.01;
      }
   },{
      type: 'model',
      errorCode: 9,
      message: 'Length of Longest Piece < 0 or Null',
      fn: function(rec) {
         return !( rec.longestPieceLen < 0 || rec.longestPieceLen === null );
      }
   },{
      type: 'model',
      errorCode: 10,
      message: 'Length of Longest Piece <= 0 and Length of 2X Core > 0',
      fn: function(rec) {
         return !( rec.longestPieceLen <= 0 && rec.rqdLen > 0 );
      }
   },{
      type: 'model',
      errorCode: 11,
      message: 'Length of Longest Piece <= 0 and Length of Whole Core > 0',
      fn: function(rec) {
         return !( rec.longestPieceLen <= 0 && rec.wholeCoreLen > 0 );
      }
   },{
      type: 'model',
      errorCode: 12,
      message: 'Length of Longest Piece > Length of Whole Core + .01',
      fn: function(rec) {
         return !( rec.longestPieceLen > rec.wholeCoreLen + .01 );
      }
   },{
      type: 'model',
      errorCode: 13,
      message: 'Length of Longest Piece - 0.1 > Recovery - Length of Broken - Length of Rubble',
      fn: function(rec) {
         return !( rec.longestPieceLen - 0.1 >
            rec.recoveryLen - rec.brokenZoneLen - rec.rubbleZoneLen );
      }
   },{
      type: 'model',
      errorCode: 14,
      message: 'Length of Longest Piece > Length of 2X Core + .01 and Length of 2X Core > 0',
      fn: function(rec) {
         return !( rec.longestPieceLen > rec.rqdLen + 0.01 && rec.rqdLen > 0 );
      }
   },
   // for rules with VLx and "length greater than VLx"
   // VLx: this.storeVarLengths()[x-1]
   // Length greater than VLx: rec.varLenx
   {
      type: 'model',
      errorCode: 15,
      message: 'Length Greater Than VL1 < 0 or Null',
      requiresVLs: [1],
      fn: function(rec) {
         return !( rec.varLen1 < 0 || rec.varLen1 === null);
      }
   },{
      type: 'model',
      errorCode: 16,
      message: 'Length Greater Than VL1 > Length of 2X Core',
      requiresVLs: [1],
      fn: function(rec) {
         return !( rec.varLen1 > rec.rqdLen);
      }
   },{
      type: 'model',
      errorCode: 17,
      message: 'Length Greater Than VL1 > Length of Whole Core + .01',
      requiresVLs: [1],
      fn: function(rec) {
         return !( rec.varLen1 > rec.wholeCoreLen + 0.01);
      }
   },{
      type: 'model',
      errorCode: 18,
      message: 'Length Greater Than VL1 > Recovery + .01',
      requiresVLs: [1],
      fn: function(rec) {
         return !( rec.varLen1 > rec.recoveryLen + 0.01);
      }
   },{
      type: 'model',
      errorCode: 19,
      message: 'Length Greater Than VL1 > 0 and Length of Longest Piece < VL1',
      requiresVLs: [1],
      fn: function(rec) {
         if (!Ext.isArray(this.storeVarLengths())) {
            console.error("Store doesn't have project varLengths set! id: ", rec.id);
         }
         return !( rec.varLen1 > 0 && rec.longestPieceLen < this.VL1() );
      }
   },{
      type: 'model',
      errorCode: 20,
      message: 'Length Greater Than VL1 = 0 and Length of Longest Piece > VL1',
      requiresVLs: [1],
      fn: function(rec) {
         return !( rec.varLen1 === 0 && rec.longestPieceLen > this.VL1() );
      }
   },{
      type: 'model',
      errorCode: 21,
      message: 'Length Greater Than VL2 < 0 or Null',
      requiresVLs: [2],
      fn: function(rec) {
         return !( rec.varLen2 < 0 || rec.varLen2 === null );
      }
   },{
      type: 'model',
      errorCode: 22,
      message: 'Length Greater Than VL2 < Length Greater Than VL1',
      requiresVLs: [1,2],
      fn: function(rec) {
         return !( rec.varLen2 < rec.varLen1 );
      }
   },{
      type: 'model',
      errorCode: 23,
      message: 'Length Greater Than VL2 > Length of 2X Core',
      requiresVLs: [2],
      fn: function(rec) {
         return !( rec.varLen2 > rec.rqdLen );
      }
   },{
      type: 'model',
      errorCode: 24,
      message: 'Length Greater Than VL2 > Length of Whole Core + .01',
      requiresVLs: [2],
      fn: function(rec) {
         return !( rec.varLen2 > rec.wholeCoreLen + 0.01 );
      }
   },{
      type: 'model',
      errorCode: 25,
      message: 'Length Greater Than VL2 > Recovery + .01',
      requiresVLs: [2],
      fn: function(rec) {
         return !( rec.varLen2 > rec.recoveryLen + 0.01 );
      }
   },{
      type: 'model',
      errorCode: 26,
      message: 'Length Greater Than VL2 > 0 and Length of Longest Piece < VL2',
      requiresVLs: [2],
      fn: function(rec) {
         return !( rec.varLen2 > 0 && rec.longestPieceLen < this.VL2() );
      }
   },{
      type: 'model',
      errorCode: 27,
      message: 'Length Greater Than VL2 = 0 and Length of Longest Piece > VL2',
      requiresVLs: [2],
      fn: function(rec) {
         return !( rec.varLen2 === 0 && rec.longestPieceLen > this.VL2() );
      }
   },{
      type: 'model',
      errorCode: 28,
      message: 'Length Greater Than VL3 < 0 or Null',
      requiresVLs: [3],
      fn: function(rec) {
         return !( rec.varLen3 < 0 || rec.varLen3 === null );
      }
   },{
      type: 'model',
      errorCode: 29,
      message: 'Length Greater Than VL3 < Length Greater Than VL2',
      requiresVLs: [2,3],
      fn: function(rec) {
         return !( rec.varLen3 < rec.varLen2 );
      }
   },{
      type: 'model',
      errorCode: 30,
      message: 'Length Greater Than VL3 < Length Greater Than VL1',
      requiresVLs: [1,3],
      fn: function(rec) {
         return !( rec.varLen3 < rec.varLen1 );
      }
   },{
      type: 'model',
      errorCode: 31,
      message: 'Length Greater Than VL3 < Length of 2X Core',
      requiresVLs: [3],
      fn: function(rec) {
         return !( rec.varLen3 < rec.rqdLen );
      }
   },{
      type: 'model',
      errorCode: 32,
      message: 'Length Greater Than VL3 > Length of Whole Core + .01',
      requiresVLs: [3],
      fn: function(rec) {
         return !( rec.varLen3 > rec.wholeCoreLen + 0.01 );
      }
   },{
      type: 'model',
      errorCode: 33,
      message: 'Length Greater Than VL3 > Recovery + .01',
      requiresVLs: [3],
      fn: function(rec) {
         return !( rec.varLen3 > rec.recoveryLen + 0.01 );
      }
   },{
      type: 'model',
      errorCode: 34,
      message: 'Length Greater Than VL3 > 0 and Length of Longest Piece < VL3',
      requiresVLs: [3],
      fn: function(rec) {
         return !( rec.varLen3 > 0 && rec.longestPieceLen < this.VL3() );
      }
   },{
      type: 'model',
      errorCode: 35,
      message: 'Length Greater Than VL3 = 0 and Length of Longest Piece > VL3',
      requiresVLs: [3],
      fn: function(rec) {
         return !( rec.varLen3 === 0 && rec.longestPieceLen > this.VL3() );
      }
   },{
      type: 'model',
      errorCode: 36,
      message: 'Length of Whole Core > Recovery + .01',
      fn: function(rec) {
         return !( rec.wholeCoreLen > rec.recoveryLen + 0.01 );
      }
   },{
      type: 'model',
      errorCode: 37,
      message: 'Length of Whole Core < 0 or Null',
      fn: function(rec) {
         return !( rec.wholeCoreLen < 0 || rec.wholeCoreLen === null );
      }
   },{
      type: 'model',
      errorCode: 38,
      message: function() {
         var tolerance = this.isMetricUnits() ? 0.01 : 0.1;
         return 'Length of Whole Core + Length of Broken + Length of Rubble is not within Recovery &#xb1; ' + tolerance;
      },
      fn: function(rec) {
         var sum = rec.wholeCoreLen + rec.brokenZoneLen + rec.rubbleZoneLen,
            tolerance = this.isMetricUnits() ? 0.01 : 0.1;
        console.log(rec.recoveryLen,tolerance, sum)
         return   sum >= rec.recoveryLen - tolerance &&
                  sum <= rec.recoveryLen + tolerance;
      }
   },{
      type: 'model',
      errorCode: 39,
      message: 'Length of Longest Piece > RQD Cutoff and Length of 2X Core = 0',
      fn: function(rec) {
         return !( rec.longestPieceLen > this.getCoreSizeValue() && rec.rqdLen === 0 );
      }
   },{
      type: 'model',
      errorCode: 40,
      message: 'Length of Longest Piece < RQD Cutoff and Length of 2X Core > 0',
      fn: function(rec) {
         return !( rec.longestPieceLen < this.getCoreSizeValue() && rec.rqdLen > 0 );
      }
   },{
      type: 'model',
      errorCode: 41,
      message: 'Length of 2X Core > Recovery - Length of Broken - Length of Rubble + .01',
      fn: function(rec) {
         return !( rec.rqdLen >
            rec.recoveryLen - rec.brokenZoneLen - rec.rubbleZoneLen + 0.01 );
      }
   },{
      type: 'model',
      errorCode: 42,
      message: 'Length of 2X Core > Length of Whole Core + .01',
      fn: function(rec) {
         return !( rec.rqdLen > rec.wholeCoreLen + 0.01 );
      }
   },{
      type: 'model',
      errorCode: 43,
      message: 'Length of 2X Core > Length of Longest Piece and Length of 2X Core - Length of Longest Piece + 0.01 < RQD Cutoff',
      fn: function(rec) {
         return !( rec.rqdLen > rec.longestPieceLen &&
            rec.rqdLen - rec.longestPieceLen + 0.01 < this.getCoreSizeValue());
      }
   },{
      type: 'model',
      errorCode: 44,
      message: 'Length Greater Than VL1 > Length of Longest Piece and Length Greater Than VL1 - Length of Longest Piece <  VL1 - .01',
      requiresVLs: [1],
      fn: function(rec) {
         return !( rec.varLen1 > rec.longestPieceLen &&
            rec.varLen1 - rec.longestPieceLen < this.VL1() - 0.01);
      }
   },{
      type: 'model',
      errorCode: 45,
      message: 'Length Greater Than VL2 > Length of Longest Piece and Length Greater Than VL2 - Length of Longest Piece <  VL2 - .01',
      requiresVLs: [2],
      fn: function(rec) {
         return !( rec.varLen2 > rec.longestPieceLen &&
            rec.varLen2 - rec.longestPieceLen < this.VL2() - 0.01);
      }
   },{
      type: 'model',
      errorCode: 46,
      message: 'Length Greater Than VL3 > Length of Longest Piece and Length Greater Than VL3 - Length of Longest Piece <  VL3 - .01',
      requiresVLs: [3],
      fn: function(rec) {
         return !( rec.varLen3 > rec.longestPieceLen &&
            rec.varLen3 - rec.longestPieceLen < this.VL3() - 0.01);
      }
   },{
      type: 'model',
      errorCode: 47,
      message: '0.1 <= Length Greater Than VL2 - Length Greater Than VL1 <= (VL2-VL1-.01)',
      requiresVLs: [1,2],
      fn: function(rec) {
         var vlMeasureDiff = rec.varLen2 - rec.varLen1,
            vlDiff = this.VL2() - this.VL1();
         return !( 0.1 <= vlMeasureDiff && vlMeasureDiff <= vlDiff - 0.01 );
      }
   },{
      type: 'model',
      errorCode: 48,
      message: '0.1 <= Length Greater Than VL3 - Length Greater Than VL1 <= (VL3-VL1-.01)',
      requiresVLs: [1,3],
      fn: function(rec) {
         var vlMeasureDiff = rec.varLen3 - rec.varLen1,
            vlDiff = this.VL3() - this.VL1();
         return !( 0.1 <= vlMeasureDiff && vlMeasureDiff <= vlDiff - 0.01 );
      }
   },{
      type: 'model',
      errorCode: 49,
      message: '0.1 <= Length Greater Than VL3 - Length Greater Than VL2 <= (VL3-VL2-.01)',
      requiresVLs: [3,2],
      fn: function(rec) {
         var vlMeasureDiff = rec.varLen3 - rec.varLen2,
            vlDiff = this.VL3() - this.VL2();
         return !( 0.1 <= vlMeasureDiff && vlMeasureDiff <= vlDiff - 0.01 );
      }
   },{
      type: 'model',
      errorCode: 50,
      message: 'Length of Longest Piece > VL1 and Length of Longest Piece > Length Greater Than VL1',
      requiresVLs: [1],
      fn: function(rec) {
         return !( rec.longestPieceLen > this.VL1() &&
            rec.longestPieceLen > rec.varLen1 );
      }
   },{
      type: 'model',
      errorCode: 51,
      message: 'Length of Longest Piece > VL2 and Length of Longest Piece > Length Greater Than VL2',
      requiresVLs: [2],
      fn: function(rec) {
         return !( rec.longestPieceLen > this.VL2() &&
            rec.longestPieceLen > rec.varLen2 );
      }
   },{
      type: 'model',
      errorCode: 52,
      requiresVLs: [3],
      message: 'Length of Longest Piece > VL3 and Length of Longest Piece > Length Greater Than VL3',
      requiresVLs: [3],
      fn: function(rec) {
         return !( rec.longestPieceLen > this.VL3() &&
            rec.longestPieceLen > rec.varLen3 );
      }
   },{
      type: 'model',
      errorCode: 53,
      message: 'Length of 2X Core > 0 and Length of 2X Core < RQD Cutoff',
      fn: function(rec) {
         return !( rec.rqdLen > 0 && rec.rqdLen < this.getCoreSizeValue() );
      }
   }],
   // if the project for this record has enabled the fields then we need to check this rule
   hasRequiredFields: function(validation) {
      if (validation.requiresVLs) {
         var have = this.storeVarLengths(),
            need = validation.requiresVLs.map(function(v){return v-1}),
            ok = true;
         need.forEach(function(vl) { ok = ok && !!have[vl] });
         if (ok === false) return false;
      }
      return true;
   },
   validate: function() {
      var errors      = new Ext.data.Errors(),
         validations = this.validations,
         validators  = Ext.data.validations,
         length, validation, field, valid, type, i;

      if (validations) {
         length = validations.length;

         for (i = 0; i < length; i++) {
            validation = validations[i];
            field = validation.field || validation.name;
            type  = validation.type;
            // if we can't check the rule because fields aren't available, default to ok
            valid = this.hasRequiredFields(validation) ?
               validators[type].apply(this, [validation, this.get(field), this.getData()]) :
               true;

            if (!valid) {
               errors.add({
                  field  : field,
                  errorCode: validation.errorCode,
                  message: typeof validation.message === 'function' ?
                     validation.message
                        .apply(this, [validation, this.get(field), this.getData()]) :
                     validation.message || validators[type + 'Message']
               });
            }
         }
      }

      return errors;
   }
});

// Add a model-level validation shim
Ext.define('Ext.data.validationsOverride', {
   override: 'Ext.data.validations',
   model: function(config, value, modelData) {
      return config.fn.apply(this, [modelData]);
   }
});
