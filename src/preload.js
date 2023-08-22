// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('LESPREP', {
  nodeVersion: () => process.versions.node,
  chromeVersion: () => process.versions.chrome,
  electronVersion: () => process.versions.electron,
  run: run,
  openFileDialog: openFileDialog,
  openSaveFileDialog: openSaveFileDialog,
  openFslStandardFileDialog: openFslStandardFileDialog,
  getCommsInfo: getCommsInfo,
  onMNIReference: onMNIReference
})

async function onMNIReference(mm) {
  return ipcRenderer.invoke('onMNIReference', mm)
}

/**
 * get the comms info object from the main process
 * @async
 * @function
 * @returns {Promise<Object>} A promise that resolves to an object containing the comms info.
 * @example
 * const commsInfo = await FSL.getCommsInfo();
 * console.log(commsInfo);
 */
async function getCommsInfo() {
  return ipcRenderer.invoke('getCommsInfo')
}

/**
 * Runs the given command with the given options.
 * @async
 * @function
 * @param {string} command - The command to run.
 * @param {Object} opts - The options to use when running the command.
 * @returns {Promise<string>} A promise that resolves to a message indicating that the command was run in the main process.
 * @example
 * const runObject = {
 *    command: 'bet',
 *   opts: {
 *      input: 'test.nii.gz',
 *     output: 'test_brain.nii.gz',
 *   },
 * };
 * const message = await FSL.run(runObject);
 * console.log(message);
 */
async function run({command, opts}) {
  const runObject = {
    command,
    opts
  }
  return ipcRenderer.invoke('run', runObject)
}

/**
 * opens a file dialog in the main process
 * @async
 * @function
 * @returns {Promise<Object>} A promise that resolves to an object containing the file path and the file name.
 * @example
 * const resultObject = await FSL.openFileDialog();
 * console.log(resultObject.filepaths[0]);
 */
async function openFileDialog() {
  return ipcRenderer.invoke('openFileDialog')
}

/**
 * opens a save file dialog in the main process
 * @async
 * @function
 * @returns {Promise<Object>} A promise that resolves to an object containing the file path and the file name.
 * @example
 * const resultObject = await FSL.openSaveFileDialog();
 * console.log(resultObject.filepath);
 */
async function openSaveFileDialog() {
  return ipcRenderer.invoke('openSaveFileDialog')
}

/**
 * opens a file dialog in the main process starting in the FSL standard directory
 * @async
 * @function
 * @returns {Promise<Object>} A promise that resolves to an object containing the file path and the file name.
 * @example
 * const resultObject = await FSL.openFslStandardFileDialog();
 * console.log(resultObject.filepaths[0]);
 */
async function openFslStandardFileDialog() {
  return ipcRenderer.invoke('openFslStandardFileDialog')
}