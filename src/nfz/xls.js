import XLSX from 'xlsx';
import { remote } from 'electron';
import { OW_LIST, API_URL } from './consts';

function parsePrice(text) {
  return parseFloat(text.replace(/\s/g, '').replace(',', '.'));
}

function parseProgram(data) {
  return data.reduce((acc, item) => {
    acc.cost += parsePrice(item['Sumaryczna kwota kontraktu dla produktu']);
    const filteredPlan = item['Plan'].filter(plan => plan['Sumaryczna kwota kontraktu dla produktu'] !== '0,00');
    if (filteredPlan.length) {
      acc.descriptions.add([filteredPlan[0]['Miesiąc'], filteredPlan[filteredPlan.length - 1]['Miesiąc']].join(' - '));
    }
    return acc;
  }, {
    cost: 0,
    descriptions: new Set(),
  });
}

export default function generateXLS(product, list) {
  const wb = XLSX.utils.book_new();
  const ws = {};

  ws['!cols'] = [
    { width: 25 },
    { width: 100 },
    { width: 25 },
    { width: 25 },
    { width: 25 },
    { width: 25 },
    { width: 25 },
    { width: 25 },
    { width: 25 },
  ];

  ws['A1'] = { v: product, t: 's' };
  ws['A2'] = { v: `Data dostępu ${new Date().toLocaleDateString('pl')}`, t: 's' };

  XLSX.utils.sheet_add_aoa(ws, [[
    'Oddział wojewódzki NFZ',
    'Nazwa świadczeniodawcy',
    'Miasto',
    'Ulica',
    'Kod pocztowy',
    'NIP',
    'Leki w programie lekowym',
    'Program lekowy',
    'Komentarz (okres obowiązywania kontraktu)',
  ]], { origin: 'A4' });

  list.forEach((data, index) => {
    const row = index + 5;
    const mainProgram = parseProgram(data['Program lekowy']);
    const drugProgram = parseProgram(data['Leki w programie lekowym']);

    ws[`A${row}`] = { v: OW_LIST[data['OW']], t: 's' };
    ws[`B${row}`] = { v: data['Nazwa świadczeniodawcy'], t: 's', l: { Target: `${API_URL}${data['Kod'].href}` } };
    ws[`C${row}`] = { v: data['Miasto'], t: 's' };
    ws[`D${row}`] = { v: data['Ulica'], t: 's' };
    ws[`E${row}`] = { v: data['Kod pocztowy'], t: 's' };
    ws[`F${row}`] = { v: data['NIP'], t: 's' };
    ws[`G${row}`] = { v: drugProgram.cost, t: 'n', z: '#,##0.00' };
    ws[`H${row}`] = { v: mainProgram.cost, t: 'n', z: '#,##0.00' };
    ws[`I${row}`] = { v: [...mainProgram.descriptions].join(', '), t: 's' };
  });

  ws['!ref'] = `A1:I${list.length + 5}`;

  XLSX.utils.book_append_sheet(wb, ws);
  const o = remote.dialog.showSaveDialog({
    title: 'Zapisz plik jako',
    defaultPath: product,
    filters: [{
      name: 'Spreadsheets',
      extensions: ['xlsx'],
    }],
  });
  XLSX.writeFile(wb, o);
  remote.dialog.showMessageBox({ message: `Zapisano plik do ${o}`, buttons: ['OK'] });

  return list;
}
