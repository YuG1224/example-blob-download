'use strict';

// Module読み込み
const encoding = require('encoding-japanese');
const browser = new (require('ua-parser-js'))().getBrowser();

// <input type="file" id="input">を指定
const inputElement = document.getElementById('input');

// <input type="button" id="output">を指定
const outputElement = document.getElementById('output');

// CSVのMIME TYPE
const types = [
  'text/csv',
  'text/comma-separated-values',
  'text/plain',
  'application/csv',
  'application/excel',
  'application/vnd.ms-excel',
  'application/vnd.msexcel',
  'text/anytext'
];

let codeArray = undefined;
window.URL = window.URL || window.webkitURL;

/**
 * [ファイル読込処理]
 */
function input() {
  const reader = new FileReader();
  const file = inputElement.files[0];

  if (!file) {
    // fileが無いときは何もしない
    return;
  } else if (!((types.includes(file.type)) && /\.csv$/.test(file.name))) {
    // csvでは無いときはアラートを表示
    alert('CSVファイルではありません。');

    return;
  } else {
    // csvの時だけファイル読み込み開始
    reader.onerror = onerrorHandler;
    reader.onload = onloadHandler;
    reader.readAsArrayBuffer(file);

    return;
  }
}

/**
 * [ファイル読込失敗処理]
 * @param  {Object} evt [イベント]
 */
function onerrorHandler(evt) {
  const err = evt.target.error;
  if (err.code && err.code === err.NOT_FOUND_ERR) {
    alert('ファイルが見つかりませんでした。');
  }
  else if (err.code && err.code === err.SECURITY_ERR) {
    alert('セキュリティのためファイルにアクセス出来ませんでした。');
  }
  else if (err.code && err.code === err.NOT_READABLE_ERR) {
    alert('ファイルが読み込めませんでした。');
  }
  else if (err.code && err.code === err.ABORT_ERR) {
    alert('ファイルの読み込みがキャンセルされました。');
  }
  else {
    alert('ファイルの読み取りエラーが発生しました。');
  }

  return;
}

/**
 * [ファイル読込成功処理]
 * @param  {Object} evt [イベント]
 */
function onloadHandler(evt) {
  // 8ビット符号なし整数値の配列に変換
  const uint8Array = new Uint8Array(evt.target.result);

  // 文字コードを判定
  const detected = encoding.detect(uint8Array);

  // 判定した文字コードからSJISへ変換
  codeArray = encoding.convert(uint8Array, {
    from: detected,
    to: 'SJIS'
  });

  // codeToStringで文字列にすることも可能
  // const str = encoding.codeToString(codeArray);

  return;
}

/**
 * [ファイルダウンロード処理]
 */
function output() {
  // 8ビット符号なし整数値の配列に変換
  const uint8Array = new Uint8Array(codeArray);
  // MIMEType指定
  const mimeType = 'text/css';
  // ファイル名指定
  const fileName = 'output.csv';
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

inputElement.addEventListener('change', input);
outputElement.addEventListener('click', output);
