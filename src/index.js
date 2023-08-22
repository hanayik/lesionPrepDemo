const { app, BrowserWindow, Menu, ipcMain} = require('electron');
const path = require('path');
const fs = require('fs');
const { fork } = require("child_process");
const {devPorts} = require('./devPorts');
const {events} = require('./events');

app.commandLine.appendSwitch('--no-sandbox');
// ignore gpu blacklist
app.commandLine.appendSwitch('--ignore-gpu-blacklist');

// launch the fileServer as a background process
fileServer = fork(
  path.join(__dirname, "fileServer.js"),
  { env: { FORK: true } }
);

/**
 * handles setting the process env variables for the fileServer port and host
 * @param {number} port - the port the fileServer is listening on
 * @returns {undefined}
 * @function
 */
function onFileServerPort(port) {
  process.env.LESPREP_FILESERVER_PORT = port;
  process.env.LESPREP_HOST = 'localhost';
}

// handler function for the fileServer port message
function handleFileServerMessage(message) {
  // msg is expected to be a JSON object (automatically serialized and deserialized by process.send and 'message')
  // a message object has a 'type' and a 'value' as properties
  if (message.type === "fileServerPort") {
    onFileServerPort(message.value);
  }
}

// register the handler function for fileServer messages
fileServer.on("message", (message) => {
  handleFileServerMessage(message);
});


/**
 * Determines if the application is running in development mode.
 * @returns {boolean} True if the application is running in development mode, false otherwise.
 */
function isDev() {
  // process.argv is an array of the command line arguments
  // the first two are the path to the node executable and the path to the script being run
  // the third is the first argument passed to the app
  // if it's "--dev", we're in development mode
  return process.argv[2] === '--dev';
}

/**
 * Registers IPC listeners for the events object.
 */
function registerIpcListeners() {
  for (const [key, value] of Object.entries(events)) {
    /**
     * The handler function for the event.
     * @param {Electron.IpcMainInvokeEvent} event - The event object.
     * @param {object} obj - The object containing the event arguments.
     * @returns {Promise<any>} A promise that resolves to the result of the event handler.
     * @async
     * @function
     * @example
     * ipcRenderer.invoke('fslVersion').then((fslVersion) => {
     *  console.log(fslVersion);
     */
    async function handler(event, obj) {
      const result = await value(obj);
      return result;
    }
    ipcMain.handle(key, handler);
  }
  // create the initial window, start by showing the history gui by default
  createWindow('gui');
}

/**
 * Launches an external GUI process.
 * @param {string} guiName - The name of the GUI to launch.
 */
function launchExternalGui(guiName) {
  const externalGuis = [
    'fsleyes',
    //MRIcroGL perhaps? :)
  ];

  if (externalGuis.includes(guiName)) {
    const { spawn } = require('child_process');
    const child = spawn(guiName, [], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
    return true;
  } else {
    return false;
  }
}

/**
 * Creates a new browser window for the specified GUI.
 * @param {string} guiName - The name of the GUI to create a window for.
 */
function createWindow(guiName='gui') {

  if (launchExternalGui(guiName)) {
    return;
  } 
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev()) {
    try {
      mainWindow.loadURL(`http://localhost:${devPorts[guiName]}`);
    } catch (err) {
      console.log(`Error loading ${guiName} at http://localhost:${devPorts[guiName]}`);
      console.log(err);
    }
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  } else {
    // construct path to the requested gui
    let guiPath  = path.join(__dirname, '..', 'frontend', 'dist', 'index.html')
    // check if the file at guiPath exists
    let guiPathExists = fs.existsSync(guiPath);
    if (guiPathExists) {
      console.log(`Loading ${guiName} at ${guiPath}`)
      mainWindow.loadFile(guiPath);
    } else {
      console.log(`Error loading ${guiName} at ${guiPath}`)
    }

  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', registerIpcListeners);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  // close the file server gracefully
  fileServer.kill()
  app.quit();
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
  }
});

let menu = [
  {
    label: 'Window',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: () => {
          BrowserWindow.getFocusedWindow().reload();
        }
      },
      {
        label: 'Toggle DevTools',
        accelerator: 'CmdOrCtrl+Shift+I',
        click: () => {
          BrowserWindow.getFocusedWindow().toggleDevTools();
        }
      }
    ]
  }
];
// Add macOS application menus
if (process.platform === 'darwin') {
  menu.unshift({
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services', submenu: [] },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  });
}

Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

