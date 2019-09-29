var fs = require('fs');

let localRoot = '';
let globalRoot = '';
let config = {
  lang: 'en',
  default: {
    template: 'component',
    name: 'component',
    path: '/src/components/'
  },
  lists: {
    template: true,
    path: [],
    name: []
  },
  templates: { global: [], local: [] }
};

module.exports.config = function () {
  return config;
}

module.exports.globalRoot = globalRoot
module.exports.localRoot = localRoot

module.exports.setGlobalRoot = function (root) { globalRoot = root }
module.exports.setLocalRoot = function (root) { localRoot = root }

module.exports.getGlobalRoot = function () {
  return globalRoot;
}

module.exports.getFile = function (name = '', local = false) {
  return new Promise(function (resolve, reject) {
    let path = local ? localRoot + '/' + name : globalRoot + '/' + name
    fs.readFile(path, 'utf8', function (err, content) {
      if (err) {
        reject(err)
      } else {
        resolve(content)
      }
    })
  })
}

module.exports.checkExistsFile = function (path, name) {
  return new Promise(function (resolve, reject) {
    fs.exists(path + name, 'utf8', function (err, content) {
      if (err) {
        reject(false)
      } else {
        resolve(true)
      }
    })
  })
}

module.exports.getJSONFile = function (name = '', local = false) {
  return new Promise(function (resolve, reject) {
    let path = local ? localRoot + '/' + name : globalRoot + '/' + name
    fs.readFile(path, 'utf8', function (err, content) {
      if (err) {
        reject(err)
      } else {
        let obj = {}
        try {
          obj = JSON.parse(content)
          resolve(obj)
        } catch (err) {
          reject(err)
        }
      }
    })
  })
}

module.exports.getNamesGlobalTemplates = function () {
  return new Promise((resolve, reject) => {
    fs.readdir(globalRoot + '/templates', function (err, items) {
      if (err) {
        reject(err)
      } else {
        resolve(items)
      }
    })
  })
}

module.exports.getNamesLocalTemplates = function () {
  return new Promise((resolve, reject) => {
    fs.readdir(localRoot + '/templates', function (err, items) {
      if (err) {
        reject(err)
      } else {
        resolve(items)
      }
    })
  })
}

function createDirs() {
  if (!fs.existsSync(localRoot + '../')) fs.mkdirSync(localRoot + '../');
  if (!fs.existsSync(localRoot)) fs.mkdirSync(localRoot);
  if (!fs.existsSync(localRoot + '/templates')) fs.mkdirSync(localRoot + '/templates');
}

function createLocalConfig(config_ = config) {
  createDirs()
  return new Promise((resolve, reject) => {
    return fs.writeFile(localRoot + '/config.json', JSON.stringify(config_, '', 2), function (err) {
      if (err) return reject('Error creating local configuration file')
      return resolve(true)
    })
  })
}

module.exports.createLocalConfig = createLocalConfig

module.exports.getLocalConfig = async function () {
  let lang = await module.exports.getJSONFile('../lang.json')
  let config = await  module.exports.getJSONFile(localRoot + '/config.json')
  config.words = lang[config.lang]
  return config;
}

module.exports.push_name = function (name) {
  config.lists.name.push(name)
  createLocalConfig(config)
}

module.exports.push_path = function (path) {
  config.lists.path.push(path)
  createLocalConfig(config)
}

module.exports.createEmptyTemplate = function (filename, place = false) {
  createDirs()
  return new Promise((resolve, reject) => {
    fs.readFile(globalRoot + '/empty.vue', 'utf8', function (err, content) {
      if (err) return reject(err)
      let path = (!place ? localRoot : globalRoot) + '/templates/' + filename + '.vue'
      fs.writeFile(path, content, function (err) {
        if (err) return reject(err)
        return resolve(content)
      })
    })
  })
}