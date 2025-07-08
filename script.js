const urls = {
  round1: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS23eV3lW8jyLOh5OSkN0aYb5cegVuRwEzyEltTVxntnPiAJ3eDxOpDc2-_LuXP4zTeh7XLopsMat5i/pub?gid=175422441&single=true&output=csv',
  round2: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS23eV3lW8jyLOh5OSkN0aYb5cegVuRwEzyEltTVxntnPiAJ3eDxOpDc2-_LuXP4zTeh7XLopsMat5i/pub?gid=1816220995&single=true&output=csv',
  final: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS23eV3lW8jyLOh5OSkN0aYb5cegVuRwEzyEltTVxntnPiAJ3eDxOpDc2-_LuXP4zTeh7XLopsMat5i/pub?gid=464179075&single=true&output=csv'
};

let currentTab = 'round1';
let lastData = [];

async function fetchLeaderboard() {
  const url = urls[currentTab];
  const res = await fetch(url + `&timestamp=${Date.now()}`, { cache: "no-store" });
  const data = await res.text();

  const rows = data.trim().split('\n').slice(1);
  const parsed = rows.map(row => {
    const cols = row.split(',');
    return { name: cols[0].trim(), kills: parseInt(cols[1].trim()) };
  }).sort((a, b) => b.kills - a.kills);

  const isDifferent = parsed.length !== lastData.length ||
    parsed.some((p, i) => !lastData[i] || p.name !== lastData[i].name || p.kills !== lastData[i].kills);

  if (!isDifferent) return;

  if (currentTab === 'round1') {
    updateTwoTables(parsed);
  } else {
    updateSingleTable(parsed);
  }

  lastData = parsed;
}

function updateSingleTable(parsed) {
  const tbody = document.querySelector('#leaderboard tbody');

  parsed.forEach((player, index) => {
    let row = tbody.children[index];
    if (!row) {
      row = document.createElement('tr');
      row.innerHTML = `<td>${index+1}</td><td>${player.name}</td><td>${player.kills}</td>`;
      tbody.appendChild(row);
      gsap.from(row, { opacity: 0, y: 10, duration: 0.5 });
    } else {
      const prevKills = parseInt(row.cells[2].textContent);
      row.cells[0].textContent = index+1;
      row.cells[1].textContent = player.name;

      if (prevKills !== player.kills) {
        row.cells[2].textContent = player.kills;
        if (player.kills > prevKills) {
          gsap.fromTo(row, { backgroundColor: "#28a745" }, { backgroundColor: "transparent", duration: 1 });
        } else {
          gsap.fromTo(row, { backgroundColor: "#dc3545" }, { backgroundColor: "transparent", duration: 1 });
        }
      }
    }
  });

  while (tbody.children.length > parsed.length) {
    tbody.removeChild(tbody.lastChild);
  }
}

function updateTwoTables(parsed) {
  const table1 = document.querySelector('#leaderboard1 tbody');
  const table2 = document.querySelector('#leaderboard2 tbody');

  const splitIndex = 25;
  const firstHalf = parsed.slice(0, splitIndex);
  const secondHalf = parsed.slice(splitIndex, 50);

  updateHalfTable(table1, firstHalf, 1);
  updateHalfTable(table2, secondHalf, splitIndex + 1);
}

function updateHalfTable(tbody, data, startRank) {
  data.forEach((player, i) => {
    let row = tbody.children[i];
    if (!row) {
      row = document.createElement('tr');
      row.innerHTML = `<td>${startRank + i}</td><td>${player.name}</td><td>${player.kills}</td>`;
      tbody.appendChild(row);
      gsap.from(row, { opacity: 0, y: 10, duration: 0.5 });
    } else {
      const prevKills = parseInt(row.cells[2].textContent);
      row.cells[0].textContent = startRank + i;
      row.cells[1].textContent = player.name;

      if (prevKills !== player.kills) {
        row.cells[2].textContent = player.kills;
        if (player.kills > prevKills) {
          gsap.fromTo(row, { backgroundColor: "#28a745" }, { backgroundColor: "transparent", duration: 1 });
        } else {
          gsap.fromTo(row, { backgroundColor: "#dc3545" }, { backgroundColor: "transparent", duration: 1 });
        }
      }
    }
  });

  while (tbody.children.length > data.length) {
    tbody.removeChild(tbody.lastChild);
  }
}

function switchTab(tab) {
  currentTab = tab;
  document.getElementById('leaderboard-title').textContent =
    tab === 'round1' ? 'Round 1 Leaderboard' :
    tab === 'round2' ? 'Round 2 Leaderboard' : 'Final Round Leaderboard';

  document.getElementById('round1-tables').style.display = tab === 'round1' ? 'flex' : 'none';
  document.getElementById('leaderboard').style.display = tab === 'round1' ? 'none' : '';

  lastData = [];
  clearAllTables();
  fetchLeaderboard();
}

function clearAllTables() {
  document.querySelectorAll('tbody').forEach(tbody => tbody.innerHTML = '');
}

document.getElementById('round1-tab').addEventListener('click', () => switchTab('round1'));
document.getElementById('round2-tab').addEventListener('click', () => switchTab('round2'));
document.getElementById('final-tab').addEventListener('click', () => switchTab('final'));

fetchLeaderboard();
setInterval(fetchLeaderboard, 5000);