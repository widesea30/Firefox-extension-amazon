try {
  var product = getProduct();
} catch (err) {
  console.error(err);
  alert(err);
}

mobx.observe(product, 'condition', () => {
  addProduct(product);

  getOffersFromURL(product.URLs[product.condition.name])
    .then(offers => offers ? product.offers = product.offers.concat(offers) : null)
    .catch(err => alert(err));
});

mobx.observe(product, 'SKU', value => {
  document.getElementById('item_sku').value = product.SKU
});

mobx.observe(product, 'id', () => {
  button.removeAttribute('disabled');
  printLabel(product.id, product.title, product.condition.code);
});

mobx.observe(product, 'offers', () => {
  console.log('OFFERS:', product.offers.slice());
  showPrices(product.offers.slice(), product.condition ? product.condition.name : 'new');
});

mobx.observe(product, 'price', ({ newValue: price }) => {
  if (price)
    document.getElementById('standard_price').value = price.toFixed(2);
});

getOffersFromProductPage(product.URL)
  .then(offers => {
    if (!offers)
      return;

    product.offers = product.offers.concat(offers);
  })
  .catch(err => alert(err));

document
  .getElementById('condition_type')
  .addEventListener('change', onChangeConditionType);

function onChangeConditionType({ target: { value }}) {
  const [name, grade] = value.split(',').map(string => string.trim());
  product.condition = new Condition(name, grade);
}
