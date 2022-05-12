const fs = require('fs')
const { parse, resolve } = require('path')
const { IncomingForm } = require('formidable')

const fileCaches = {}

 function combinFile(fileList, writePath) {
  const bufferList = []
  fileList.forEach(file => {
    const filePath = file.filePath
    bufferList.push(fs.readFileSync(filePath))
    fs.unlinkSync(filePath)
  })
  const buffers = Buffer.concat(bufferList)
  fs.writeFileSync(writePath, buffers)
}

function parseFileName(file) {
  const { ext } = parse(file.originalFilename)
  const filename = file.newFilename + ext
  return [filename, ext]
}

function fileQueueAdd(dirName, uid, file, index=-1) {
    !fileCaches[uid] && (fileCaches[uid] = [])
    const fileList = fileCaches[uid]
    file.filePath = resolve(process.cwd(), dirName, file.newFilename)
    if(index === -1) return fileList.push(file)
    const originFile = fileList[index];
    fileList[index] = file
    if(originFile && originFile.filePath !== file.filePath) {
      console.log(originFile.filePath);
      fs.unlinkSync(originFile.filePath)
    }
}

handleLastUpload = function(file, uid, uploadDir) {
  const [filename] = parseFileName(file)
  const fileList = fileCaches[uid]
  combinFile(fileList, resolve(process.cwd(), uploadDir, filename))
  delete fileCaches[uid]
  return filename
}

class HandleSliceFile {
  options = {}
  constructor({ catchDir, uploadDir, uid, index }) {
    this.setOptions({ catchDir, uploadDir, uid, index })
  }
  parse(req, isLast, callback) {
    const { catchDir, uploadDir, uid, index } = this.options
    const form = new IncomingForm({ uploadDir: catchDir });
    form.parse(req, (err, _, { file }) => {
      if (err) return callback(err);
      fileQueueAdd(catchDir, uid, file, index)
      const filePath = isLast ? handleLastUpload(file, uid, uploadDir) : null;
      callback(err, file, filePath)
    })
  }
  setOptions({ catchDir, uploadDir, uid, index }) {
    this.options = { catchDir, uploadDir, uid, index }
  }
}


module.exports = HandleSliceFile

