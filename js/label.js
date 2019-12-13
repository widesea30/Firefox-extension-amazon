window.addEventListener('load', onLoad);
window.addEventListener('message', onMessage);

function onLoad() {
  const url = new URL(window.location);
  const id = url.searchParams.get('id');
  const title = url.searchParams.get('title');
  const condition = url.searchParams.get('condition');
  const autoPrint = !!url.searchParams.get('print');

  update({ id, title, condition });

  if (autoPrint)
    window.print();
}

function onMessage({ data: { id, title, condition, print }}) {
  update({ id, title, condition });

  if (print)
    window.print();
}

function update({ id, condition, title }) {
  document.getElementById('identifier').textContent = id;
  document.getElementById('condition').textContent = condition;
  document.getElementById('title').textContent = title;
}
