// jshint esversion: 8

const express = require("express");
const multer = require("multer"); //for storage
const fs = require("fs");
const path = require("path"); //to define the path of the Download files (inbuilt)
const admzip = require("adm-zip");
const app = express();

var dir = "public";
var subDirectory = "public/uploads";
app.use(express.static("zipmanger"));
app.use(express.static("Style"));

if(!fs.existsSync(dir)){
  fs.mkdirSync(dir);

  fs.mkdirSync(subDirectory);

}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
var maxSize = 100 * 1024 * 1024;   //1024 * 1024 = 1MB
var compressfilesupload = multer({ storage: storage,limits:{fileSize:maxSize}});

app.get("/" , function(req , res){
    res.sendFile(__dirname + "/index.html");
});

app.post("/compressfiles" , compressfilesupload.array("file" , 100) , function(req , res) {
  const zip = new admzip();
    if(req.files){
      req.files.forEach(file => {
        console.log(file.path);
        zip.addLocalFile(file.path);
      });
        var outputPath = Date.now() + "output.zip";

        fs.writeFileSync(outputPath , zip.toBuffer());
        res.download(outputPath , function(err){
          if(err){
            req.files.forEach((file, i) => {
              fs.unlinkSync(file.path);
            });
            fs.unlinkSync(outputPath);
            res.send("error in downloading zip file");  //if there is some error
            }
              req.files.forEach((file, i) => {
                fs.unlinkSync(file.path);
              });
              fs.unlinkSync(outputPath);
        });

    }
});

app.listen(4000, function(){
  console.log("App is listening on Port");
});
