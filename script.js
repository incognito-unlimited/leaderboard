const urls = {
  round1: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS23eV3lW8jyLOh5OSkN0aYb5cegVuRwEzyEltTVxntnPiAJ3eDxOpDc2-_LuXP4zTeh7XLopsMat5i/pub?gid=175422441&single=true&output=csv',
  round2: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS23eV3lW8jyLOh5OSkN0aYb5cegVuRwEzyEltTVxntnPiAJ3eDxOpDc2-_LuXP4zTeh7XLopsMat5i/pub?gid=1816220995&single=true&output=csv',
  final: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS23eV3lW8jyLOh5OSkN0aYb5cegVuRwEzyEltTVxntnPiAJ3eDxOpDc2-_LuXP4zTeh7XLopsMat5i/pub?gid=464179075&single=true&output=csv'
};

let currentTab = 'round1';
let lastRanks = [];

async function fetchLeaderboard(tab) {
  const res = await fetch(urls[tab]);
  const data = await res.text();

  const rows = data.trim().split('\n').slice(1); // Skip header
  const parsed = rows.map(row => {
    const cols = row.split(',');
    return { name: cols[0].trim(), kills: parseInt(cols[1].trim()) };
  });

  parsed.sort((a, b) => b.kills - a.kills);

  const newRanks = parsed.map(p => p.name);
  const tbody = document.querySelector('#leaderboard tbody');
  tbody.innerHTML = ''; // Clear existing

  parsed.forEach((player, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${index+1}</td><td>${player.name}</td><td>${player.kills}</td>`;
    tbody.appendChild(tr);

    // Animate rank changes with GSAP
    const prevIndex = lastRanks.indexOf(player.name);
    if (prevIndex !== -1) {
      if (prevIndex > index) {
        // moved up
        gsap.from(tr, { backgroundColor: "#d4edda", duration: 1 });
      } else if (prevIndex < index) {
        // moved down
        gsap.from(tr, { backgroundColor: "#f8d7da", duration: 1 });
      }
    } else {
      // new entry
      gsap.from(tr, { opacity: 0, y: 10, duration: 0.5 });
    }
  });

  lastRanks = newRanks;
}

function switchTab(tab) {
  currentTab = tab;
  document.getElementById('leaderboard-title').textContent = 
    tab === 'round1' ? 'Round 1 Leaderboard' :
    tab === 'round2' ? 'Round 2 Leaderboard' : 'Final Round Leaderboard';
  
  lastRanks = []; // reset ranks to ensure animation
  fetchLeaderboard(tab);
}

// Initial load
fetchLeaderboard(currentTab);
setInterval(() => fetchLeaderboard(currentTab), 5000);