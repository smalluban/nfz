import { getSearchResult, getProviderResult } from './request';
import getTableData from './scrapper';
import generateXLS from './xls';
import { OW_LIST } from './consts';
import { remote } from 'electron';

export async function search(Product, OW, page = 1, log) {
  log(`${OW_LIST[OW]}, strona ${page}`);
  try {
    const places = await getSearchResult({ Product, OW, page }).then(getTableData);

    for (const place of places) {
      place['OW'] = OW;
      place['Program lekowy'] = [];
      place['Leki w programie lekowym'] = [];

      log(`Wczytywanie placówki ${place['Nazwa świadczeniodawcy']}`);
      const agreements = await getProviderResult(place['Kod'].href).then(getTableData);

      for (const item of agreements) {
        log(`Wczytywanie umowy ${item['Kod umowy'].value}`);
        const itemData = await getProviderResult(item['Kod umowy'].href).then(getTableData);

        place['Program lekowy'] = itemData.filter(data =>
          data['Nazwa produktu kontraktowanego'] === `PROGRAM LEKOWY - ${Product}`).concat(place['Program lekowy']);

        place['Leki w programie lekowym'] = itemData.filter(data =>
          data['Nazwa produktu kontraktowanego'] === `LEKI W PROGRAMIE LEKOWYM - ${Product}`).concat(place['Leki w programie lekowym']);
      }

      await Promise.all(place['Program lekowy'].concat(place['Leki w programie lekowym'])
        .map(agreement => getProviderResult(agreement['Kod produktu kontraktowanego'].href)
          .then(getTableData)
          .then((data) => {
            log(`Wczytywanie planu miesięcznego do umowy ${agreement['Kod produktu kontraktowanego'].value}`);
            agreement['Plan'] = data;
          })));
    }

    if (places.length) {
      return places.concat(await search(Product, OW, page + 1, log));
    }

    return places;
  } catch(e) {
    remote.dialog.showMessageBox({ message: `Nieoczekiwany błąd: ${e}`, buttons: ['OK'] });
    throw e;
  }

}

export default async function run(Product, log) {
  log(`Loading data for: ${Product}`);

  let result = []; 
  for (const key of Object.keys(OW_LIST).sort()) {
    result = result.concat(await search(Product, key, 1, log));
  }

  return result;
}