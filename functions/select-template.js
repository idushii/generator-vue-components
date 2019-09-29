var { ShowInput, ShowSelect } = require('./show-input')
var { getTamplates, isLocal } = require('./config')
var fs = require('fs');

exports.SelectTemplate = async function(config) {
    let template = ''
    let templates = await getTamplates()
        
    template = await ShowSelect( templates.map(item =>item.title), config.words['Выберите шаблон'] )

    if (template == '') return config.default.template
    if (template == undefined) return false
    if (template == config.words.cancel) return false
    if (template) {
        template = (templates.find(item => item.title == template) || {}).path
        return {template}
    };
    return false;
}