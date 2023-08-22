const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs')
const dialog = require('electron').dialog
const isDev = require('electron-is-dev')

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width:450,
    height:225,
    minWidth:450,
    minHeight:225,
    frame: false,
    resizable: false,

    icon: __dirname + '/icon.ico',

    backgroundColor:'#0D0D0D',
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule:true,
      contextIsolation: false,
      preload: __dirname + '/preload.js'
    }
  })

  //load the index.html from a url
  win.loadURL(isDev ? 'http://localhost:3000' : `file://${__dirname}/index.html`)

  // Open the DevTools.
  // win.webContents.openDevTools({
  //   mode:'detach'
  // });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on("minimize", () => {
  BrowserWindow.getFocusedWindow().minimize();
});

ipcMain.on("maximize", () => {
  if (BrowserWindow.getFocusedWindow().isMaximized()) {
    BrowserWindow.getFocusedWindow().restore();
  }
  else {
    BrowserWindow.getFocusedWindow().maximize();
  }
});

// ipcMain.on("unminimize", () => {
//   BrowserWindow.getFocusedWindow().restore();
// })

ipcMain.on("close", (event) => {
  BrowserWindow.getFocusedWindow().close();
});

ipcMain.on("changeWindowDim", (event) => {
  BrowserWindow.getFocusedWindow().setSize(400, 400);
  // BrowserWindow.getFocusedWindow().center();
  BrowserWindow.getFocusedWindow().setResizable(true);
  BrowserWindow.getFocusedWindow().setMinimumSize(400, 400);
});

ipcMain.on("openFile", (event) => {
  dialog.showOpenDialog({
    title: 'Open',
    defaultPath: `./slates/`,
    filters: [
      { name: '.txt', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  }).then(result => {
    if (result.canceled) {
      return;
    }

    fs.readFile(result.filePaths[0], 'utf-8', (err, data) => {
      if (err) {
        console.log(err);
      }
      event.sender.send("openFileData", {text: data, filePath: result.filePaths[0], title: result.filePaths[0].split('\\')[result.filePaths[0].split('\\').length - 1].split('.')[0], ending: result.filePaths[0].split('\\')[result.filePaths[0].split('\\').length - 1].split('.')[1]});
    });
  }).catch(err => {
    console.log(err);
  });
})

ipcMain.on("save", (event, {title, ending, text, path}) => {

  if (path) {
    fs.writeFile(path, text, (err) => {
      if (err) {
        console.log(err);
      }
    });

    event.sender.send("savePath", path);

    return;
  }

  dialog.showSaveDialog({
    title: 'Save',
    defaultPath: `./slates/` + title + ending,
    filters: [
      { name: '.txt', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  }).then(result => {
    if (result.canceled) {
      return;
    }
    fs.writeFile(result.filePath, text, (err) => {
      if (err) {
        console.log(err);
      }
    });

    event.sender.send("savePath", result.filePath);

  }).catch(err => {
    console.log(err);
  });
});

// depr save func
  // //if dir dont exist
  // if (!fs.existsSync(`./slates/`)) {
  //   fs.mkdir(`./slates/`, (err) => {
  //     if (err) {
  //       console.log(err);
  //     }
  //   });
  // }

  // //if dir dont exist
  // if (!fs.existsSync(`./slates/${title}`)) {
  //   fs.mkdir(`./slates/${title}`, (err) => {
  //     if (err) {
  //       console.log(err);
  //     }
  //   });
  // }

  // // if doc exists rename it to .bak
  // if (fs.existsSync(`./slates/${title}/SAVE${ending}`)) {
  //   fs.renameSync(`./slates/${title}/SAVE${ending}`, `./slates/${title}/SAVE${ending}.bak`, (err) => {
  //     if (err) {
  //       console.log(err);
  //     }
  //   });
  // }

  // fs.writeFile(`./slates/${title}/SAVE${ending}`, text, (err) => {
  //   if (err) {
  //     console.log(err);
  //   }
  // });