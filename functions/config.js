var fs = require('fs');
var vscode = require('vscode');

let path_global = __dirname + '/../'
let path_local = vscode.workspace.rootPath + '/.vscode/generator-vue-components/' + ''

let path = './'

let isLocal = fs.existsSync(path_local)

if (isLocal) path = path_local
else path = path_global

let path_config = path + '/config.json'

exports.isLocal = isLocal

exports.SaveConfig = async function (config) {
    fs.writeFile(path_config, JSON.stringify(config))
}

exports.LoadConfig = async function () {
    let config = await new Promise(async (resolve, reject) => {
        fs.readFile(path_config, function (err, config) {
            if (err) reject(err)
            resolve(JSON.parse(config))
        })
    })
    let lang = await new Promise(async (resolve, reject) => {
        fs.readFile(path_global + '/lang.json', function (err, lang) {
            if (err) reject(err)
            resolve(JSON.parse(lang))
        })
    })
    config.words = lang[config.lang]
    return config
}

function transformTemplateName(items, path) {
    return items.map(item => ({title: item, path: `${path}/${item}`}))
}

exports.getTamplates = async function () {
    let templates = []
    let local = await new Promise((resolve, reject) => {
        if (isLocal) {
            fs.readdir(path_local + '/templates', function (err, items) {
                if (err) {
                    reject(err)
                } else {
                    resolve(transformTemplateName(items, path_local + '/templates'))
                }
            })
        } else
            resolve([])
    })

    if (local && local.length) return local;
    
    let global = await new Promise((resolve, reject) => {
        fs.readdir(path_global + '/templates', function (err, items) {
            if (err) {
                reject(err)
            } else {
                resolve(transformTemplateName(items, path_global + '/templates'))
            }
        })
    })

    return global
}

