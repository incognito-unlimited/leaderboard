const urls = {
  round1: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS23eV3lW8jyLOh5OSkN0aYb5cegVuRwEzyEltTVxntnPiAJ3eDxOpDc2-_LuXP4zTeh7XLopsMat5i/pub?gid=175422441&single=true&output=csv',
  round2: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS23eV3lW8jyLOh5OSkN0aYb5cegVuRwEzyEltTVxntnPiAJ3eDxOpDc2-_LuXP4zTeh7XLopsMat5i/pub?gid=1816220995&single=true&output=csv',
  final: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS23eV3lW8jyLOh5OSkN0aYb5cegVuRwEzyEltTVxntnPiAJ3eDxOpDc2-_LuXP4zTeh7XLopsMat5i/pub?gid=464179075&single=true&output=csv'
};

let currentTab = 'round1';
let lastData = [];

async function fetchLeaderboard(tab) {
  const res = await fetch(urls[tab] + `&timestamp=${Date.now()}`, { cache: "no-store" }); // prevent caching
  const data = await res.text();

  const rows = data.trim().split('\n').slice(1); // skip header
  const parsed = rows.map(row => {
    const cols = row.split(',');
    return { name: cols[0].trim(), kills: parseInt(cols[1].trim()) };
  });

  parsed.sort((a, b) => b.kills - a.kills);

  // Compare with lastData
  const isDifferent = parsed.length !== lastData.length ||
    parsed.some((p, i) => !lastData[i] || p.name !== lastData[i].name || p.kills !== lastData[i].kills);

  if (!isDifferent) return; // No change → do nothing

  const tbody = document.querySelector('#leaderboard tbody');

  // Animate existing rows before update
  parsed.forEach((player, index) => {
    const prevIndex = lastData.findIndex(p => p.name === player.name);
    const existingRow = tbody.children[index];

    if (existingRow) {
      // Update text if kills changed
      existingRow.cells[2].textContent = player.kills;

      // Animate rank change
      if (prevIndex > index) {
        gsap.fromTo(existingRow, { backgroundColor: "#d4edda" }, { backgroundColor: "transparent", duration: 1 });
      } else if (prevIndex < index && prevIndex !== -1) {
        gsap.fromTo(existingRow, { backgroundColor: "#f8d7da" }, { backgroundColor: "transparent", duration: 1 });
      }
    } else {
      // Add new row
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${index+1}</td><td>${player.name}</td><td>${player.kills}</td>`;
      tbody.appendChild(tr);
      gsap.from(tr, { opacity: 0, y: 10, duration: 0.5 });
    }
  });

  // Remove extra rows if data shrank
  while (tbody.children.length > parsed.length) {
    tbody.removeChild(tbody.lastChild);
  }

  lastData = parsed;
}

function switchTab(tab) {
  currentTab = tab;
  document.getElementById('leaderboard-title').textContent =
    tab === 'round1' ? 'Round 1 Leaderboard' :
    tab === 'round2' ? 'Round 2 Leaderboard' : 'Final Round Leaderboard';

  lastData = [];
  fetchLeaderboard(tab);
}

// Initial load
fetchLeaderboard(currentTab);
setInterval(() => fetchLeaderboard(currentTab), 5000);