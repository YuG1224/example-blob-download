'use strict';
const encoding = require('encoding-japanese');
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
let input = () => {
  let reader = new FileReader();
  let file = inputElement.files[0];

  // fileが無いときは何もしない
  if (!file) {
    return;
  }
  // csvでは無いときはアラートを表示
  else if ((types.indexOf(file.type) < 0) || /\.csv$/.test(file.name)) {
    alert('CSVファイルではありません。');
    return;
  }
  // csvの時だけファイル読み込み開始
  else {
    reader.onerror = onerrorHandler;
    reader.onload = onloadHandler;
    reader.readAsArrayBuffer(file);
  }
};

/**
 * [ファイル読込失敗処理]
 * @param  {Object} evt [イベント]
 */
let onerrorHandler = (evt) => {
  let err = evt.target.error;
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
};

/**
 * [ファイル読込成功処理]
 * @param  {Object} evt [イベント]
 */
let onloadHandler = (evt) => {
  // 8ビット符号なし整数値の配列に変換
  let uint8Array = new Uint8Array(evt.target.result);

  // 文字コードを判定
  let detected = encoding.detect(uint8Array);

  // 判定した文字コードからSJISへ変換
  codeArray = encoding.convert(uint8Array, {
    from: detected,
    to: 'SJIS'
  });

  // codeToStringで文字列にすることも可能
  // let str = encoding.codeToString(codeArray);
};

/**
 * [ファイルダウンロード処理]
 */
let output = () => {
  // 8ビット符号なし整数値の配列に変換
  let uint8Array = new Uint8Array(codeArray);

  // blob作成
  let blob = new Blob([uint8Array], {type: 'text/css'});

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
