import dayjs from 'dayjs';
import { app, BrowserWindow, desktopCapturer, ipcMain, powerMonitor } from 'electron'
import * as fs from 'fs';
import { execFile } from 'child_process';

let mainWindow: BrowserWindow | null

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

function createWindow () {
  mainWindow = new BrowserWindow({
    // icon: path.join(assetsPath, 'assets', 'icon.png'),
    width: 1100,
    height: 700,
    backgroundColor: '#eee',
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
    }
  })

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

 

  mainWindow.on('ready-to-show', () => {
    updateFoldersState();
    mainWindow.show();
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

const createFolder = (name: string) => {
  if (!fs.existsSync(name))
  fs.mkdirSync(name)
}

const getFolders = () => {
  const allFolders = fs.readdirSync(__dirname);

  return allFolders.filter((folder) => folder.includes('electron-')).map((folder) => {
    return {
      folderName: folder,
      files: fs.readdirSync(`./${folder}/`)
    }
  })
}

const updateFoldersState = () => {
  const folders = getFolders();
  mainWindow.webContents.send('folders', folders);
}

async function registerListeners () {
  fs.appendFileSync('./electron-logs/test.txt', `App opened at ${dayjs().format('MMM DD - hh:mm A')}\n`)
  
  const teste = execFile('./out/electron/electron-starter.exe');
  console.log('teste', teste)
  ipcMain.on('createFolder', (_, folderName) => {
    console.log('folderName', folderName)

    createFolder(folderName);
    updateFoldersState();
  })

  ipcMain.on('createFile', (_, info) => {

    createFolder(info.folderName);

    fs.writeFileSync(`./${info.folderName}/${info.fileName}`, "")
    updateFoldersState();
  })

  ipcMain.on('moveFile', (_, paths: { src: string; dest: string }) => {
    console.log('paths', paths)
    fs.copyFileSync(paths.src, paths.dest);
    updateFoldersState();
  })

  ipcMain.on('capture', () => {
    desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1920, height: 1080 } }).then((sources) => {
      mainWindow.webContents.send('thumbnailUrl', sources[0].thumbnail.toDataURL())
    })
  })
  powerMonitor.addListener('on-battery', () => {
    console.log('on battery');
  })

  powerMonitor.addListener('user-did-become-active', () => {
    console.log('ligou');
  })

}

app.on('ready', createWindow)
  .whenReady()
  .then(registerListeners)
  .catch(e => console.error(e))

app.on('window-all-closed', () => {
  fs.appendFileSync('./electron-logs/test.txt', `App closed at ${dayjs().format('MMM DD - hh:mm A')}\n`)
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  ipcMain.removeAllListeners();
  mainWindow.removeAllListeners();
  mainWindow.close();
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})