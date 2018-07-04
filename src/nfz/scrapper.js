import cheerio from 'cheerio';

export default function getTableData(html) {
  const $ = cheerio.load(html);

  function getClearedText(obj) {
    return $(obj)
      .text()
      .replace(/\s+/g, ' ')
      .trim();
  }

  const keys = $('table th:not(:empty) a')
    .map(((index, a) => getClearedText(a.childNodes[0])))
    .get();

  const data = [];

  $('table tbody tr')
    .each((trIndex, tr) => {
      data[trIndex] = [];

      $(tr).find('td:not(:empty)').each((tdIndex, td) => {
        const link = $(td).find('a');
        const href = link.attr('href');
        if (href) {
          data[trIndex][tdIndex] = {
            value: getClearedText(link[0].childNodes[0]),
            href,
          };
        } else {
          data[trIndex][tdIndex] = $(td).text().replace(/\s+/g, ' ').trim();
        }
      });
    });

  return data.map(row => row.reduce((acc, item, index) => {
    const name = keys[index];
    if (name) {
      acc[name] = item;
    }
    return acc;
  }, {}));
}
