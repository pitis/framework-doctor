import fs from "node:fs";

export const readJson = <T>(filePath: string): T => {
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as T;
};
