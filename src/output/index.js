'use strict';

// Module読み込み
const encoding = require('encoding-japanese');
const browser = new (require('ua-parser-js'))().getBrowser();

// <input type="button" id="output">を指定
const outputElement = document.getElementById('output');

// テンプレート文字列
const templateStr = `
あ,い,う,え,お
か,き,く,け,こ
さ,し,す,せ,そ
た,ち,つ,て,と
な,に,ぬ,ね,の
`.trim();

/**
 * [ファイルダウンロード処理]
 */
function output() {
  // MIMEType指定
  const mimeType = 'text/css';
  // ファイル名指定
  const fileName = 'output.csv';
  // 文字コードをSJISへ変換
  const codeArray = encoding.convert(templateStr, {
    to: 'SJIS',
    from: encoding.detect(templateStr),
    type: 'ArrayBuffer'
  });
  // 8ビット符号なし整数値の配列に変換
  const uint8Array = new Uint8Array(codeArray);
  // blob作成
  const blob = new Blob([uint8Array], {type: mimeType});

  // ダウンロード
  if (window.navigator.msSaveBlob) {
    // IE
    window.navigator.msSaveBlob(blob, fileName);
  } else if (window.URL || window.webkitURL) {
    // Chrome Safari FireFox
    window.URL = window.URL || window.webkitURL;
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;

    // Safari < 10.1 or 10.2 の場合は _blank必須
    if (browser.name === 'Safari' && (+browser.majar < 10 || ['10.0','10.0.1','10.0.2'].includes(browser.version))) {
      a.target = '_blank';
    }

    a.click();
  } else {
    // noop
  }

  return;
}

outputElement.addEventListener('click', output);
