# lesionPrep

# Important notes
TBD

# Development

## Prerequisites
- Node.js (preferably the latest LTS version)
- NPM
- FSL (preferably the latest version. only necessary for image processing)

## Working in dev mode

To run the desktop app in dev mode, follow these steps:

1. `npm install`
2. `cd frontend`
3. `npm install`
4. `cd ..`
6. `npm run dev # uses concurrently to run the frontend dev server and electron app at the same time`

## front-end
1. `npm run dev`

## Building the desktop app

The desktop app is built and bundled for distribution using electron-forge. To build the app, run `npm run make`. This will create a distributable version of the app in the `out` directory.

To build for specific platforms you can use the individual scripts:
- `npm run makeMacArm64 # for Apple Silicon`
- `npm run makeMacX64 # for Intel Macs`
- `npm run makeLinuxX64 # for Linux non-ARM`

## testing
TBD
