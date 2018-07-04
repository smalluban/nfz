import { html } from 'hybrids';
import run from '../nfz';
import generateXLS from '../nfz/xls';

function logger(host) {
  let index = 0;
  return (msg) => {
    host.msg = `${msg} (${index})`;
    index += 1;
  };
}

function clear(host) {
  host.msg = '';
  host.loading = false;
}

function submit(host) {
  host.loading = true;

  run(host.product, logger(host))
    .then((result) => {
      generateXLS(host.product, result);
      clear(host);
    })
    .catch(() => clear(host));
}

export default {
  product: '',
  msg: '',
  loading: false,
  render: ({ product, loading, msg }) => html`
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
        padding: 10px;
        text-align: center;
      }

      div {
        display: flex;
        flex-direction: column;
        flex: 1 0 auto;
      }

      input {
        flex: 0 0 auto;
        font-size: 14px;
        margin: 10px 0;
        padding: 10px;
      } 

      button {
        font-size: 14px;
        padding: 10px;
      }

      p {
        font-size: 13px;
        color: gray;
      }
    </style>

    <div class="content">
      <input
        autofocus
        id="product"
        type="text"
        oninput="${(host, { target: { value } }) => { host.product = value; }}"
        value="${product}"
        disabled="${loading}"
        placeholder="Nazwa produktu"
      />
    </div>
    <div class="content">
      <p>
        ${msg ? html`<strong>Pobieranie wyników:</strong> <span>${msg}</span>` : html`Wprowadź nazwę produktu i kliknij pobierz`}
      </p>
    </div>
    <button onclick="${submit}" disabled="${loading || !product}">Pobierz</button>
  `,
};
