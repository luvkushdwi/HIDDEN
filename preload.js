

if (!window.electronAPI) {
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Log to confirm preload is executing
console.log('Preload script is running');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'electronAPI', {
        toggleWindow: () => {
            console.log('Toggle window called');
            ipcRenderer.send('toggle-hidden-window');
        },
        closeWindow: () => {
            console.log('Close window called');
            ipcRenderer.send('close-window');
        }
    }
);

    console.log("electronAPI exposed successfully.");
}


