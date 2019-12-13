const iframe = createPrintIframe();
const button = addReprintButton();

function createPrintIframe() {
  const iframe = document.createElement('iframe');
  iframe.classList.add('hidden');
  iframe.setAttribute('id', 'print-lable');
  document.body.appendChild(iframe);

  return iframe;
}

function printLabel(id, title, condition) {
  const url = new URL(chrome.runtime.getURL('label.html'));
  url.searchParams.append('id', id);
  url.searchParams.append('title', title);
  url.searchParams.append('condition', condition);
  url.searchParams.append('print', true);

  iframe.src = url.href;
}

function addReprintButton() {
  const button = document.createElement('button');
  button.classList.add('secondaryAUIButton');
  button.name = 'reprint';
  button.textContent = 'Print label';
  button.setAttribute('disabled', true);
  button.addEventListener('click', reprint);

  const actions = document.querySelector('.actions');
  const referenceElement = document.getElementById('main_submit_button').nextSibling;
  actions.insertBefore(button, referenceElement);

  return button;
}

function reprint(event) {
  event.stopPropagation();
  event.preventDefault();

  const { id, title } = product;
  const condition = product.condition.code;
  iframe.contentWindow.postMessage({ id, title, condition, print: true }, '*');
}
