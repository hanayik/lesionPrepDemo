import React from 'react'
// get the electron exposed functions from the window object
// in this case we defined a namespace called LESPREP
// if LESPREP is none or undefined, then the electron preload.js file was not loaded
const { LESPREP } = window

// this is your main app. You can create smaller app "components" in new files and import them if you want.
// You could also just define all app components and logic in this file.
function App() {

  // example of how to call a function from the backend (electron)
  // LESPREP.openFileDialog() returns a promise, so we can use async/await
  // and it was exposed in the preload.js file
  async function handleClickMe() {
    console.log('clicked')
    let result = await LESPREP.openFileDialog()
    console.log(result)
  }
  return (
      <div>
        lesionPrep
        {/* clicking the button will open a file chooser dialog as an example */}
        <button onClick={handleClickMe}>Click Me</button>
      </div>
  )
}

export default App
