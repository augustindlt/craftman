# Craftsman

![Craftsman](img/craftsman.png)

## What is craftsman ?

Craftsman is CLI tool that helps you to simplify the process of creating code files by using templates.
It's a simple way to make conventions on how a file must look like.

## Installation

```bash
# Install craftsman
npm i -g @augustindlt/craftsman
```

### Config

Create a config file inside your project : `.craftsman/config.json`

Config parameters :

| parameter | type       | meaning                                                                   |
| --------- | ---------- | ------------------------------------------------------------------------- |
| templates | Template[] | List of all templates                                                     |
| helpers   | Helpers    | Set of functions that you can use inside the config and in your templates |

**Template :**

| parameter | type      | meaning                                                       |
| --------- | --------- | ------------------------------------------------------------- |
| type      | string    | Name of the template                                          |
| files     | File[]    | List of all the files to generate                             |
| path      | string    | Optional parameter to declare where the files will be created |
| variables | Variables | Set of variables you need to create the files                 |

**File :**

| parameter           | type                   | meaning                                                                                                                                        |
| ------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| path                | string                 | Destination of the generated file                                                                                                              |
| name                | string                 | Name of the generated file                                                                                                                     |
| template            | string                 | File name without extension which contains the template                                                                                        |
| replaceExistingFile | "yes" \| "no" \| "ask" | Determines if the cli should replace the file or not if it already exists, by default this parameter by default this parameter is set to "ask" |

**Variables :**

The variables have all this base config :

```json
{
  "templates": [
    {
      ...
      "variables": {
        "salutation": {...},
        "nameOfMyVariable": { // The name of the variable that you want to set
          "type": "text", // The type of question you want the cli ask you, it can be "text", "choices", "autocomplete", "file", "directory", "array"
          "message": "What value are you going to set to nameOfMyVariable ?", // The message that will be print, it's an optional parameter
          "condition": "salutation.toLowerCase() === 'hello' && 1 === 1" // A JS condition which will determine whether the cli will ask or not for this variable, if not the default value of variable will be "", it's an optional parameter

          // Here the other parameters depending on the type of the variable
        }
      }
    }
  ]
}
```

`choices` and `autocomplete` :

```json
{
  ...
  "variables": {
    "nameOfMyVariable": {
      "type": "choices",
      "choices": ["yes", "no", "may be"] // Array of string that represent all the choices you can select
    }
  }
}
```

`file` and `directory` :

```json
{
  ...
  "variables": {
    "component": {
      "type": "file",
      "matchString": ".component.tsx", // Filter files to show only those that contains this string in their path, it's an optional parameter
      "matchRegex": "\\.component\\.tsx$", // Same as the matchString but with a regex, it's an optional parameter
      "path": "./src" // Base path where is the file you want to select, the file can be inside of a sub folder, by default this parameter is set to "."
    }
  }
}
```

`array` :

```json
{
  ...
  "variables": {
    "nameOfMyVariable": {
      "type": "array"
    }
  }
}
```

With the config below by default the cli will ask for text questions and will set nameOfMyVariable to an simple array of string like: `["hello", "hey" ...]`

```json
{
  ...
  "variables": {
    "nameOfMyVariable": {
      "type": "array",
      "variables": {
        "name": {
          "type": "text"
        },
        "wantACofee": {
          "type": "choices",
          "choices": ["yes", "no", "may be"]
        },
        "typeOfCofee": {
          "type": "autocomplete",
          "choices": ["Cappuccino", "Espresso", "Mochaccino", "Macchiato"],
          "condition": "wantACofee !== 'no'"
        }
      }
    }
  }
}
```

The config below will set nameOfMyVariable to an array of object with sub variables like: `[{ name: "Jhon", wantACofee: "yes", typeOfCofee: "Cappuccino"}, { name: "Mary", wantACofee: "no", typeOfCofee: ""}]`

**Helpers :**

Helpers are custom functions written in javascript, which can be used in your templates and configuration, here is an example of a helper declaration :

```json
{
  "templates": [...],
  "helpers": {
    "skewer": "helpers/skewer" // The declaration of a helper takes his name as a key and his path without the extension as value
  }
}
```

`.craftsman/helpers/skewer.js` :

```javascript
module.exports = value => Array.from(value).join("-");
```

Now we can use it :

```json
{
  ...
  "condition": "skewer(nameOfMyVariable) === 'h-e-l-l-o'"
}
```

### Template

Create a template file inside your project : `.craftsman/nameOfMyTemplate.craft`

Put inside this file the code you want to generate.

The cli use [EJS](https://ejs.co/) as templating language, you can use all the variables of your template and all your helpers inside of the templates files, like :

`.craftsman/nameOfMyTemplate.craft` :

```
console.log(<%=skewer(nameOfMyVariable)>);
```

## Usage

Inside your terminal :

```bash
cd path/to/your/project
craft
```

## Example

**Config :**

`.craftsman/config.json` :

```json
{
  "templates": [
    {
      "type": "Hello",
      "files": [
        {
          "path": "./src/<%=fileName%>",
          "name": "<%=fileName%>.js",
          "template": "hello"
        }
      ],
      "variables": {
        "fileName": { "type": "text" },
        "salutation": { "type": "choices", "choices": ["Hey", "Hello"] },
        "name": { "type": "text" }
      }
    }
  ]
}
```

`.craftsman/hello.craft` :

```
console.log("<%=salutation%> <%=name%>");
```

**Usage :**

Inside the terminal :

```bash
craft
```

Enters all variables that we defined in the config :

![select_type](img/select_type.png)
![enter_filename](img/enter_filename.png)
![enter_salutation](img/enter_salutation.png)
![enter_name](img/enter_name.png)

After is done ! :

![done](img/done.png)

We can see the result :

![vscode_result](img/vscode_result.png)
