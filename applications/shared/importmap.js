// applications/shared/importmap.js  
(function () {  
    window.createROImportMap = function (projectRoot) {  
        return {  
            imports: {  
                jquery:         projectRoot + 'src/Vendors/jquery-1.9.1.js',  
                bson:           projectRoot + 'node_modules/bson/lib/bson.mjs',  
                lodash:         projectRoot + 'node_modules/lodash-es/lodash.default.js',  
                'src/':         projectRoot + 'src/',  
                'App/':         projectRoot + 'src/App/',  
                'Audio/':       projectRoot + 'src/Audio/',  
                'Controls/':    projectRoot + 'src/Controls/',  
                'Core/':        projectRoot + 'src/Core/',  
                'DB/':          projectRoot + 'src/DB/',  
                'Engine/':      projectRoot + 'src/Engine/',  
                'Loaders/':     projectRoot + 'src/Loaders/',  
                'Network/':     projectRoot + 'src/Network/',  
                'Plugins/':     projectRoot + 'src/Plugins/',  
                'Preferences/': projectRoot + 'src/Preferences/',  
                'Renderer/':    projectRoot + 'src/Renderer/',  
                'UI/':          projectRoot + 'src/UI/',  
                'Utils/':       projectRoot + 'src/Utils/',  
                'Vendors/':     projectRoot + 'src/Vendors/'  
            }  
        };  
    };  
})();