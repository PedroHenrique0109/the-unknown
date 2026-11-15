'use strict';

// Endpoints públicos da TVmaze. O ID 1744 corresponde a Over the Garden Wall.
const API_BASE = 'https://api.tvmaze.com';
const SHOW_ID = 1744;
const SHOW_URL = `${API_BASE}/shows/${SHOW_ID}`;
const CAST_URL = `${SHOW_URL}/cast`;

const elements = {
  heroSummary: document.querySelector('#heroSummary'),
  fullSummary: document.querySelector('#fullSummary'),
  showPoster: document.querySelector('#showPoster'),
  showFacts: document.querySelector('#showFacts'),
  characterGrid: document.querySelector('#characterGrid'),
  apiStatus: document.querySelector('#apiStatus'),
  searchInput: document.querySelector('#searchInput'),
  imageFilter: document.querySelector('#imageFilter'),
  resultsCount: document.querySelector('#resultsCount'),
  emptyState: document.querySelector('#emptyState')
};

let characters = [];

function cleanSummary(html) {
  // A API envia a sinopse como HTML; convertemos para texto antes de exibir.
  const container = document.createElement('div');
  container.innerHTML = html || '';
  return container.textContent.trim();
}

function setApiStatus(message, type = '') {
  elements.apiStatus.className = `api-status ${type}`.trim();
  elements.apiStatus.replaceChildren();
  const pulse = document.createElement('span');
  pulse.className = 'status-pulse';
  elements.apiStatus.appendChild(pulse);
  elements.apiStatus.appendChild(document.createTextNode(message));
}

function formatStatus(status) {
  const translations = { Ended: 'Encerrada', Running: 'Em exibição', 'To Be Determined': 'A definir', 'In Development': 'Em desenvolvimento' };
  return translations[status] || status || 'Não informado';
}

function renderShowInfo(show) {
  const summary = cleanSummary(show.summary);
  if (summary) {
    elements.heroSummary.textContent = summary;
    elements.fullSummary.textContent = summary;
  }

  if (show.image && show.image.original) {
    elements.showPoster.src = show.image.original;
  } else {
    elements.showPoster.alt = 'Imagem da série não cadastrada na TVmaze';
    elements.showPoster.removeAttribute('src');
  }

  const facts = [
    { value: formatStatus(show.status), label: 'STATUS' },
    { value: show.premiered ? show.premiered.slice(0, 4) : '—', label: 'ESTREIA' },
    { value: Array.isArray(show.genres) && show.genres.length ? show.genres.slice(0, 2).join(' / ') : '—', label: 'GÊNERO' }
  ];

  elements.showFacts.replaceChildren();
  facts.forEach((item) => {
    const fact = document.createElement('div');
    fact.className = 'fact';
    const value = document.createElement('span');
    value.className = 'fact-value';
    value.textContent = item.value;
    const label = document.createElement('span');
    label.className = 'fact-label';
    label.textContent = item.label;
    fact.appendChild(value);
    fact.appendChild(label);
    elements.showFacts.appendChild(fact);
  });
}

function createCharacterCard(castMember, index) {
  const character = castMember.character || {};
  const person = castMember.person || {};
  const characterName = character.name || 'Personagem sem nome';
  const actorName = person.name || 'Intérprete não informado';
  const imageUrl = character.image?.medium || character.image?.original || '';
  const characterUrl = character.url || 'https://www.tvmaze.com';

  // O card inteiro é construído pelo JavaScript a partir dos objetos retornados pela API.
  const card = document.createElement('article');
  card.className = 'character-card';
  card.dataset.name = characterName.toLocaleLowerCase('pt-BR');
  card.dataset.actor = actorName.toLocaleLowerCase('pt-BR');
  card.dataset.hasImage = imageUrl ? 'yes' : 'no';

  const imageWrap = document.createElement('div');
  imageWrap.className = 'card-image-wrap';

  if (imageUrl) {
    const image = document.createElement('img');
    image.className = 'card-image';
    image.src = imageUrl;
    image.alt = `Imagem de ${characterName}`;
    image.loading = 'lazy';
    image.onerror = () => {
      image.remove();
      const fallback = document.createElement('div');
      fallback.className = 'card-image-fallback';
      fallback.setAttribute('aria-label', `Imagem não disponível para ${characterName}`);
      fallback.textContent = characterName.charAt(0).toUpperCase();
      imageWrap.appendChild(fallback);
      card.dataset.hasImage = 'no';
      applyFilters();
    };
    imageWrap.appendChild(image);
  } else {
    const fallback = document.createElement('div');
    fallback.className = 'card-image-fallback';
    fallback.setAttribute('aria-label', `Imagem não disponível para ${characterName}`);
    fallback.textContent = characterName.charAt(0).toUpperCase();
    imageWrap.appendChild(fallback);
  }

  const number = document.createElement('span');
  number.className = 'card-number';
  number.textContent = `ARQUIVO Nº ${String(index + 1).padStart(2, '0')}`;
  imageWrap.appendChild(number);

  const content = document.createElement('div');
  content.className = 'card-content';

  const kicker = document.createElement('span');
  kicker.className = 'card-kicker';
  kicker.textContent = castMember.voice ? 'Personagem · voz original' : 'Personagem';

  const title = document.createElement('h3');
  title.textContent = characterName;

  const credit = document.createElement('p');
  credit.className = 'card-credit';
  credit.appendChild(document.createTextNode(castMember.voice ? 'Voz original: ' : 'Intérprete: '));
  const actorStrong = document.createElement('strong');
  actorStrong.textContent = actorName;
  credit.appendChild(actorStrong);

  const link = document.createElement('a');
  link.className = 'card-link';
  link.href = characterUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.appendChild(document.createTextNode('Consultar ficha'));
  const arrow = document.createElement('span');
  arrow.textContent = '↗';
  link.appendChild(arrow);

  content.appendChild(kicker);
  content.appendChild(title);
  content.appendChild(credit);
  content.appendChild(link);

  card.appendChild(imageWrap);
  card.appendChild(content);
  return card;
}

function renderCharacters(list) {
  elements.characterGrid.replaceChildren();
  list.forEach((member, index) => {
    const card = createCharacterCard(member, index);
    elements.characterGrid.appendChild(card);
  });
  applyFilters();
}

function applyFilters() {
  const term = elements.searchInput.value.trim().toLocaleLowerCase('pt-BR');
  const imageFilter = elements.imageFilter.value;
  const cards = Array.from(elements.characterGrid.children);
  let visible = 0;

  cards.forEach((card) => {
    const matchesText = card.dataset.name.includes(term) || card.dataset.actor.includes(term);
    const matchesImage = imageFilter === 'all' ||
      (imageFilter === 'with-image' && card.dataset.hasImage === 'yes') ||
      (imageFilter === 'without-image' && card.dataset.hasImage === 'no');
    const showCard = matchesText && matchesImage;
    card.hidden = !showCard;
    if (showCard) visible += 1;
  });

  elements.resultsCount.textContent = `${visible} de ${cards.length} personagem(ns)`;
  elements.emptyState.hidden = visible !== 0;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 429) throw new Error('A API limitou temporariamente as consultas. Aguarde alguns segundos e recarregue a página.');
    throw new Error(`Não foi possível consultar a API (HTTP ${response.status}).`);
  }
  return response.json();
}

async function init() {
  setApiStatus('Consultando os arquivos da TVmaze...');
  try {
    // Duas consultas HTTP independentes: ficha da série e elenco principal.
    const [show, cast] = await Promise.all([fetchJson(SHOW_URL), fetchJson(CAST_URL)]);
    renderShowInfo(show);
    characters = Array.isArray(cast) ? cast : [];
    renderCharacters(characters);
    setApiStatus(`Arquivo atualizado: ${characters.length} registros de elenco recebidos da TVmaze.`, 'success');
  } catch (error) {
    console.error('Erro ao carregar dados da TVmaze:', error);
    setApiStatus(error.message || 'Ocorreu um erro ao carregar os dados. Verifique sua conexão e tente novamente.', 'error');
    elements.resultsCount.textContent = 'Dados indisponíveis';
    elements.emptyState.hidden = false;
    elements.emptyState.textContent = 'Não foi possível carregar os personagens agora. Recarregue a página para tentar novamente.';
  }
}

elements.searchInput.addEventListener('input', applyFilters);
elements.imageFilter.addEventListener('change', applyFilters);

document.addEventListener('keydown', (event) => {
  if (event.key === '/' && document.activeElement !== elements.searchInput) {
    event.preventDefault();
    elements.searchInput.focus();
  }
  if (event.key === 'Escape' && document.activeElement === elements.searchInput) {
    elements.searchInput.value = '';
    applyFilters();
    elements.searchInput.blur();
  }
});

init();
