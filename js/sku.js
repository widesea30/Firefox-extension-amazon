async function addProduct(product) {
  const { ASIN, title } = product;
  const { name, grade } = product.condition;

  const init = {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer VW3X0A+kM+9VLI33CVHJzHQlF2/6/zhNlfbGD661cUqoKxekYRW1Tk5oHVmknUBm',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, grade: grade === 'new' ? null : grade })
  };

  const endpoint = new URL(`/book/${ASIN}/${name}`, 'https://blackforestbooks.com');
  const res = await fetch(endpoint, init);

  if (!res.ok)
    throw new Error(`[${res.status}] failed to add product: ${res.statusText}`);

  const { sku, condition, product: { id } } = await res.json();

  product.condition.code = condition.id;
  product.SKU = sku;
  product.id = id;

  return product;
}
