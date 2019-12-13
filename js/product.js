function getProduct() {
  const items = selectNodes('.reconciledDetailsAttributes > strong')
    .map(pairsMapper)
    .reduce(joinObjects, {});

  const ASIN = items.ASIN || new URL(document.location).searchParams.get('asin');
  const title = items["Product Name"] || selectText('.reconciledDetailsHeaderTitle strong');
  const ASR = selectNumber('.reconciledDetailsAttributes > p > span + span');
  const URL = selectURLs('.reconciledDetailsHeaderTitle [href]')[0];
  const URLs = selectURLs('.reconciledDetailsAttributes [href]').reduce(URLsReducer, {});

  var MSRP = 0;

  try {
    MSRP = selectNumber('.reconciledDetailsAttributes span.smallnegative');
  } catch (err) {
    console.error(err);
  }

  return new Product({ ASIN, ASR, MSRP, URL, URLs, title });
}

function joinObjects(dst, src) {
  return { ...dst, ...src };
}

function pairsMapper(node) {
  if (!node.nextSibling)
    throw new Error(`node has no sibling`);

  const name = node.textContent.replace(':', '').trim();
  const value = node.nextSibling.textContent.trim();

  return { [name]: value };
}

function URLsReducer(URLs, url) {
  const condition = new URL(url).searchParams.get('condition');

  return { ...URLs, [condition]: url };
}

class Product {
  constructor({ ASIN, ASR = 0, MSRP = 0, URL = null, URLs = {}, title }) {
    this.id = 0;
    this.ASR = ASR;
    this.ASIN = ASIN;
    this.MSRP = MSRP;
    this.SKU = null;
    this.URL = URL;
    this.URLs = URLs;
    this.title = title;
    this.offers = [];
    this.condition = null;
  }

  get price() {
    const price = findLowestPrice(this.offers, this.condition ? this.condition.name : 'new', this.ASR, this.MSRP);

    if (!price)
      return 0;

    if (price < 6.94)
      return 6.94;

    return price;
  }
}

mobx.decorate(Product, {
  SKU: mobx.observable,
  id: mobx.observable,
  offers: mobx.observable,
  price: mobx.computed,
  condition: mobx.observable
});

class Condition {
  constructor(name, grade) {
    switch (name) {
      case 'new':
      case 'used':
      case 'collectible':
        break;
      default:
        throw new Error(`the product condition name is not valid: ${condition}`);
    }

    switch (grade) {
      case 'new':
      case 'like_new':
      case 'very_good':
      case 'good':
      case 'acceptable':
        break;
      default:
        throw new Error(`the product condition grade is not valid: ${condition}`);
    }

    this.name = name;
    this.grade = grade;
    this.code = null;
  }
}

mobx.decorate(Condition, { code: mobx.observable });
