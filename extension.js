var vscode = require('vscode');
var rpm = require('@code-vicar/rpm')

function activate(context) {
    var disposablePack = vscode.commands.registerCommand('rpm.pack', function () {
        var dir = vscode.workspace.rootPath
        if (!dir) {
            vscode.window.setStatusBarMessage('No directory specified', 10000);
            return
        }

        // Display a message box to the user
        var packaging = rpm.pack({cwd: dir}).then(function() {
            vscode.window.setStatusBarMessage('rpm pack success', 10000);
        }).catch(function(err) {
            console.error(err)
            vscode.window.setStatusBarMessage('rpm pack failed', 10000);
        })

        vscode.window.setStatusBarMessage('Packaging roku app', packaging);
    });

    var disposableDeploy = vscode.commands.registerCommand('rpm.deploy', function() {
        var dir = vscode.workspace.rootPath
        if (!dir) {
            vscode.window.setStatusBarMessage('No directory specified', 10000);
            return
        }

        var deploying = rpm.deploy({ ipaddress: "", cwd: dir }).then(function() {
            vscode.window.setStatusBarMessage('rpm deploy success', 10000);
        }).catch(function(err) {
            console.error(err)
            vscode.window.setStatusBarMessage('rpm deploy failed', 10000);
        })

        vscode.window.setStatusBarMessage('Deploying roku app', deploying);
    });

    context.subscriptions.push(disposablePack);
    context.subscriptions.push(disposableDeploy);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;