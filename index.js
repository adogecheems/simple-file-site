#!/usr/bin/env node

import fs from "fs-extra";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class FileIndexGenerator {
    static getFileIcon(filename, isDirectory) {
        if (isDirectory) return "📁";
        return filename.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? "🖼️" : "📄";
    }

    static getFileSize(size) {
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
        if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
        return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }

    static async processEntry(entryPath, entry) {
        const stats = await fs.stat(entryPath);
        const isDirectory = stats.isDirectory();

        const size = isDirectory ? "-" : FileIndexGenerator.getFileSize(stats.size);
        const icon = FileIndexGenerator.getFileIcon(entry, isDirectory);

        return {
            name: entry,
            icon,
            size,
            isDirectory,
        };
    }

    constructor(fromDir = "source", toDir = "public") {
        this.fromDir = fromDir;
        this.toDir = toDir;

        this.config = {
            footerLink: {
                text: "GitHub",
                url: "https://github.com/adogecheems/simple-file-site",
            },
        };
    }

    async initialize() {
        try {
            await fs.remove(this.toDir);
            await fs.copy(this.fromDir, this.toDir);

        } catch (error) {
            throw new Error(`初始化目录失败: ${error.message}`);
        }
    }

    async generateHtml(dir) {
        try {
            const entries = await fs.readdir(dir);
            const items = { folders: [], files: [] };

            if (dir !== this.toDir) {
                items.folders.push({
                    name: "..",
                    icon: "📁",
                    size: "-",
                    isDirectory: true,
                });
            }

            for (const entry of entries) {
                const entryPath = path.resolve(dir, entry);
                const item = await FileIndexGenerator.processEntry(entryPath, entry);
                items[item.isDirectory ? "folders" : "files"].push(item);
            }

            const templatePath = path.resolve(__dirname, "template", "index.ejs");
            const template = await fs.readFile(templatePath, "utf-8");
            const objs = [...items.folders, ...items.files];
            const content = ejs.render(template, { objs, dir, config: this.config });

            await fs.writeFile(path.resolve(dir, "index.html"), content);

            console.log(`✅ 生成索引页面: ${dir}`);

        } catch (error) {
            throw new Error(`生成索引页面失败: ${error.message}`);
        }
    }

    async processDir(dir) {
        try {
            const entries = await fs.readdir(dir);

            await Promise.all(
                entries.map(async (entry) => {
                    const entryPath = path.join(dir, entry);
                    const stats = await fs.stat(entryPath);
                    if (stats.isDirectory()) {
                        await this.processDir(entryPath);
                    }
                })
            );

            await this.generateHtml(dir);

        } catch (error) {
            console.error(`❌ 处理目录失败 ${dir}:`, error);
        }
    }

    async generate() {
        try {
            await this.initialize();
            await this.processDir(this.toDir);

            console.log("✨ 所有索引页面生成完成");

        } catch (error) {
            console.error(`❌ 生成索引页面失败: ${error.message}`);
        }
    }
}

const [fromDir, toDir] = process.argv.slice(2);
const generator = new FileIndexGenerator(fromDir, toDir);
await generator.generate();

(async () => {
    try {
        await fs.copy(path.resolve(__dirname, "_headers"),
            path.resolve(generator.toDir, "_headers"),
            { overwrite: true }
        );

        if (!await fs.exists(path.join(__dirname, generator.toDir))) {
            await fs.copy(
                path.resolve(__dirname, "netlify.toml"),
                path.resolve(generator.toDir, "..", "netlify.toml"),
                { overwrite: false }
            );

            await fs.copy(
                path.resolve(__dirname, "vercel.json"),
                path.resolve(generator.toDir, "..", "vercel.json"),
                { overwrite: false }
            );
        }

    } catch (error) {
        console.error(`❌ 后处理失败: ${error.message}`);
    }
})();