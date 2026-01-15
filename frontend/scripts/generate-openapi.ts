import { Project } from "ts-morph";
import path from "path";
import fs from "fs";

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const apiDir = path.join(__dirname, "src/app/api");


const openapi: any = {
  openapi: "3.0.0",
  info: {
    title: "Panganku Fresh Generated API Docs",
    version: "1.0.0",
  },
  paths: {},
};

function addPath(pathName: string, method: string) {
  if (!openapi.paths[pathName]) openapi.paths[pathName] = {};
  openapi.paths[pathName][method.toLowerCase()] = {
    summary: `Auto generated for ${method} ${pathName}`,
    responses: {
      "200": {
        description: "Success",
      },
    },
  };
}

project.addSourceFilesAtPaths(`${apiDir}/**/*.ts`);

project.getSourceFiles().forEach((file) => {
  const filePath = file.getFilePath();
  const relativePath = filePath
    .split("/api/")[1]
    ?.replace(/\/route\.ts$/, "")
    .replace(/\[([^\]]+)\]/g, "{$1}");

  if (!relativePath) {
    console.warn("⚠️ Skip file:", filePath);
    return;
  }

  const exportedFunctions = file.getFunctions();
  exportedFunctions.forEach((fn) => {
    const name = fn.getName();
    if (name && ["GET", "POST", "PUT", "DELETE", "PATCH"].includes(name)) {
      addPath(`/${relativePath}`, name);
    }
  });
});

// Simpan jadi openapi.json
fs.writeFileSync("public/openapi.json", JSON.stringify(openapi, null, 2));
console.log("✅ Generated openapi.json");
