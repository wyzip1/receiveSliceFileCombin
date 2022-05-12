# receiveSliceFileCombin

```js
const express = require('express');
const app = express();
const HandleSliceFile = require('receive-slice-file-combin')

app.post('/uploadFile', (req, res) => {
  const fileUid = req.headers['file-uid']
  const fileIndex = req.headers['file-index']
  const isLast = req.headers['upload-end'] === 'isLast'
  const handle = new HandleSliceFile({ catchDir: './upload', uploadDir: './files', uid: fileUid, index: fileIndex })

  handle.parse(req, isLast, (err, file, path) => {
    if (err) return console.log(err);
    const responseJson = { success: true, file }
    path && (responseJson.url = 'http://localhost:3000/' + path)
    res.json(responseJson)
  })
})

app.listen(3000, () => {
  console.log('Server run at http://localhost:3000');
})
```