'use strict';
const encoding = require('encoding-japanese');
const inputElement = document.getElementById('input');
const outputElement = document.getElementById('output');
const reader = new FileReader();
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
let file = undefined;
let codeArray = undefined;
window.URL = window.URL || window.webkitURL;

/**
 * [ファイル読込処理]
 */
let input = () => {
  file = inputElement.files[0];

  if (!file || (types.indexOf(file.type) < 0)) {
    return;
  }

  reader.onerror = onerrorHandler;
  reader.onload = onloadHandler;
  reader.readAsArrayBuffer(file);
};

/**
 * [ファイル読込失敗処理]
 * @param  {Object} evt [エラーイベント]
 */
let onerrorHandler = (evt) => {
  let err = evt.target.error;
  if (err.code && err.code === err.NOT_FOUND_ERR) {
    console.log('ファイルが見つかりませんでした。');
  }
  else if (err.code && err.code === err.SECURITY_ERR) {
    console.log('セキュリティのためファイルにアクセス出来ませんでした。');
  }
  else if (err.code && err.code === err.NOT_READABLE_ERR) {
    console.log('ファイルが読み込めませんでした。');
  }
  else if (err.code && err.code === err.ABORT_ERR) {
    console.log('ファイルの読み込みがキャンセルされました。');
  }
  else {
    console.log('ファイルの読み取りエラーが発生しました。');
  }
};

/**
 * [ファイル読込成功処理]
 */
let onloadHandler = () => {
  // 8ビット符号なし整数値の配列に変換
  let uint8Array = new Uint8Array(reader.result);

  // 文字コードを判定
  let detected = encoding.detect(uint8Array);

  // 判定した文字コードからSJISへ変換
  codeArray = encoding.convert(uint8Array, {
    from: detected,
    to: 'SJIS'
  });
};

/**
 * [ファイルダウンロード処理]
 */
let output = () => {
  // 8ビット符号なし整数値の配列に変換
  let uint8Array = new Uint8Array(codeArray);

  // blob作成
  let blob = new Blob([uint8Array], {type: file.type});

  // ダウンロード
  let url = window.URL.createObjectURL(blob);
  let a = document.createElement('a');
  document.body.appendChild(a);
  a.href = url;
  a.download = 'output.csv';
  a.click();
};

inputElement.addEventListener('change', input);
outputElement.addEventListener('click', output);
