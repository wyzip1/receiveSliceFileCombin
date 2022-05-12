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

handleLastUpload = function(file, uid) {
  const [filename] = parseFileName(file)
  const fileList = fileCaches[uid]
  combinFile(fileList, resolve(process.cwd(), 'files', filename))
  delete fileCaches[uid]
  return `http://localhost:3000/files/${filename}`
}

class HandleSliceFile {
  options = {}
  constructor({ uploadDir, uid, index }) {
    this.setOptions({ uploadDir, uid, index })
  }
  parse(req, isLast, callback) {
    const { uploadDir, uid, index } = this.options
    const form = new IncomingForm({ uploadDir });
    form.parse(req, (err, _, { file }) => {
      if (err) return callback(err);
      fileQueueAdd(uploadDir, uid, file, index)
      const url = isLast ? handleLastUpload(file, uid) : null;
      callback(err, file, url)
    })
  }
  setOptions({ uploadDir, uid, index }) {
    this.options = { uploadDir, uid, index }
  }
}


module.exports = HandleSliceFile

