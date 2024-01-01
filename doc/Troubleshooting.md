# Troubleshooting

As a common rule, try this steps when testing out roBrowser:

* It's recommended to run the roBrowser client on a newly/non-used browser to test it;
* While testing it, keep the Devtools from your browser open and check the option **Disable Cache**.
  * If not using the devtools all the time, be sure to refresh the page with the browser option to ignore the cache
    * Chrome: Shift+F5 on Win/Linux, Command+Shift+r on OS X;
    * Microsoft Edge: Ctrl+Shift+r on Win/Linux, Command+Shift+r on OS X;
* Disable the debug mode from the Remote Client API when not testing it directly from your browser;

## RO Browser client

TODO: Focus here on specific client errors (JS errors, possible glitches).

### The screen is weird and/or the developer console (F12) says it can't load game assets:
Your remote client is not configured properly:
  - Check the `client/configs.php` and make sure `DEBUG` is set to false.
  - Check the `client/.htaccess` file if the ErrorDocument option points to the `client/index.php` via the correct url. If you don't run roBrowser from the www root and you use remote client then you need to adjust this url (see examples in the file).
  - If it is still not working you can try setting `DEBUG` to true and open the `http://localhost:8000/client/index.php` in your browser to see the debug trace. You can also call files directly from your game data to see if they load properly, eg: `http://localhost:8000/client/data/texture/black.bmp`. After debugging set `DEBUG` to false.

### Screen is blank
Check that you don't have an extension using [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/message_event), it will conflict with code in `api.html` which listen for message.

### AI%5cConst.js (404 not found)
![](./img/start-ai-error.png)

Probably there is an error with the AI/ files set up. Check this [Getting Started section](./GettingStarted.md#preparing-the-dependencies)

### Wrong Response Status - 403 Not Found, 403 Forbidden 

You probably have a server security issue if your server is public. Check your certificates and make sure you configured everything to run securely, you provided the required configuration values in `https`/`wss` and that the main page of roBrowser is also opened with `https`. Redirecting every `http` call to `https` on the webserver is also probably a good idea.

## Remote Client API

TODO: Remote Client API specific errors
