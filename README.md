# Generator-vue-components README

This extension for Visual Code It is possible with minimal actions to generate components for the Vue JS framework.
It is possible to use several templates, select or enter a name and select or enter a path to create a partner. These functions can be configured in the configuration file.

## Capabilities

Access to the extension functions is possible from the command palette (ctrl + shift + P).

The main function of the extension is the generation of components from templates. Templates can be general (global) or local, existing in a particular project and not available from others. Generation of templates is available under the item in the menu "generator-vue-components: new component".

In the extension, template management functions are implemented, as well as creating new ones and opening them for changes. These functions are available under the item in the menu "generator-vue-components: options" and the corresponding sub-items "Create a new template" and "Modify an existing template".

To save local settings for the project, you can use the local configuration file. This option is available from the menu item "generator-vue-components: options" and the sub-item "open the file config.json". If there is no file, it will be created.

## Use

To generate a Vue component file:
1. The "generator-vue-components: new component" command in the command palette (chift + cntrl + P).  
2.1. If a selection is selected from the list of templates, select the one you want. Otherwise, this step is automatically skipped.  
2.2. If a selection is selected from the list of component names, select the desired one. Otherwise, enter a name for the string.  
2.3. If you select from the following options for generating components, select the one you want. Otherwise, enter the path as a string.  
3. Done!

## Structure of config.json settings file

    {
      "lang": "en",                 // Возможны варианты "ru", "en"
      "default": {                  // Параметры по умолчанию
        "template": "component",    // Шаблон по умолчанию при вводе строкой
        "name": "view",             // Имя генерируемого компонента по умолчанию при вводе строкой
        "path": "/src/components/"  // Путь генерируемого компонента по умлочанию при вводе строкой
      },
      "lists": {                    // Парамерты списков выбора
        "template": true,           // Использовать выбор из списка существующих шаблонов (общих и локальных)
                                    // Список выбора путей для генерируемых компонентов (для ввода строкой значение null)
        "path": ["/src/components/", "/src/components/home"],
                                    // Список выбора имен для генерируемых компонентов (для ввода строкой значение null)
        "name": ["list", "view", "edit"]
      },
      "templates": {                // Внутренние переменные
        "global": [],
        "local": []
      }
    }

The source code is available on [GitHub] (https://github.com/idushii/generator-vue-components/ "https://github.com/idushii/generator-vue-components").