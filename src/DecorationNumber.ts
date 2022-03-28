import { window, DecorationOptions, Range, workspace, TextEditor, DecorationRangeBehavior} from 'vscode';
import {transformAsync} from '@babel/core';
import {isBinaryExpression, logicalExpression, binaryExpression, isLogicalExpression} from '@babel/types';

const bigNumDecoration = window.createTextEditorDecorationType ({
  textDecoration: 'none; border-bottom: 1px dashed currentColor',
  rangeBehavior: DecorationRangeBehavior.ClosedClosed,
});

export class DecorationNumber {

  // 获取当前活动编辑器
  private editor: TextEditor | undefined;

  constructor() {
    this.editor = window.activeTextEditor;
  
    window.onDidChangeActiveTextEditor(editor => {
      // 当编辑器切换面板时，editor 就变成了 undefined，所以要重新设置
      this.editor = window.activeTextEditor;
      if(editor) { this.DecNumber(); }
    });
  
    workspace.onDidChangeTextDocument(event => {
        if (this.editor && event.document === this.editor.document) {
          this.DecNumber();
        }
    });
  }

  public DecNumber() {

    // 这个判断条件的代码很重要，如果删除下面的代码会报错，请小伙伴们一定要做该判断
    if(!this.editor) { return; }

    // 获取当前文档的全部信息
    let doc = this.editor.document;

    // 获取文档中的全部内容
    let text = doc.getText();

    let bigNumbers: DecorationOptions[] = [];

    const binaryVisitor = {
      BinaryExpression(path:any) {
        const node = path.node;
        const operatorList = ['<','>','<=','>='];
        if (isBinaryExpression(node.left) && operatorList.indexOf(node.operator) !== -1) {
          const startPos = doc.positionAt(node.start);
          const endPos = doc.positionAt(node.end);
          console.log(node.start, node.end);
          const decoration = {
            range: new Range(startPos, endPos), 
            hoverMessage: '===========',
          };
          bigNumbers.push(decoration as any);
          // const right = binaryExpression(node.operator, node.left.right, node.right);
          // path.replaceWith(logicalExpression('&&',node.left, right));
        }
      }
    };

    async function thenTansform (code: string) {
      return (await transformAsync(code, {
        plugins:[
          {visitor: binaryVisitor}
        ]
      }))?.code;
    }
    thenTansform(text);
    // const decoration = {
    //   range: new Range(startPos!, endPos!), 
    //   hoverMessage: thenTansform(text),
    // };

    // bigNumbers.push(decoration as any);
    // const regEx = /\d+/g;

    // let match;
    // console.log(regEx.exec(text));
    
    // while(match = regEx.exec(text)) {
    //   // 获取数字开始和结束的位置
    //   const startPos = doc.positionAt(match.index);
    //   const endPos = doc.positionAt(match.index + match[0].length);
  
    //   // 下面有截图 主要是获取数字的位置范围，并且当鼠标覆盖时，有我们想要的文字展示
    //   const decoration = {
    //     range: new Range(startPos, endPos),
    //     hoverMessage: 'Number **' + match[0] + '**',
    //   };

    //   // 根据不同的长度分别存入不同的数组中
    //   if(match[0].length < 3) {
    //     smallNumbers.push(decoration);
    //   } else {
    //     bigNumbers.push(decoration);
    //   }
    // }

    // 下方有截图，将一组装饰添加到文本编辑器
    this.editor.setDecorations(bigNumDecoration, bigNumbers);
  }

  dispose() {}
}
