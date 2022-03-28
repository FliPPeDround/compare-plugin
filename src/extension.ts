import { DecorationNumber } from './DecorationNumber';
import type {ExtensionContext} from 'vscode';
import {commands} from 'vscode';
export function activate(context: ExtensionContext) {
  // 实例化放类
  const decorationNumber = new DecorationNumber();

  // 当执行 'extension.decorationNumber' 命令时，掉用类中的方法
	context.subscriptions.push(decorationNumber);
}

