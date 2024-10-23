// Modules to control application life and create native browser window
import { app, BrowserWindow, Menu } from 'electron'
import { resolve } from 'path'
import serve from 'electron-serve'

const serveLoadURL = serve({ directory: './' })

const rootDir = resolve(__dirname, '../out')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
async function createWindow() {
	await app.whenReady()

	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 1440,
		height: 900,
		icon: `${rootDir}/logo.webp`,
		useContentSize: true,
		center: true,
		webPreferences: {
			nodeIntegration: true
		}
	})

	// Emitted when the window is closed.
	mainWindow.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	})

	// Hidden menu
	Menu.setApplicationMenu(null)

	// Load main window
	await serveLoadURL(mainWindow)

	// if (isDevelopment) {
	// 	mainWindow.loadURL('http://localhost:3000/')
	// 	mainWindow.webContents.openDevTools()
	// } else {
	await mainWindow.loadURL('app://-')
	// }
}

// Create
createWindow()

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow()
	}
})
