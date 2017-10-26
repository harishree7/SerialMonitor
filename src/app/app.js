const { BrowserWindow, app, Menu } = require("electron");
const path = require("path");
let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        title: "Serial Monitor",
        width: 704,
        height: 729,
        "web-preferences": {
            plugins: true,
            nodeIntegration: true
        },
        resizable: true,
        maximizable: true
    });

    // console.log(path.join($dirname, "/../"));
    // and load the index.html of the app.
    mainWindow.loadURL(`file://${$dirname}/../web/index.html`);
    Menu.setApplicationMenu(null);
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