var vscode = require('vscode');

exports.ShowInput = async function (prompt = '', placeHolder = '') {
    return await vscode.window.showInputBox({ 
        prompt, 
        placeHolder 
    })
}

exports.ShowSelect = async function (items = [], placeHolder = '') {
    return await vscode.window.showQuickPick(
        items, 
        { ignoreFocusOut: true, placeHolder }
    )
}