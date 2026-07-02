# Code Notes

Code Notes 是一个用于在 VS Code 里给代码做高亮、写 Markdown 笔记、搜索定位并按类型导出笔记的插件。

它适合代码阅读、源码走查、重构记录、问题排查和学习笔记。

## 核心流程

```txt
选中代码
  -> 添加高亮或笔记
  -> 代码区域显示高亮
  -> 笔记显示 gutter 书签
  -> Hover 查看 Markdown
  -> 搜索或点击 Hover 链接跳转
  -> 按类型导出 Markdown
```

## 快速开始

打开一个代码文件，选中一段代码，然后使用：

- `Ctrl+Alt+N`: 添加笔记
- `Ctrl+Alt+H`: 添加纯高亮
- 右键编辑器选区: `Code Notes: Add Note` 或 `Code Notes: Add Highlight`

添加笔记时会选择类型并输入 Markdown 内容。添加纯高亮时只保存高亮范围，不要求输入文字。

支持的类型：

- `normal`
- `todo`
- `important`
- `bug`

## 高亮和笔记的区别

纯高亮：

- 只显示代码背景色
- 不显示 gutter 书签
- 适合连续标注、大量扫代码

笔记：

- 显示代码背景色
- 显示 gutter 书签
- Hover 时显示 Markdown 内容
- 可通过搜索快速跳转
- 导出时会带上笔记正文

## 连续高亮标注模式

执行命令：

```txt
Code Notes: Enter Annotation Mode
```

进入后先选择本轮标注类型，例如 `important`。之后每次选中代码，选区稳定一小段时间后会自动生成纯高亮。

退出方式：

- 执行 `Code Notes: Exit Annotation Mode`
- 点击状态栏里的 `Code Notes: Annotating (...)`

连续模式适合快速阅读代码时批量打高亮。它不会弹出笔记输入框，也不会添加 gutter 书签。

## 查看和跳转

Hover 到有笔记的代码区域，可以看到 Markdown 笔记内容。

执行：

```txt
Code Notes: Search Notes
```

可以按笔记文本、文件路径、symbol、type、状态搜索并跳转到代码位置。

## 删除高亮

选中已有高亮区域后执行：

```txt
Code Notes: Delete Highlight in Selection
```

删除只会隐藏高亮，不会删除笔记数据。对应记录会保留为 `stale`，后续可以手动迁移恢复。

## 代码变动和 stale 状态

插件不会自动猜测代码迁移位置。

当原来的代码内容发生变化时：

- 高亮会失效
- 笔记数据会保留
- 状态会变为 `stale`
- 是否迁移由用户手动决定

手动迁移方式：

1. 选中新的代码范围
2. 执行 `Code Notes: Migrate Stale Notes`
3. 选择要迁移的 stale 笔记

## 选择项目根目录

如果你有时打开父目录，有时打开子目录，建议先设置项目根目录。

执行：

```txt
Code Notes: Select Project Root
```

也可以在 Explorer 里右击文件或目录，然后选择同名命令。

插件会列出当前路径的所有上级目录，让你选择哪一级是项目根目录。选中后，笔记库会统一放在：

```txt
<projectRoot>/.vscode/code-notes.json
```

这样无论从父目录还是子目录打开项目，都能复用同一套笔记和高亮。

## 导出 Markdown

导出整个项目的笔记：

```txt
Code Notes: Export Markdown by Type
```

默认输出：

```txt
notes/
  normal.md
  todo.md
  important.md
  bug.md
```

如果只想导出某个文件或目录，在 Explorer 里右击目标文件/目录，选择：

```txt
Code Notes: Generate Notes for File/Folder
```

目录导出会输出到：

```txt
<folder>/notes/
```

文件导出会输出到：

```txt
<file-folder>/notes/<file-name>/
```

每条笔记包含：

- 文件路径
- 所属 function/class/method
- 行号
- VS Code 跳转链接
- Markdown 笔记
- 前后代码上下文

## 常用配置

```json
{
  "codeNotes.colors.normal": "rgba(255, 235, 59, 0.35)",
  "codeNotes.colors.todo": "rgba(255, 193, 7, 0.35)",
  "codeNotes.colors.important": "rgba(129, 212, 250, 0.35)",
  "codeNotes.colors.bug": "rgba(244, 67, 54, 0.25)",

  "codeNotes.hover.enable": true,

  "codeNotes.export.headLines": 3,
  "codeNotes.export.tailLines": 3,

  "codeNotes.symbol.enable": true,

  "codeNotes.storagePath": ".vscode/code-notes.json",
  "codeNotes.projectRoot": ""
}
```

说明：

- `codeNotes.colors.*`: 设置不同类型的高亮颜色
- `codeNotes.hover.enable`: 是否开启 Markdown Hover
- `codeNotes.export.headLines`: 导出时包含前几行上下文
- `codeNotes.export.tailLines`: 导出时包含后几行上下文
- `codeNotes.symbol.enable`: 是否尝试绑定 function/class/method
- `codeNotes.storagePath`: 笔记 JSON 文件路径
- `codeNotes.projectRoot`: 显式指定项目根目录

## 数据文件

笔记默认存储在：

```txt
.vscode/code-notes.json
```

这是普通 JSON 文件，可以提交到仓库，也可以加入 `.gitignore`，取决于你希望笔记是团队共享还是个人使用。

## 开发运行

```bash
npm install
npm run compile
```

然后在 VS Code 中按 F5 启动 Extension Host。
