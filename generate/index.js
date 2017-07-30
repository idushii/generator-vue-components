var vscode = require('vscode');
let config = {};
let lang = {}

module.exports.setConfig = function (config_ = { lang: 'en', default: { name: 'component', path: '/src/components/' }, lists: [] }) {
  config = config_
  console.log('Установлен файл конфигурации')
}

module.exports.component = function () {
  vscode.window.showInputBox({ prompt: lang['The name of the component?'], value: config.default.name })
}