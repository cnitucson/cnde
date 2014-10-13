// This is a bunch of filesystem api test code
// Not really intended to be released like this
function errorHandler(e) {
   var msg = '';
 
   switch (e.code) {
      case FileError.QUOTA_EXCEEDED_ERR:
         msg = 'QUOTA_EXCEEDED_ERR';
         break;
      case FileError.NOT_FOUND_ERR:
         msg = 'NOT_FOUND_ERR';
         break;
      case FileError.SECURITY_ERR:
         msg = 'SECURITY_ERR';
         break;
      case FileError.INVALID_MODIFICATION_ERR:
         msg = 'INVALID_MODIFICATION_ERR';
         break;
      case FileError.INVALID_STATE_ERR:
         msg = 'INVALID_STATE_ERR';
         break;
      default:
         msg = 'Unknown Error';
         break;
   };
 
   console.error('Error: ' + msg);
}

window.requestFileSystem = window.webkitRequestFileSystem || window.requestFileSystem;
window.BlobBuilder = window.WebKitBlobBuilder || window.BlobBuilder;

var initFs = function(fs) { 
   console.log('opened file sys: ' + fs.name); 
   fs.root.getFile('log.json', {create: false, exclusive: true},
      function (fileEntry) {
         console.log('got file '+ fileEntry.fullPath);
         var data = {}; 

         // read first
         fileEntry.file(function(file) {
            var reader = new FileReader();
            reader.onloadend = function(e) {
               console.log('current:',this.result);
               try { data = Ext.decode( this.result ); }
               catch (e) { console.error( 'not a json file', e ) }
               console.log(data || this.result);
               // Create a FileWriter object for our FileEntry (log.txt).
               fileEntry.createWriter(function(fileWriter) {

                  fileWriter.onwriteend = function(e) {
                     console.log('Write completed.');
                  };

                  fileWriter.onerror = function(e) {
                     console.log('Write failed: ' + e.toString());
                  };

                  if (! data.array ) { data.array = [] }
                  data.array.push(new Date().toString());
                  // Create a new Blob and write it to log.txt.
                  var bb = new BlobBuilder();
                  bb.append(Ext.encode(data));
                  fileWriter.write(bb.getBlob('text/plain'));
               });
            };
            reader.readAsText(file);
         }, errorHandler);
      }, errorHandler);
};
var testFs = function() {
   window.requestFileSystem(window.PERSISTENT, 100*1024*1024, initFs);
};
var download = function() {
   var data = { a: 100, b:200, c:'MAXIMUM DERP' };
   var blob = new Blob( [ Ext.encode(data) ], {type: 'application/json'} );
   console.log(blob);
   saveAs(blob, 'test.json');
};
var upload = function() {
   window.open('http://www.html5rocks.com/en/tutorials/file/dndfiles/');
};
