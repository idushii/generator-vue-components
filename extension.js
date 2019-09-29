var fs = require('fs');
var pathModule = require('path');
var vscode = require('vscode');
var files = require('./files');
var getJSONFile = files.getJSONFile;
var lang = {};
let rootPath = __dirname;
let localPathConfig = vscode.workspace.rootPath + '/.vscode/generator-vue-components/';
let localPath = vscode.workspace.rootPath + '';
let menu = [];

let terminal = vscode.window.createTerminal('generator-vue -components');
//terminal.show()

var {SelectNameComponent} = require('./functions/select-name');
var {SelectPath} = require('./functions/select-path');
var {SelectTemplate} = require('./functions/select-template');
var {LoadConfig} = require('./functions/config');

var config = files.config;

/* ----------------------------------- Загрузка файлов конфигураций ----------------------------------- */
// Загрузка файлов config.json, lang.json и локального файла config.json в открытом проекте
files.setGlobalRoot(rootPath)
files.setLocalRoot(localPathConfig)

/* ----------------------------------- Генерация нового компонента ----------------------------------- */
// Выбор имени компонента

// Выбор пути создания компонента

// Выбор шаблона

// Создание компонента

async function CreateComponent({template, name, path}) {
  let text = fs.readFileSync(pathModule.normalize(template), {encoding: "utf8"})
  let dir = pathModule.normalize(path).split(pathModule.sep).filter(item => item);
  dir = dir[dir.length - 1]
  text = text.replace(/{{name}}/g, name).replace(/{{dir}}/g, dir);
  let fullPath = pathModule.normalize(localPath + pathModule.sep + path + pathModule.sep + name + '.vue')
  let result = fs.writeFileSync(fullPath, text)
  if (!result) {
    vscode.window.showInformationMessage(config.words['Компонент создан'] + `. Name: "${name}", Path: "${path}",  Template: "${template}"`);
    terminal.sendText('code "' + fullPath + '"')
  } else {
    vscode.window.showInformationMessage(config.words['Ошибка записи файла']);
  }
}

// Меню генерации нового компонента
async function generate() {
  config = await LoadConfig()

  let {template} = await SelectTemplate(config)
  if (!template) return

  let name = await SelectNameComponent(config)
  if (!name) return

  let path = await SelectPath(config)
  if (!path) return

  CreateComponent({template, name, path})
}

/* ----------------------------------- Подменю config.json ----------------------------------- */
function menu_config() {
  menu.length = 0;
  menu[0] = 'config'
  return Promise.resolve(vscode.window.showQuickPick([lang['Глобальный'], lang['Локальный']], { ignoreFocusOut: true, placeHolder: 'Какой файл config открыть?' }))
    .then((value) => {
      if (value == undefined) return;
      if (value == lang['Глобальный']) {
        //Открытие глобального файла config
        menu[2] = 'global'
        menu[3] = 'open'
        terminal.sendText('code "' + rootPath + '/config.json"')
      }
      if (value == lang['Локальный']) {
        //Открытие локального файла config
        menu[2] = 'local'
        files.getLocalConfig()
          .catch(err => {
            if (err.code == 'ENOENT') {
              menu[3] = 'create'
              return vscode.window.showQuickPick([lang['Да'], lang['Нет']], { placeHolder: lang['Локальный файл настроек не найден. Создать его?'] }).then(result => {
                if (result == lang['Да']) {
                  return files.createLocalConfig()
                    .then(result => {
                      vscode.window.showInformationMessage(lang['Создал локальный файл config.json']);
                      menu[3] = 'open';
                    })
                    .catch(err => vscode.window.showErrorMessage(err)) //*/
                } else {
                  return Promise.reject('cancel')
                }
              })
            } else {
              vscode.window.showErrorMessage(err.message)
            }
          })
          .then(value => {
            menu[3] = 'open'
            terminal.sendText('code "' + localPathConfig + '/config.json"')
          })
      }
    })
}

/* ----------------------------------- Подменю создания шаблона ----------------------------------- */
function menu_create_template() {
  let list = [lang['Глобальный'], lang['Локальный']]
  return Promise.resolve(vscode.window.showQuickPick(list, { placeHolder: lang['Создать шаблон глобально или локально?'], ignoreFocusOut: true }))
    .then(place => {
      if (place == undefined) return Promise.reject('cancel')
      return new Promise((resolve, reject) => { resolve(vscode.window.showInputBox({ prompt: lang['Какое имя файла шаблона?'], placeHolder: 'component', ignoreFocusOut: true })) })
        .then(name => {
          return { place, name }
        })
    })
    .then(({ place, name }) => {
      if (name == '') name = 'component'
      if (name == undefined) return Promise.reject('cancel')
      files.createEmptyTemplate(name, place == lang['Глобальный'])
        .then(content => {
          terminal.sendText('code "' + (place ? rootPath + '/templates/' : files.localRoot) + '/' + name + '.vue"')
        })
        .catch(err => {
          vscode.window.showErrorMessage(err.message || err)
        })
    })
}
/* ----------------------------------- Подменю редактирования шаблона ----------------------------------- */

function menu_edit_template() {
  return new Promise((resolve, reject) => {
      resolve(files.getNamesLocalTemplates())
    })
    .catch(err => {
      return []
    })
    .then((LocalNames = []) => {
      config.templates.local = LocalNames
      let names = []

      if (LocalNames.length) {
        names = config.templates.local.map(n => `${lang['local']}\t` + n).join(';') + ';'
        names += config.templates.global.map(n => `${lang['global']}\t` + n).join(';');
        names = names.split(';')
      } else {
        names = config.templates.global
      }

      return new Promise((resolve, reject) => {
          resolve(vscode.window.showQuickPick(names, {
            placeHolder: lang['Select a template'],
            ignoreFocusOut: true
          }))
        })
        .then(nameTemplate => {
          if (nameTemplate == undefined) return Promise.reject('cancel')
          let type = 'global'
          if (nameTemplate.indexOf('\t') != -1) {
            if (nameTemplate.split('\t')[0] == lang['local']) { type = 'local' }
            nameTemplate = nameTemplate.split('\t')[1]
          }
          return { type, name: nameTemplate }
        })
        .then(({ type, name }) => {
          let path = (type == 'local' ? localPathConfig : rootPath) + '/templates/' + name
          terminal.sendText('code "' + path + '"')
        })
    })
}

/* ----------------------------------- Меню настройки ----------------------------------- */
function options() {
  let itemsMenu = [
    lang['Создать новый шаблон'],
    lang['Изменить существующий шаблон'],
    lang['Открыть файл config.json'],
  ]
  menu = [];
  new Promise((resolve, reject) => {
    return resolve(vscode.window.showQuickPick(itemsMenu, { ignoreFocusOut: true, placeHolder: 'Выберите пункт меню' }))
  }).then(item => {
    switch (item) {
    case undefined:
      return Promise.reject('cancel');
    case lang['Создать новый шаблон']:
      return menu_create_template()
    case lang['Изменить существующий шаблон']:
      return menu_edit_template()
    case lang['Открыть файл config.json']:
      return menu_config()
    default:
      return Promise.reject('cancel');
    }
  }).then((value) => {
    if (value == undefined) return Promise.reject('cancel')
  })
}

/* ----------------------------------- Активация функций ----------------------------------- */
function activate(context) {
  context.subscriptions.push(vscode.commands.registerCommand('extension.generateComponent', generate));
  context.subscriptions.push(vscode.commands.registerCommand('extension.options', options));
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
/* ----------------------------------- //Активация функций ----------------------------------- */