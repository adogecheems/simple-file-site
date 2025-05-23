#!/usr/bin/env node

import fs from "fs-extra";
import ejs from "ejs";
import path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const fromDir = args[0] || "source";
const toDir = args[1] || "public";

fs.removeSync(toDir);
fs.copySync(fromDir, toDir);

const config = {
    customHead: {
        content: "",
    },
    footerLink: {
        text: "GitHub",
        url: "https://github.com/adogecheems/simple-file-site",
    },
};

async function generateHtml(dir) {
    try {
        const entries = await fs.readdir(dir);
        const folders = [];
        const files = [];
        if (dir !== toDir) {
            folders.push({
                name: "..",
                icon: "📁",
                size: "-",
                isDirectory: true,
            });
        }

        for (const entry of entries) {
            const entryPath = path.join(dir, entry);
            const stats = await fs.stat(entryPath);
            const isDirectory = stats.isDirectory();
            const size = isDirectory ? "-" : `${(stats.size / 1024).toFixed(2)} KB`;

            const icon = isDirectory
                ? "📁"
                : entry.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                    ? "🖼️"
                    : "📄";

            const item = { name: entry, icon, size, isDirectory };
            isDirectory ? folders.push(item) : files.push(item);
        }

        const objs = [...folders, ...files];
        const templatePath = path.resolve(__dirname, "ejs", "index.ejs");
        const template = await fs.readFile(templatePath, "utf-8");
        const content = ejs.render(template, { objs, dir, config });

        await fs.writeFile(path.join(dir, "index.html"), content);
        console.log(`Generated index HTML for ${dir}`);
    } catch (err) {
        console.error(`Error generating index HTML for ${dir}:`, err);
    }
}

async function processDir(dir) {
    try {
        const entries = await fs.readdir(dir);

        for (const entry of entries) {
            const entryPath = path.join(dir, entry);
            const stats = await fs.stat(entryPath);

            if (stats.isDirectory()) {
                await processDir(entryPath);
            }
        }

        await generateHtml(dir);
    } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
    }
}

await processDir(toDir);
