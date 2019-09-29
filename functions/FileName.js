exports.prefics = async function (config) {
    console.log(config)
    if (config && config.prefics && config.prefics.length) {
        let prefics = await vscode.window.showQuickPick([...config.prefics, config.words.continue])
        if (!prefics && prefics != config.words.continue) {
            return prefics
        }
        return false
    }
    return false
}