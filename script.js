const urls = {
  round1: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS23eV3lW8jyLOh5OSkN0aYb5cegVuRwEzyEltTVxntnPiAJ3eDxOpDc2-_LuXP4zTeh7XLopsMat5i/pub?gid=175422441&single=true&output=csv',
  round2: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS23eV3lW8jyLOh5OSkN0aYb5cegVuRwEzyEltTVxntnPiAJ3eDxOpDc2-_LuXP4zTeh7XLopsMat5i/pub?gid=1816220995&single=true&output=csv',
  final: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS23eV3lW8jyLOh5OSkN0aYb5cegVuRwEzyEltTVxntnPiAJ3eDxOpDc2-_LuXP4zTeh7XLopsMat5i/pub?gid=464179075&single=true&output=csv'
};

let currentTab = 'round1';
let lastData = '';

async function fetchLeaderboard(tab) {
  const res = await fetch(urls[tab]);
  const data = await res.text();

  // Only update if data has changed
  if (data !== lastData) {
    lastData = data;

    const rows = data.trim().split('\n').slice(1); // Skip header
    const parsed = rows.map(row => {
      const cols = row.split(',');
      return { name: cols[0], kills: cols[1] };
    });

    parsed.sort((a, b) => b.kills - a.kills);

    const tbody = document.querySelector('#leaderboard tbody');
    tbody.innerHTML = ''; // Clear existing

    parsed.forEach((player, index) => {
      const tr = document.createElement('tr');
      tr.classList.add('fade-in');
      tr.innerHTML = `<td>${index+1}</td><td>${player.name}</td><td>${player.kills}</td>`;
      tbody.appendChild(tr);
    });
  }
}

function switchTab(tab) {
  currentTab = tab;
  const title = document.getElementById('leaderboard-title');
  if(tab === 'round1') title.textContent = 'Round 1 Leaderboard';
  else if(tab === 'round2') title.textContent = 'Round 2 Leaderboard';
  else title.textContent = 'Final Round Leaderboard';

  lastData = ''; // Reset lastData so it always loads new tab
  fetchLeaderboard(tab);
}

// Initial load
fetchLeaderboard(currentTab);
setInterval(() => fetchLeaderboard(currentTab), 5000);
