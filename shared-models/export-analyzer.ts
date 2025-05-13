import * as ts from 'typescript';
import { Modifier } from 'typescript';

export interface ExportInfo {
  filePath: string;
  namedValueExports: string[];
  namedTypeExports: string[];
  defaultExport: boolean;
  namespaceExport: boolean;
  exportAll: boolean;
}

export class ExportAnalyzer {
  private program: ts.Program;

  constructor(rootFiles: string[], options: ts.CompilerOptions = {}) {
    this.program = ts.createProgram(rootFiles, options);
  }

  analyzeFile(filePath: string): ExportInfo {
    const sourceFile = this.program.getSourceFile(filePath);
    if (!sourceFile) throw new Error(`无法解析文件: ${filePath}`);

    const result: ExportInfo = {
      filePath,
      namedValueExports: [],
      namedTypeExports: [],
      defaultExport: false,
      namespaceExport: false,
      exportAll: false,
    };

    const addExport = (name: string, isType = false): void => {
      const list = isType ? result.namedTypeExports : result.namedValueExports;
      if (!list.includes(name)) list.push(name);
    };

    ts.forEachChild(sourceFile, (node: ts.Node) => {
      if (ts.isExportAssignment(node)) {
        if (node.isExportEquals) {
          result.namespaceExport = true;
        } else {
          result.defaultExport = true;
        }
      } else if (ts.isExportDeclaration(node)) {
        if (!node.exportClause && node.moduleSpecifier) {
          result.exportAll = true;
        } else if (node.exportClause && ts.isNamedExports(node.exportClause)) {
          node.exportClause.elements.forEach((e: ts.ExportSpecifier) => {
            addExport(e.name.text);
            if (e.propertyName) addExport(e.propertyName.text);
          });
        }
        // @ts-expect-error
      } else if (node.modifiers?.some((m: Modifier) => m.kind === ts.SyntaxKind.ExportKeyword)) {
        // @ts-expect-error
        const isDefault = node.modifiers.some((m: Modifier) => m.kind === ts.SyntaxKind.DefaultKeyword);
        if (isDefault) {
          result.defaultExport = true;
          // @ts-expect-error
          if ('name' in node && node.name) addExport(node.name.text);
        } else {
          if (ts.isVariableStatement(node)) {
            node.declarationList.declarations.forEach((d: ts.VariableDeclaration) => {
              if (ts.isIdentifier(d.name)) addExport(d.name.text);
            });
          } else if (
            (ts.isFunctionDeclaration(node) ||
              ts.isClassDeclaration(node) ||
              ts.isEnumDeclaration(node)) &&
            node.name
          ) {
            addExport(node.name.text);
          } else if (
            (ts.isTypeAliasDeclaration(node) ||
              ts.isInterfaceDeclaration(node)) &&
            node.name
          ) {
            addExport(node.name.text, true);
          } else if (ts.isModuleDeclaration(node) && node.name) {
            result.namespaceExport = true;
            if (ts.isIdentifier(node.name)) addExport(node.name.text);
          }
        }
      }
    });

    return result;
  }
}
