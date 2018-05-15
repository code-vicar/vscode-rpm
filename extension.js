var path = require('path');
var vscode = require('vscode');
var rpm = require('@code-vicar/rpm');

function activate(context) {
    var oc = vscode.window.createOutputChannel('rpm');

    var disposableInstall = vscode.commands.registerCommand('rpm.install', function() {
        commandInstall(oc);
    });

    var disposablePack = vscode.commands.registerCommand('rpm.pack', function() {
        commandPack(oc);
    });

    var disposableDeploy = vscode.commands.registerCommand('rpm.deploy', function() {
        commandPack(oc).then(function() {
            commandDeploy(oc);
        });
    });

    context.subscriptions.push(oc);
    context.subscriptions.push(disposableInstall);
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

function commandInstall(oc) {
    var rpmConfig = vscode.workspace.getConfiguration('rpm');
    var config = {};

    config.cwd = getDir(rpmConfig);
    config.ignore = rpmConfig.get('pack.ignore');

    return install(config, oc);
}

function commandPack(oc) {
    var rpmConfig = vscode.workspace.getConfiguration('rpm');
    var config = {};

    config.cwd = getDir(rpmConfig);
    config.ignore = rpmConfig.get('pack.ignore');

    return pack(config, oc);
}

function commandDeploy(oc) {
    var rpmConfig = vscode.workspace.getConfiguration('rpm');
    var config = {};

    config.cwd = getDir(rpmConfig);
    config.ipaddress = rpmConfig.get('deploy.ipaddress');
    config.user = rpmConfig.get('deploy.user', 'rokudev');
    config.password = rpmConfig.get('deploy.password', '1111');

    return deploy(config, oc);
}

function install(config, oc) {
    return new Promise(function(resolve, reject) {
        var rpmConfig = vscode.workspace.getConfiguration('rpm');
        if (!!rpmConfig.get('debug')) {
            message('debug::config - ' + JSON.stringify(config) , oc);
        }

        if (!config.cwd) {
            message('No directory specified', oc);
            return reject();
        }

        // Display a message box to the user
        var installation = rpm.install(config).then(function() {
            message('rpm install success', oc);
        }).catch(function(err) {
            console.error(err);
            if (err && err.message) {
                message(err.message, oc, false);
            }
            message('rpm install failed', oc);
        });

        message('Installing rpm dependencies', oc, true, installation);
        return resolve(installation);
    })
}

function pack(config, oc) {
    return new Promise(function(resolve, reject) {
        var rpmConfig = vscode.workspace.getConfiguration('rpm');
        if (!!rpmConfig.get('debug')) {
            message('debug::config - ' + JSON.stringify(config) , oc);
        }

        if (!config.cwd) {
            message('No directory specified', oc);
            return reject();
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
        });

        message('Packaging roku app', oc, true, packaging);
        return resolve(packaging);
    })
}

function deploy(config, oc) {
    return new Promise(function(resolve, reject) {
        var rpmConfig = vscode.workspace.getConfiguration('rpm');
        if (!!rpmConfig.get('debug')) {
            message('debug::config - ' + JSON.stringify(config), oc);
        }

        if (!config.cwd) {
            message('No directory specified', oc);
            return reject();
        }
        if (!config.ipaddress) {
            message('No ipaddress specified', oc);
            return reject();
        }

        var deploying = rpm.deploy(config).then(function() {
            message('rpm deploy success', oc);
        }).catch(function(err) {
            console.error(err)
            if (err && err.message) {
                message(err.message, oc, false);
            }
            message('rpm deploy failed', oc);
        });

        message('Deploying roku app', oc, true, deploying);
        return resolve(deploying);
    })
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
