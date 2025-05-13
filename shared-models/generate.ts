import { readdirSync, writeFileSync } from 'node:fs';
import { join, relative, basename, extname } from 'path';
import * as ts from 'typescript';
import { ExportAnalyzer } from './export-analyzer';

function generateIndex() {
  const config = {
    srcDir: join(__dirname, 'src'),
    outputFile: join(__dirname, 'src', 'index.ts'),
    exclude: ['index.ts'],
    extensions: ['.ts', '.tsx']
  };

  const getAllFiles = (dir: string): string[] => {
    const entries = readdirSync(dir, { withFileTypes: true });
    return entries.flatMap(entry => {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) return getAllFiles(fullPath);
      if (config.extensions.some(ext => entry.name.endsWith(ext)) && !config.exclude.includes(entry.name)) {
        return [fullPath];
      }
      return [];
    });
  };

  const files = getAllFiles(config.srcDir);
  const analyzer = new ExportAnalyzer(files, {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext
  });

  const results = files.map(file => analyzer.analyzeFile(file));

  let content = '// 自动生成的文件 - 请勿手动编辑\n\n';

  results.forEach(({ filePath, namedValueExports, namedTypeExports, defaultExport, namespaceExport, exportAll }) => {
    const relativePath = './' + relative(config.srcDir, filePath).replace(/\\/g, '/').replace(/\.(ts|tsx)$/, '');
    if (exportAll) {
      content += `export * from '${relativePath}';\n`;
    }
    if (namedValueExports.length) {
      content += `export { ${namedValueExports.join(', ')} } from '${relativePath}';\n`;
    }
    if (namedTypeExports.length) {
      content += `export type { ${namedTypeExports.join(', ')} } from '${relativePath}';\n`;
    }
    if (defaultExport) {
      content += `export { default } from '${relativePath}';\n`;
    }
    if (namespaceExport) {
      const name = basename(filePath, extname(filePath));
      content += `import * as ${name} from '${relativePath}';\n`;
      content += `export { ${name} };\n`;
    }
  });

  writeFileSync(config.outputFile, content);
  console.log(`成功生成 ${config.outputFile}`);
}

generateIndex();
