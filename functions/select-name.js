var { ShowInput, ShowSelect } = require('./show-input')
var { SaveConfig } = require("./config");

exports.SelectNameComponent = async function (config) {
    let name = ''
    if (!config || !config.lists || !config.lists.name) {
        name = await ShowInput(config.words['Имя компонента?'], config.default.name)
    } else {
        let itemsListNames = config.lists.name;
        itemsListNames.push(config.words['Ввод с сохранением']);
        itemsListNames.push(config.words['Ввод без сохранения']);
        name = await ShowSelect(itemsListNames, config.words['Имя компонента?'])
        if (name == config.words['Ввод без сохранения']) {
            name = await ShowInput(config.words['Имя компонента?'], config.default.name)
        }
        if (name == config.words['Ввод с сохранением']) {
            name = await ShowInput(config.words['Имя компонента?'], config.default.name)
            if (!config) config = {}
            if (!config.lists) config.lists = {}
            if (!config.lists.name) config.lists.name = []
            config.lists.name.push(name)
            SaveConfig(config)
        }
    }

    if (name == '') return config.default.name
    if (name == undefined) return false
    if (name == config.words.cancel) return false
    if (name) return name;
    return false;
}