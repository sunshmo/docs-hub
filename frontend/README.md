# docs-hub-frontend

**Note** If you want to use plate-ui, you need to add the following configuration to `components.json`. However, if you want to continue using `shadcn`, you must delete these configurations.

`components.json`
```json
{
  "registries": {
    "plate": {
      "style": "default",
      "aliases": {
        "ui": "@/components/plate-ui"
      },
      "url": "https://platejs.org/r"
    }
  }
}
```
