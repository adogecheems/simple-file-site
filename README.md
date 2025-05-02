# Simple File Site

如你所见，**Simple File Site** 是一个非常简单的静态站点生成器，旨在快速生成文件列表站点，并部署到类似Vercel的静态网页托管服务。

## 功能

- 自动生成文件列表页面
- 支持自定义模板（基于 EJS）
- 轻量级，易于使用

## 安装与使用

确保您已安装 [Node.js](https://nodejs.org/) 和 npm。

### 手动安装与使用

1. 克隆项目：

   ```bash
   git clone https://github.com/adogecheems/simple-file-site.git
   cd simple-file-site
   ```

2. 安装依赖：

   ```bash
   npm install
   ```

3. 运行：

   ```bash
   node index.js <source_directory> <target_directory>
   ```
   - 如果未指定参数，默认源目录为 `source`，目标目录为 `public`。

### 通过 npm 安装使用

1.安装命令：

   ```bash
   npm install -g simple-file-site
   ```

2.运行：

   ```bash
   simple-file-site <source_directory> <target_directory>
   ```
   - 如果未指定参数，默认源目录为 `source`，目标目录为 `public`。

## 关于跨域资源限制
静态站点托管服务（如 Vercel）可能会限制跨域资源访问。本项目已经内置了netlify.toml与vercel.json配置文件，添加了cors标头。但如果您使用了其他的静态站点托管服务，您可能需要设法添加标头。项目根目录中有一个_headers文件，您可以将其复制到source/中进行生成，可能对一些其他平台有帮助（cloudflare pages可用）。

## 依赖

- [EJS](https://ejs.co/)：用于模板渲染
- [fs-extra](https://github.com/jprichardson/node-fs-extra)：用于文件操作

## 许可证

本项目基于 [GPL-3.0-only](https://opensource.org/licenses/GPL-3.0) 许可证。