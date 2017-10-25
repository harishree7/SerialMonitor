const { BrowserWindow, app, ipcMain } = require("electron");
const path = require("path");
let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        title: "Serial Monitor",
        width: 1024,
        height: 768,
        "web-preferences": {
            plugins: true,
            nodeIntegration: true
        }
    });

    console.log($dirname);
    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/../web/index.html`);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    mainWindow.on("closed", function() {
        mainWindow = null;
    });
}

app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function() {
    app.quit();
});

app.on("activate", function() {
    if (mainWindow === null) {
        createWindow();
    }
});
process.on("uncaughtException", function(err) {
    console.log(err);
});