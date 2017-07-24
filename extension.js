// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var fs = require('fs');
var mkdirp = require('mkdirp');

function getEmptyConfig() {
  return { path: '', name: 'component', pathTemplate: __dirname + '/component.vue' }
}

var componentText = '';
var config = getEmptyConfig()

fs.readFile(__dirname + '/config.json', 'utf8', function (err, text) {
  if (!err) {
    try {
      config = JSON.parse(text)
    } catch (err) {
      vscode.window.showInformationMessage('Ошибка разбора файла конфигурации');
      config = getEmptyConfig()
    }
  } else {
    vscode.window.showInformationMessage('Не найден файл конфигурации');
  }
})

let localPathTemplate = vscode.workspace.rootPath + '/.vscode/template-component.vue'
if (fs.existsSync(localPathTemplate)) {
  config.pathTemplate = localPathTemplate
}

fs.readFile(config.pathTemplate, 'utf8', function (err, text) {
  if (!err) {
    componentText = text;
  } else {
    vscode.window.showInformationMessage('Не найден шаблон компонента');
  }
})


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "generator-vue-components" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  var disposable = vscode.commands.registerCommand('extension.generateComponent', function () {
    // The code you place here will be executed every time your command is executed

    var Prom = new Promise(function (resolve, reject) {
        return resolve(vscode.window.showInputBox({ prompt: "Имя компонента?", value: config.name }))
      })
      .then(function (name) {
        return vscode.window.showInputBox({ prompt: "Путь к компоненту?", value: config.path })
          .then(function (path) {
            return {
              name,
              path
            }
          })
      }).then(function (localConfig) {
        if (localConfig.name) config.name = localConfig.name
        if (localConfig.path) config.path = localConfig.path

        let text = componentText.replace(/{{name}}/g, config.name);

        if (!fs.existsSync(vscode.workspace.rootPath + '/' + config.path)) {
          mkdirp(vscode.workspace.rootPath + '/' + config.path);
        }

        fs.writeFile(vscode.workspace.rootPath + '/' + config.path + '/' + config.name + '.vue', text, function (err) {
          if (!err) {
            vscode.window.showInformationMessage('Компонент создан');
          } else
            vscode.window.showInformationMessage('Ошибка записи файла');
        })
      })
  });

  context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;