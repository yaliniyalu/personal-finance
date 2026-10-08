import { configApp } from "@adonisjs/eslint-config";
export default configApp({
  parserOptions: {
    projectService: true,
    tsconfigRootDir: import.meta.dirname,
  },
});
