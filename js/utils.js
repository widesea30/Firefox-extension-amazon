const priceRE = /(?:^|\s+)\$(\d+(?:\.\d+)?)(?:\s+|$)/;
const shippingRE = /(?:^|\s+)\$(\d+(?:\.\d+)?)\s+shipping/;

async function getHTML(url) {
  const res = await fetch(url);

  if (!res.ok)
    throw new Error(`[${res.status}] failed to fetch the product page: ${res.statusText}`);

  const text = await res.text();
  const parser = new DOMParser();
  const html = parser.parseFromString(text, 'text/html');

  return html;
}

function selectNumber(selector, doc = document) {
  return parseFloat(selectText(selector, doc).replace(/\,|\$/g, ''));
}

function selectText(selector, doc = document) {
  return selectNode(selector, doc).textContent.trim();
}

function selectURLs(selector, doc = document) {
  return selectNodes(selector, doc).map(node => node.href);
}

function selectNode(selector, doc = document) {
  const node = doc.querySelector(selector);

  if (!node)
    throw new Error(`failed to select node by CSS selector: ${selector}`);

  return node;
}

function selectNodes(selector, doc = document) {
  const nodes = [...doc.querySelectorAll(selector)];

  if (!nodes.length)
    throw new Error(`failed to select nodes by CSS selector: ${selector}`);

  return nodes;
}
