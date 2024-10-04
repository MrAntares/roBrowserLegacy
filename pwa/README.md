# Progressive Web App

roBrowser can be setup as a [progressive web app](https://web.dev/articles/what-are-pwas).

## Setup Application Files

1. Build roBrowser compiled version `npm run build:all:minify`, wait to complete.

  * must have installed deps first (`npm install`) before running build script.

2. Copy generated files from `dist/Web/` folder to `pwa/application` folder

  * note: only files `Online.js`, `ThreadEventHandler.js`, `index.html` and folder `src` will be used

## Configure Client

1. Open and modify `index.html` to configure your client, can refer to http://www.robrowser.com/getting-started#API

2. Insert this code on your `index.html` anywhere inside the `<head>` tag
```
<link rel="manifest" href="robrowser.webmanifest">
```

example:
```
...
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <link rel="manifest" href="robrowser.webmanifest">
...
```

## Configure PWA App

Open and modify `robrowser.webmanifest` and edit according to your preference:

* `name` : The full name of your web app.

* `short_name`: Short name to be shown on the home screen.

* `description`: A sentence or two explaining what your app does.

* `icons`: Information about the app icons — source URLs, sizes, and types. Be sure to include at least a few, so that one that fits best will be chosen for the user's device.

* `start_url`: The index document to launch when starting the app.

* `display`: How the app is displayed; can be `fullscreen`, `standalone`, `minimal-ui`, or `browser`.

* `theme_color`: A primary color for the UI, used by operating system.

* `background_color`: A color used as the app's default background, used during install and on the splash screen.
