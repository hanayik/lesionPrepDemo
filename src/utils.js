const path = require('path');
const fs = require('fs/promises');
const os = require('os');


/**
 * creates a command string from a command object
 * @function
 * @param {object} command - The command object.
 * @param {string} command.command - The command to run.
 * @param {object} command.opts - The options to use when running the command.
 * @returns {string} The command string.
 * @example
 * const command = {
 *   command: 'bet',
 *  opts: {
 *    input: 'test.nii.gz',
 *   output: 'test_brain.nii.gz',
 * },
 * };
 * const commandString = createCommandString(command);
 */
module.exports.createCommandString = function ({command, opts}) {
    // initialize the command string with the command
    let commandString = command;
    // loop through the options and add them to the command string
    for (const [key, value] of Object.entries(opts)) {
        // if the value is null, skip it
        if (value === null) {
            continue;
        // if the value is true, add only the key (option flag) to the command string
        } else if (value === true) {
            commandString += ` ${key}`;
        // if the value is false, skip it
        } else if (value === false) {
            continue;
        // if the value is a string, add the key (option flag) and the value to the command string
        } else {
            if (key[0] !== '-') {
                commandString += ` ${value}`
            } else {
                commandString += ` ${key} ${value}`;
            }
        }
    }
    return commandString;
}

/**
 * saves a command object as a json file in ~/.fslgui/history using the format YYYY-MM-DD_HH-MM-SS-MS_${command}.json
 * @async
 * @function
 * @param {object} commandObject - The command object.
 * @param {string} commandObject.command - The command to run.
 * @param {object} commandObject.opts - The options to use when running the command.
 * @returns {Promise<string>} A promise that resolves to the path of the saved file.
 * @example
 * const commandObject = {
 *  command: 'bet',
 * opts: {
 *   input: 'test.nii.gz',
 * output: 'test_brain.nii.gz',
 * },
 * };
 * const filePath = await saveCommand(commandObject);
 * console.log(filePath);
 * // ~/.fslgui/history/2021-5-5_12-0-0-0_bet.json
 */
module.exports.saveCommand = async function (commandObject){
    // save the command object as a json file in ~/.fslgui/history
    // name the file with the current date and time down to the millisecond
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // months are zero indexed
    const day = date.getDate() ; // days are one indexed. why? wtf js?
    const hour = date.getHours();
    const minute = date.getMinutes();
    const seconds = date.getSeconds();
    const milliseconds = date.getMilliseconds();
    // stringify the command object
    // add the date to the command object for later use
    commandObject.date = date;
    const commandString = JSON.stringify(commandObject);
    // create the file name in the format YYYY-MM-DD_HH-MM-SS-MS_${command}.json
    const fileName = `${year}-${month}-${day}_${hour}-${minute}-${seconds}-${milliseconds}_${commandObject.command}.json`;
    // create the history directory if it doesn't exist
    const historyPath = path.join(os.homedir(), '.fslgui', '.guihistory');
    await fs.mkdir(historyPath, {recursive: true});
    // create the file path
    const filePath = path.join(historyPath, fileName);
    // write the file
    await fs.writeFile(filePath, commandString).catch((err) => {
        console.log(err);
    }
    );
    return filePath;
}
