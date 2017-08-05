var fs = require('fs');
var vscode = require('vscode');
var files = require('./files');
var getJSONFile = files.getJSONFile;
var config = files.config;
var lang = {};
let rootPath = __dirname;
let localPathConfig = vscode.workspace.rootPath + '/.vscode/generator-vue-components/';
let localPath = vscode.workspace.rootPath + '';
let menu = [];

let terminal = vscode.window.createTerminal('generator-vue -components');
//terminal.show()

/* ----------------------------------- Загрузка файлов конфигураций ----------------------------------- */
// Загрузка файлов config.json, lang.json и локального файла config.json в открытом проекте
files.setGlobalRoot(rootPath)
files.setLocalRoot(localPathConfig)

Promise.all([getJSONFile('config.json'), getJSONFile('lang.json')]).then(([config_, lang_]) => {
  config = config_;
  lang = lang_[config.lang];
  getJSONFile('config.json', true)
    .then(localConfig => {
      lang = lang_[localConfig.lang];
      if (localConfig.lang) config.lang = localConfig.lang;
      if (localConfig.default) {
        config.default.template = localConfig.default.template;
        config.default.name = localConfig.default.name;
        config.default.path = localConfig.default.path;
      }
      if (localConfig.lists) {
        config.lists.template = localConfig.lists.template;
        config.lists.name = localConfig.lists.name;
        config.lists.path = localConfig.lists.path;
      }
    })
    .catch(err => {
      console.log(lang['Local configuration file not found']);
    })
}).catch(err => {
  console.error(err);
  vscode.window.showErrorMessage(err.message);
}).then(values => {
  //Получение списка глобальных шаблонов
  files.getNamesGlobalTemplates().then(templates => {
    config.templates.global = templates
  })
})

/* ----------------------------------- Генерация нового компонента ----------------------------------- */
// Выбор имени компонента
function getName() {
  return new Promise(function (resolve, reject) {
    if (config.lists.name) {
      let itemsListNames = config.lists.name.map(i => i);
      itemsListNames.push(lang['Entering text without saving']);
      itemsListNames.push(lang['Entering text with saving']);
      resolve(vscode.window.showQuickPick(itemsListNames, { ignoreFocusOut: true, placeHolder: lang['The name of the component?'] }));
    } else {
      resolve(vscode.window.showInputBox({ prompt: lang['The name of the component?'], placeHolder: config.default.name, /*value: config.default.name//*/ }));
    }
  }).then(name => {
    if (name == '') return config.default.name;
    if (name == undefined) return Promise.reject('cancel')
    if (name == lang['Entering text without saving']) {
      return new Promise(function (resolve, reject) {
        resolve(vscode.window.showInputBox({ prompt: lang['The name of the component?'], value: config.default.name }));
      })
    }
    if (name == lang['Entering text with saving']) {
      return new Promise(function (resolve, reject) {
        resolve(vscode.window.showInputBox({ prompt: lang['The name of the component?'], value: config.default.name }));
      }).then(name => {
        // Обработка сохранения имени в локальнй конфиг (при отсутствии генерация конфига)
        files.getLocalConfig()
          .catch(err => {
            if (err.code == 'ENOENT')
              return files.createLocalConfig()
          })
          .then(values => {
            config.lists.name.push(name)
            files.push_name(name)
          })
        return name;
      })
    }
    return name
  })
}
// Выбор пути создания компонента
function getPath() {
  return new Promise(function (resolve, reject) {
    if (config.lists.path) {
      let itemsListPaths = config.lists.path.map(i => i);
      itemsListPaths.push(lang['Entering text without saving']);
      itemsListPaths.push(lang['Entering text with saving']);
      resolve(vscode.window.showQuickPick(itemsListPaths, { ignoreFocusOut: true, placeHolder: lang['The path to the component?'] }));
    } else {
      resolve(vscode.window.showInputBox({ prompt: lang['The path to the component?'], placeHolder: config.default.path /*, value: config.default.path//*/ }));
    }
  }).then(path => {
    if (path == '') return config.default.path;
    if (path == undefined) return Promise.reject('cancel')
    if (path == lang['Entering text without saving']) {
      return new Promise(function (resolve, reject) {
        resolve(vscode.window.showInputBox({ prompt: lang['The path to the component?'], value: config.default.path }));
      })
    }
    if (path == lang['Entering text with saving']) {
      return new Promise(function (resolve, reject) {
        resolve(vscode.window.showInputBox({ prompt: lang['The path to the component?'], value: config.default.path }));
      }).then(path => {
        // Обработка сохранения имени в локальнй конфиг (при отсутствии генерация конфига)
        files.getLocalConfig()
          .catch(err => {
            if (err.code == 'ENOENT')
              return files.createLocalConfig()
          })
          .then(values => {
            config.lists.path.push(path)
            files.push_path(path)
          })
        return path;
      })
    }
    return path
  })
}
// Выбор шаблона
function getTemplates() {
  if (config.lists.template) {
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
            return nameTemplate
          })
      })
  } else {
    return new Promise((resolve, reject) => {
      resolve(config.default.template)
    })
  }
}
// Меню генерации нового компонента
function generate() {
  getTemplates()
    .then(template => getName().then((name, err) => {
      console.log(err)
      return { template, name }
    }))
    .then(({ template, name }) => getPath().then(path => {
      return { template, name, path }
    }))
    .then(({ template, name, path }) => {
      let isLocal = false;
      if (template.indexOf("\t") != -1) {
        template = template.split("\t")[1];
        isLocal = true;
      }
      return files.getFile('/templates/' + template, isLocal)
        .then(text => {
          console.log(`template: ${template}, name: ${name}, path: ${path}`)
          return { template, name, path, text }
        })
    })
    .then(({ template, name, path, text }) => {
      let dir = path.split('/');
      text = text.replace(/{{name}}/g, name);

      if (!fs.existsSync(localPath + '/' + path)) {
        fs.mkdirSync(localPath + '/' + path);
      }

      console.log(localPath + '/' + path + '/' + name + '.vue')

      fs.writeFile(localPath + '/' + path + '/' + name + '.vue', text, function (err) {
        if (!err) {
          vscode.window.showInformationMessage(lang['Component is a created'] + `. Name: "${name}", Path: "${path}",  Template: "${template}"`);
          terminal.sendText('code "' + localPath + '/' + path + '/' + name + '.vue"')
        } else
          vscode.window.showInformationMessage(lang['Error writing file']);
      }); //*/

    })
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