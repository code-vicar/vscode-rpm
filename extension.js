var path = require('path');
var vscode = require('vscode');
var rpm = require('@code-vicar/rpm');

function activate(context) {
    var oc = vscode.window.createOutputChannel('rpm');
    var rpmConfig = vscode.workspace.getConfiguration('rpm');

    var disposablePack = vscode.commands.registerCommand('rpm.pack', function () {
        var config = {};

        config.cwd = getDir(rpmConfig);
        config.ignore = rpmConfig.get('pack.ignore');

        pack(config, oc);
    });

    var disposableDeploy = vscode.commands.registerCommand('rpm.deploy', function() {
        var config = {};

        config.cwd = getDir(rpmConfig);
        config.ipaddress = rpmConfig.get('deploy.ipaddress');
        config.user = rpmConfig.get('deploy.user', 'rokudev');
        config.password = rpmConfig.get('deploy.password', '1111');

        deploy(config, oc);
    });

    context.subscriptions.push(oc);
    context.subscriptions.push(disposablePack);
    context.subscriptions.push(disposableDeploy);
}
exports.activate = activate;

function getDir(rpmConfig) {
    var rootDir = vscode.workspace.rootPath;
    if (rootDir) {
        var configDir = rpmConfig.get('dir');
        if (configDir) {
            return path.resolve(rootDir, configDir);
        }

        return path.resolve(rootDir);
    }
}

function pack(config, oc) {
    if (!config.cwd) {
        message('No directory specified', oc);
        return;
    }

    // Display a message box to the user
    var packaging = rpm.pack(config).then(function() {
        message('rpm pack success', oc);
    }).catch(function(err) {
        console.error(err);
        if (err && err.message) {
            message(err.message, oc, false);
        }
        message('rpm pack failed', oc);
    })

    message('Packaging roku app', oc, true, packaging);
}

function deploy(config, oc) {
    if (!config.cwd) {
        message('No directory specified', oc);
        return;
    }
    if (!config.ipaddress) {
        message('No ipaddress specified', oc);
        return;
    }

    var deploying = rpm.deploy(config).then(function() {
        message('rpm deploy success', oc);
    }).catch(function(err) {
        console.error(err)
        if (err && err.message) {
            message(err.message, oc, false);
        }
        message('rpm deploy failed', oc);
    })

    message('Deploying roku app', oc, true, deploying);
}

function message(text, oc, statusBar = true, thenable) {
    if (statusBar) {
        if (thenable) {
            vscode.window.setStatusBarMessage(text, thenable);
        } else {
            vscode.window.setStatusBarMessage(text, 10000);
        }
    }
    oc.appendLine(text);
    oc.show();
}
