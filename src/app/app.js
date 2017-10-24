import { app, ipcMain } from "electron";
import Promise from "promise";

function main() {
    try {
        parseArgv(process.argv);
    } catch (err) {
        console.error(err.message);
        app.exit(1);
        return;
    }
    app.once("quit", function() {
        application.quit();
    });
}

if (app.isReady()) {
    global.perfAppReady = Date.now();
    main();
} else {
    app.once("ready", () => {
        global.perfAppReady = Date.now();
        main();
    });
    app.on("window-all-closed", () => {
        app.quit();
    });
}

const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    const mainWindow = apis.getAPI("WindowsManagement").getWindow("default");
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
    }
});

if (shouldQuit) {
    app.quit();
}