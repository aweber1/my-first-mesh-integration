# Uniform Mesh + Initech integration

This is a sample integration with a fictitious service named Initech (https://en.wikipedia.org/wiki/Office_Space).

Full tutorial for creating and configuring this integration is here: https://www.notion.so/uniformdev/1-Create-your-first-Mesh-integration-ae91789172e04275a0f8b3c102be4c3c

## Location configuration in Uniform

Add an external integration in the Uniform dashboard and use the following for the `Location Configuration` field:
```
{
  "locations": {
    "canvas": {
      "parameterTypes": [
        {
          "type": "initech-meme",
          "editorUrl": "/initech-meme-parameter-editor",
          "displayName": "Initech Meme Generator",
          "configureUrl": "/initech-meme-parameter-config"
        },
        {
          "type": "initech-cms",
          "editorUrl": "/initech-cms-parameter-editor",
          "displayName": "Initech CMS",
          "configureUrl": "/initech-cms-parameter-config"
        }
      ]
    },
    "install": {
      "description": [
        "Initech + Uniform Mesh will never give you a case of the Mondays!"
      ]
    },
    "settings": {
      "url": "/settings"
    }
  },
  "baseLocationUrl": "http://localhost:3000"
}
```
