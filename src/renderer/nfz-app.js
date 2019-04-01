import { html, property } from 'hybrids';
import run from '../nfz';
import generateXLS from '../nfz/xls';
import { version } from '../../package.json';

function logger(host) {
  return (msg) => {
    host.msg = `${new Date().toLocaleString()} -> ${msg} \n${host.msg}`;
  };
}

function updateProgress(host) {
  return (value) => {
    host.progress = value;
  };
}

function clear(host) {
  host.msg = '';
  host.progress = 1;
  host.loading = false;
}

function submit(host) {
  host.loading = true;

  run(host.product, host.year, logger(host), updateProgress(host))
    .then((result) => {
      generateXLS(`${host.product} (${host.year})`, result);
      clear(host);
    })
    .catch(() => clear(host));
}

export default {
  product: property((value = '') => value.toUpperCase().trim()),
  year: new Date().getFullYear(),
  msg: '',
  progress: 1,
  loading: false,
  render: ({
    product, year, loading, msg, progress,
  }) => html`
    <div class="form">
      <label>Nazwa produktu:</label>
      <input
        autofocus
        id="product"
        type="text"
        oninput="${(host, { target: { value } }) => { host.product = value; }}"
        value="${product}"
        disabled="${loading}"
      />
    </div>
    <div class="form">
      <label>Rok:</label>
      <input
        id="year"
        type="text"
        oninput="${(host, { target: { value } }) => { host.year = value; }}"
        value="${year}"
        disabled="${loading}"
        placeholder="Rok"
      />
    </div>

    <div class="content">
        ${msg ? html`<textarea value="${msg}"></textarea>` : html`<p>Wprowadź nazwę produktu, rok i kliknij pobierz</p>`}
    </div>
  
    ${loading && html`
      <div class="progress">
        <progress max="100" value="${progress}"></progress>
      </div>
    `}
    ${!loading && html`<button onclick="${submit}" disabled="${!product}">Pobierz</button>`}
    <footer>Wersja: ${version}</footer>

    <style>
      :host {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        font-family: sans-serif;
        text-align: left;
      }

      div.content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1 0 auto;
        border: 1px solid #AAA;
        margin: 10px;
        overflow-y: auto;
        text-align: center;
        padding: 10px;
      }

      textarea {
        flex: 1 0 auto;
        width: 100%;
        border: none;
        resize: none;
        overflow: hidden;
        font-size: 13px;
        font-family: sans-serif;
      }

      div.form {
        display: flex;
        flex-direction: column;
        flex: 0 0 auto;
        margin: 10px;
      }

      input#product {
        flex: 1;
      }

      input {
        flex: 0 0 auto;
        font-size: 14px;
        padding: 10px;
        border: 1px solid #AAA;
      }

      label {
        margin-bottom: 5px;
        font-size: 13px;
      }

      progress {
        width: 100%;
      }

      div.progress {
        display: flex;
        flex-direction: column;
        justify-content: center;
        margin: 10px;
        height: 40px;
      }

      button {
        font-size: 14px;
        padding: 10px;
        margin: 10px;
        height: 40px;
      }

      p {
        font-size: 13px;
        color: gray;
      }

      footer {
        padding: 0 10px 10px;
        font-size: 11px;
        text-align: right;
      }
    </style>
  `,
};
