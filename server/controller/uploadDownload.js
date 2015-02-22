var fs = require('fs'),
    config = require('./config/config'); 
/*
 * Display upload form
 */
exports.display_form = function(req, res) {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write(
        '<form action="/uploadFile" method="post" enctype="multipart/form-data">'+
        '<input type="file" name="file">'+
        '<input type="submit" value="Upload">'+
        '</form>'
    );
    res.end();
}

/*
 * upload file
 */

exports.uploadFile = function(req, res, next) {
    var tmp_path = req.files.file.path;
    // set where the file should actually exists - in this case it is in the "images" directory
    fs.exists(config.publicFolder, function (exists) {
            if(exists === false){
              fs.mkdirSync(config.publicFolder);
            }
              fs.exists(config.publicFolder+config.uploadFolder, function (exists) {
                if(exists === false){
                  fs.mkdirSync(config.publicFolder+config.uploadFolder);
                }
                var target_path = config.publicFolder+config.uploadFolder+'/' + req.files.file.name ;
                read(target_path);
              });
    }) //req.files.file.name;
    // move the file from the temporary location to the intended location
    function read(target_path){
          var is = fs.createReadStream(tmp_path);
          var os = fs.createWriteStream(target_path);
          is.pipe(os);
          is.on('end', function() {
            fs.unlinkSync(tmp_path);
          });
          res.send('File uploaded to: ' + target_path);
    }
}

/**
*get file
*/
exports.getFile = function(req , res , next){
  var file = req.params.file
    , path = config.publicFolder+config.uploadFolder+"/" + file
    , ext = file.substr(file.lastIndexOf('.') + 1);
   if(ext === "pdf" || ext ==="ppt" || ext ==="pptx" || ext === "xls" || ext === "xlsx" || ext === "doc" || ext === "docx" || ext === "csv"){
      fs.readFile(path, function(error, content) {
        if (error) {
          res.writeHead(500);
          res.end();
        }
        else {
           if(ext === "pdf") res.setHeader('Content-Type', 'application/pdf');
           if(ext === "ppt") res.setHeader('Content-Type', 'application/vnd.ms-powerpoint');
           if(ext === "pptx") res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
           if(ext === "xls") res.setHeader('Content-Type', 'application/vnd.ms-excel');
           if(ext === "xlsx") res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
           if(ext === "doc") res.setHeader('Content-Type', 'application/msword');
           if(ext === "docx") res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
           if(ext === "csv") res.setHeader('Content-Type', 'application/octet-stream');
           res.setHeader("Content-Disposition", "attachment; filename=" + file);
           res.end(content, 'binary');
        }
      });
    }
  else res.download(path);
};