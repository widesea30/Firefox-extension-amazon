class Offer {
  static Used(price, shipping, priority) {
    const offer = new Offer(price, shipping, priority);
    offer.condition = 'used';

    return offer;
  }

  constructor(price, shipping = 0, priority = 1) {
    this.price = price;
    this.shipping = shipping;
    this.priority = priority;
    this.condition = 'new';
    this.grade = null;
  }
}

async function getOffersFromProductPage(URL) {
  const html = await getHTML(URL);
  const offers = getOffersFromBuyBox(html);
  const otherOffers = getOffersFromMoreBuyChoices(html);

  if (!offers && otherOffers)
    return otherOffers;

  if (offers && otherOffers)
    return offers.concat(otherOffers);

  return offers;
}

function getOffersFromBuyBox(html) {
  const offers = [];

  if (html.getElementById('mediaTabsGroup'))
    return getOffersFromMediaBuyBox(html);

  try {
    offers.push(getOfferForNewFromBuyBox(html));
  } catch (err) {
    console.error(err);
  }

  try {
    offers.push(getOfferForUsedFromBuyBox(html));
  } catch (err) {
    console.error(err);
  }

  return offers.length ? offers : null;
}

function getOfferForNewFromBuyBox(html) {
  const node = html.querySelector('#buyNewInner .shipping3P');
  const array = node ? shippingRE.exec(node.textContent) : 0;
  const shipping = array ? parseFloat(array[1]) : 0;

  return new Offer(selectNumber('#buyNewSection .offer-price', html), shipping, 1);
}

function getOfferForUsedFromBuyBox(html) {
  const price = selectNumber('#usedBuySection .offer-price', html);
  const shipping = getShippingCostForUsedFromBuyBox(html);
  const offer = Offer.Used(price, shipping, 1);

  return offer;
}

function getShippingCostForUsedFromBuyBox(html) {
  const shippingNode = html.querySelector('#usedbuyBox .a-row');
  const array = shippingNode ? priceRE.exec(shippingNode.textContent) : null;
  const shipping = array ? parseFloat(array[1]) : 0;

  return shipping;
}

function getOffersFromMoreBuyChoices(html) {
  const offers = [...html.getElementsByClassName('mbc-offer-row')]
    .reduce(reducerForMoreBuyChoices, []);

  return offers.length ? offers : null;
}

function reducerForMoreBuyChoices(offers, node) {
  const priceNode = node.querySelector('.a-color-price');

  if (!priceNode)
    return offers;

  const price = parseFloat(priceNode.textContent.replace('$', ''));

  const shippingNode = node.querySelector('.a-color-secondary');
  const array = shippingNode ? priceRE.exec(shippingNode.textContent) : null;
  const shipping = array ? parseFloat(array[1]) : 0;

  offers.push(new Offer(price, shipping, 2));

  return offers;
}


function getOffersFromMediaBuyBox(container) {
  const offers = [
    getOfferFromMediaBuyBox(container, 'newOfferAccordionRow', false),
    getOfferFromMediaBuyBox(container, 'usedOfferAccordionRow', true)
  ].filter(value => value);

  if (!offers.length && container.getElementById('mediaNoAccordion'))
    offers.push(getOfferFromMediaBuyBoxWithoutAccordion(container))

  return offers.length ? offers : null;
}

function getOfferFromMediaBuyBoxWithoutAccordion(html) {
  const price = selectNumber('#mediaNoAccordion .header-price', html);
  const isUsed = selectText('#mediaNoAccordion .header-text', html).toLowerCase().includes('used');

  if (isUsed)
    return Offer.Used(price, 0, 1);

  return new Offer(price, 0, 1);
}

function getOfferFromMediaBuyBox(container, id, isUsed = false) {
  const node = container.getElementById(id);

  if (!node)
    return;

  const price = parseFloat(node.querySelector('.header-price').textContent.replace('$', ''));
  const array = shippingRE.exec(node.textContent);
  const shipping = array ? parseFloat(array[1]) : 0;

  const offer = new Offer(price, shipping, 1);
  offer.condition = isUsed ? 'used' : 'new';

  return offer;
}


async function getOffersFromURL(url, priority = 3) {
  const html = await getHTML(url);
  const offers = getOffers(html, priority);

  const node = html.querySelector('.a-last [href]');

  if (!node)
    return offers;

  const { protocol, host, port } = new URL(url);
  const nextURL = new URL(node.href);
  nextURL.host = host;
  nextURL.port = port;
  nextURL.protocol = protocol;

  return getOffersFromURL(nextURL.href, ++priority)
    .then(array => offers.concat(array));
}

function getOffers(container, priority = 3) {
  const nodes = [...container.getElementsByClassName('olpOffer')];
  const offers = nodes.map(node => getOffer(node, priority));

  return offers;
}

function getOffer(node, priority) {
  const priceElement = node.querySelector('.olpOfferPrice');

  if (!priceElement)
    return;

  const price = parseFloat(priceElement.textContent.replace('$', ''));
  const { condition, grade } = getCondition(node);
  const shipping = getShippingCost(node);

  const offer = new Offer(price, shipping, priority);
  offer.condition = condition;
  offer.grade = grade;

  return offer;
}

function getCondition(container) {
  const text = container.querySelector('.olpCondition').textContent.trim().toLowerCase();
  const array = text.split('-');
  const condition = array[0].trim();
  const grade = array.length === 1 ? condition : array[1].trim().replace(/\s+/, '_');

  return { condition, grade };
}

function getShippingCost(container) {
  const node = container.querySelector('.olpShippingPrice');
  const array = node ? priceRE.exec(node.textContent) : null;
  const shipping = array ? parseFloat(array[1]) : 0;

  return shipping;
}
