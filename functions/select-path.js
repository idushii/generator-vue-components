var { ShowInput, ShowSelect } = require('./show-input')
var { SaveConfig } = require("./config");

exports.SelectPath = async function(config) {
    let path = ''
    if (!config || !config.lists || !config.lists.path) {
        path = await ShowInput(config.words['Путь к компоненту?'], config.default.path)
    } else {
        let itemsListNames = config.lists.path;
        itemsListNames.push(config.words['Ввод с сохранением']);
        itemsListNames.push(config.words['Ввод без сохранения']);
        path = await ShowSelect( itemsListNames, config.words['Путь к компоненту?'] )
        if (path == config.words['Ввод без сохранения']) {
            path = await ShowInput(config.words['Путь к компоненту?'], config.default.path)
        }
        if (path == config.words['Ввод с сохранением']) {
            path = await ShowInput(config.words['Путь к компоненту?'], config.default.path)
            if (!config) config = {}
            if (!config.lists) config.lists = {}
            if (!config.lists.path) config.lists.path = []
            config.lists.path.push(path)
            SaveConfig(config)
        }
    }

    if (path == '') return config.default.path
    if (path == undefined) return false
    if (path == config.words.cancel) return false
    if (path) return path;
    return false;
}