function findLowestPrice(offers, condition, ASR, MSRP) {
  const prices = offers.filter(offer => offer.condition === condition);
  const suggested = prices.filter(({ priority }) => priority > 0 && priority < 3);
  const price = applyDiscount(findLowest(suggested.length ? suggested : prices), ASR);

  if (ASR < 10 ** 6)
    return price;

  if (price > MSRP && MSRP >= 9.94)
    return MSRP;

  if (price > MSRP && MSRP < 9.94)
    return 9.94;

  return price;
}

function findLowest(offers) {
  return offers.map(({ shipping, price }) => shipping + price).sort(compare)[0];
}

function applyDiscount(price, ASR) {
  return price - findDiscound(discounts, ASR) / 100 * price;
}

function findDiscound(discounts, ASR) {
  const discount = discounts.find(({ min, max }) => ASR >= min && ASR <= max);

  if (!discount)
    return 0;

  return discount.discount
}

const discounts = [
  {
    min: 1,
    max: 50000,
    discount: 5
  },

  {
    min: 50001,
    max: 100000,
    discount: 9
  },

  {
    min: 100001,
    max: 250000,
    discount: 13
  },

  {
    min: 250001,
    max: 500000,
    discount: 18
  },

  {
    min: 500001,
    max: 1000000,
    discount: 23
  },

  {
    min: 1000001,
    max: 1500000,
    discount: 30
  },

  {
    min: 1500001,
    max: 2200000,
    discount: 38
  },

  {
    min: 2200001,
    max: Infinity,
    discount: 46
  }
];

function showPrices(offers, condition) {
  const offerForNew = offers.find(offer => offer.priority === 1 && offer.condition === 'new');
  const offerForUsed = offers.find(offer => offer.priority === 1 && offer.condition === 'used');
  const otherOffers = offers.filter(offer => offer.priority === 2);
  const other = offers.filter(offer => offer.priority > 2 && offer.condition === condition);

  const html = `
    <div class="prices">
      <div>
        <strong>Buy Box prices:</strong>
        ${
          offerForNew ? `<span>${offerForNew.price + offerForNew.shipping} (new)</span>` : ''
        }

        ${
          offerForUsed ? `<span>${offerForUsed.price + offerForUsed.shipping} (used)</span>` : ''
        }

        ${
          offerForNew || offerForUsed ? '' : '<span>Not found</span>'
        }
      </div>
      <div>
        <strong>Other Sellers on Amazon:</strong>
        ${
          (!otherOffers || !otherOffers.length)
          ? '<span>Not found</span>'
          : otherOffers.map(offer => offer.price + offer.shipping).sort(compare).join(', ')
        }
      </div>
      <div>
        <strong>Competing Marketplace Offers</strong>
        ${
          (!other || !other.length)
          ? '<span>Not found</span>'
          : other.map(offer => offer.price + offer.shipping).sort(compare).join(', ')
        }
      </div>
    </div>
  `;

  [...document.getElementsByClassName('prices')].forEach(e => e.remove());

  return document
    .querySelector('.reconciledDetailsHeaderContainer')
    .insertAdjacentHTML('beforeend', html);
}

function compare(a, b) {
  return a - b;
}
