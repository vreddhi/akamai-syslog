var fs = require('fs');

class file {

  constructor() {
    this.response = {
      'responseText' : 'Failed: Generic Failure',
      'data' : null
    }
  }


  _createFile(content) {
      
      var fileName = './output/log_file'

      fs.writeFile(fileName, JSON.stringify(content), err => {
          if (err) {
            console.error(err)
            return
          }
          
        })
  }
}

module.exports = file

