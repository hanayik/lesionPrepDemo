// require fs and path
const fs = require('fs').promises
const path = require('path')
const util = require('util') // node.js utility module for promisify

/**
 * gets the file server port and host from the environment variables
 * @async
 * @function
 * @returns {Promise<Object>} A promise that resolves to an object containing the file server port and host.
 * @example
 * const commsInfo = await fsljs.getCommsInfo();
 * console.log(commsInfo);
 * // { fileServerPort: 12345, host: 'localhost' }
 */
async function onGetCommsInfo() {
    let fileServerPort = process.env.FSLGUI_FILESERVER_PORT;
    let host = process.env.FSLGUI_HOST;
    let route = 'file';
    let queryKey = 'filename';
    return {fileServerPort, host, route, queryKey};
}

/**
 * Handles the "run" command.
 * @async
 * @function
 * @returns {Promise<Object>} A promise that resolves to an object containing the error, stdout, and stderr.
 */
async function onRun(runOpts) {
    // get FSLDIR
    const fslDir = process.env.FSLDIR;
    // construct the path to the $FSLDIR/share/fsl/bin
    const fslBinDir = path.join(fslDir, 'share', 'fsl', 'bin');
    let commandString = createCommandString(runOpts);
    console.log(commandString)
    let fullCommand  = path.join(fslBinDir, commandString);
    // run the command in a subprocess
    const exec = util.promisify(require('child_process').exec);
    async function runCommand() {
        console.log(fullCommand)
        const {error, stdout, stderr}  = await exec(fullCommand);
        console.log('stdout:', stdout);
        console.log('stderr:', stderr);
        console.log('error:', error);
        return {error, stdout, stderr};
    }
    // try to run the command and catch any errors
        const {error, stdout, stderr} = await runCommand().catch((error) => {
            return error;
        });
        // save the runOpts to the history file
        // add the error, stdout, and stderr to the runOpts
        runOpts.error = error;
        runOpts.stdout = stdout;
        runOpts.stderr = stderr;
        // add the full command to the runOpts
        runOpts.fullCommand = fullCommand;
        saveCommand(runOpts);
        return {error, stdout, stderr};
}

/**
 * Handles the "MNI reference" event for quick reference file selection.
 * @async
 * @function
 * @param {number} mm - The resolution of the MNI reference file to return. 1 for 1mm, 2 for 2mm.
 * @returns {Promise<string>} A promise that resolves to the path to the MNI reference file.
 * @example
 * const mniReference = await fsljs.onMNIReference(2);
 * console.log(mniReference);
 * // /usr/local/fsl/data/standard/MNI152_T1_2mm_brain.nii.gz
 */
async function onMNIReference(mm=2) {
    // get the FSLDIR environment variable
    const fslDir = process.env.FSLDIR;
    // construct the path to the $FSLDIR/data/standard/MNI152_T1_2mm_brain.nii.gz
    if (mm === 2) {
        const mniReference = path.join(fslDir, 'data', 'standard', 'MNI152_T1_2mm_brain.nii.gz');
        return mniReference;
    } else if (mm === 1) {
        const mniReference = path.join(fslDir, 'data', 'standard', 'MNI152_T1_1mm_brain.nii.gz');
        return mniReference;
    }
    return null
}


/**
 * Handles the openFileDialog command.
 * @async
 * @function
 * @returns {Promise<Object>} A promise that resolves to an object with, cancelled, filePaths, and bookmarks properties.
 */
async function onFileDialog() {
    const { dialog } = require('electron')
    const result = await dialog.showOpenDialog({ properties: ['openFile'] })
    console.log(result)
    return result
}

/**
 * Handles the openSaveFileDialog command.
 * @async
 * @function
 * @returns {Promise<Object>} A promise that resolves to an object with, cancelled, filePaths, and bookmarks properties.
 */
async function onSaveFileDialog() {
    const { dialog } = require('electron')
    const result = await dialog.showSaveDialog({ properties: ['createDirectory', 'showOverwriteConfirmation'] })
    console.log(result)
    return result
}

/**
 * Handles the openFslStandardFileDialog command.
 * @async
 * @function
 * @returns {Promise<Object>} A promise that resolves to an object with, cancelled, filePaths, and bookmarks properties.
 */
async function onFslStandardFileDialog() {
    const { dialog } = require('electron')
    // get FSLDIR
    const fslDir = process.env.FSLDIR;
    // construct the path to the FSLDIR/data/standard directory
    const standardDir = path.join(fslDir, 'data', 'standard');
    // open the dialog starting in the standard directory
    const result = await dialog.showOpenDialog({ defaultPath: standardDir, properties: ['openFile'] })
    console.log(result)
    return result
}

const events = {
    run: onRun,
    openFileDialog: onFileDialog,
    openSaveFileDialog: onSaveFileDialog,
    openFslStandardFileDialog: onFslStandardFileDialog,
    getCommsInfo: onGetCommsInfo,
    onMNIReference: onMNIReference
}

module.exports.events = events

