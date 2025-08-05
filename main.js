
const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');
const path = require('path');

let hiddenWindow = null;

function createHiddenWindow() {
    if (hiddenWindow && !hiddenWindow.isDestroyed()) {
        console.log("Showing existing hidden window");
        hiddenWindow.show();
        return;
    }
    
    console.log("Creating a new hidden window");
    
    hiddenWindow = new BrowserWindow({
        width: 800,
        height: 400,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        hasShadow: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        show: false,
        movable: true,
        focusable: true
    });

    hiddenWindow.loadFile('hidden.html');
    
    hiddenWindow.webContents.openDevTools(); // Open DevTools for debugging
    
    hiddenWindow.once('ready-to-show', () => {
        console.log("Hidden window is ready to show");
        
        if (process.platform === 'darwin') {
            console.log("Applying macOS-specific settings");
            hiddenWindow.setWindowButtonVisibility(false);
            hiddenWindow.setAlwaysOnTop(true, 'floating', 1);
            hiddenWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
        } else if (process.platform === 'win32') {
            console.log("Applying Windows-specific settings");
            hiddenWindow.setSkipTaskbar(true);
            hiddenWindow.setMenu(null);
            hiddenWindow.setAlwaysOnTop(true, 'screen-saver');
        }
        
        hiddenWindow.setOpacity(0.98);
        hiddenWindow.setContentProtection(true);
        hiddenWindow.show();
    });
    
    hiddenWindow.on('blur', () => {
        console.log("Hidden window lost focus, setting AlwaysOnTop");
        if (hiddenWindow && !hiddenWindow.isDestroyed()) {
            hiddenWindow.setAlwaysOnTop(true);
        }
    });
    
    hiddenWindow.on('closed', () => {
        console.log("Hidden window closed");
        hiddenWindow = null;
    });
}

app.whenReady().then(() => {
    console.log("App is ready");
    createHiddenWindow();
    
    globalShortcut.register('Command+Alt+H', () => {
        console.log("Global shortcut triggered");
        if (!hiddenWindow || hiddenWindow.isDestroyed()) {
            createHiddenWindow();
        } else {
            if (hiddenWindow.isVisible()) {
                console.log("Hiding hidden window");
                hiddenWindow.hide();
            } else {
                console.log("Showing hidden window");
                hiddenWindow.show();
            }
        }
    });

    app.on('activate', () => {
        console.log("App activated");
        if (BrowserWindow.getAllWindows().length === 0) createHiddenWindow();
    });
});

ipcMain.on('toggle-hidden-window', () => {
    console.log('Received toggle-hidden-window event');
    if (!hiddenWindow || hiddenWindow.isDestroyed()) {
        createHiddenWindow();
    } else {
        if (hiddenWindow.isVisible()) {
            console.log("Toggling: Hiding hidden window");
            hiddenWindow.hide();
        } else {
            console.log("Toggling: Showing hidden window");
            hiddenWindow.show();
        }
    }
});

ipcMain.on('close-window', () => {
    console.log('Received close-window event');
    if (hiddenWindow && !hiddenWindow.isDestroyed()) {
        console.log("Hiding hidden window instead of closing");
        hiddenWindow.hide();
    }
});

app.on('window-all-closed', () => {
    console.log("All windows closed");
    if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
    console.log("App is quitting, unregistering global shortcuts");
    globalShortcut.unregisterAll();
});
