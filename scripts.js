const graph = {
  Arad: { Zerind: 75, Sibiu: 140, Timisoara: 118 },
  Zerind: { Arad: 75, Oradea: 71 },
  Oradea: { Zerind: 71, Sibiu: 151 },
  Sibiu: { Arad: 140, Oradea: 151, Fagaras: 99, RimnicuVilcea: 80 },
  Timisoara: { Arad: 118, Lugoj: 111 },
  Lugoj: { Timisoara: 111, Mehadia: 70 },
  Mehadia: { Lugoj: 70, Drobeta: 75 },
  Drobeta: { Mehadia: 75, Craiova: 120 },
  Craiova: { Drobeta: 120, RimnicuVilcea: 146, Pitesti: 138 },
  RimnicuVilcea: { Sibiu: 80, Craiova: 146, Pitesti: 97 },
  Fagaras: { Sibiu: 99, Bucharest: 211 },
  Pitesti: { RimnicuVilcea: 97, Craiova: 138, Bucharest: 101 },
  Bucharest: { Fagaras: 211, Pitesti: 101, Giurgiu: 90, Urziceni: 85 },
  Giurgiu: { Bucharest: 90 },
  Urziceni: { Bucharest: 85, Hirsova: 98, Vaslui: 142 },
  Hirsova: { Urziceni: 98, Eforie: 86 },
  Eforie: { Hirsova: 86 },
  Vaslui: { Urziceni: 142, Iasi: 92 },
  Iasi: { Vaslui: 92, Neamt: 87 },
  Neamt: { Iasi: 87 },
};

function validateInput(start, end) {
  if (!graph[start] || !graph[end]) {
    alert("Cidade de partida ou chegada inválida. Verifique os nomes.");
    return false;
  }
  return true;
}

// UCS - Busca de Custo Uniforme
function ucs(start, end) {
  const queue = [[start, 0, [start]]]; // Agora armazenamos o caminho completo
  const visited = new Set();

  while (queue.length > 0) {
    queue.sort((a, b) => a[1] - b[1]); // Ordena pelo custo
    const [node, cost, path] = queue.shift();

    if (node === end) return path; // Retorna o caminho completo

    if (!visited.has(node)) {
      visited.add(node);
      for (const neighbor in graph[node]) {
        const newCost = cost + graph[node][neighbor];
        const newPath = [...path, neighbor]; // Adiciona o vizinho ao caminho
        queue.push([neighbor, newCost, newPath]);
      }
    }
  }
  return null; // Se não encontrar o caminho
}

// Busca em profundidade limitada (DLS)
function dls(start, end, limit, path = [], visited = new Set()) {
  path.push(start);
  visited.add(start);

  if (start === end) return path; // Retorna o caminho se o nó final for encontrado

  if (limit <= 0) return null; // Retorna null se o limite de profundidade for atingido

  for (const neighbor in graph[start]) {
    if (!visited.has(neighbor)) {
      const result = dls(neighbor, end, limit - 1, path, visited);
      if (result) return result; // Retorna o caminho se encontrado
    }
  }

  path.pop(); // Remove o nó atual do caminho se não levar ao destino
  return null;
}

// Função para BFS
function bfs(start, end) {
  const queue = [[start]];
  const visited = new Set();

  while (queue.length > 0) {
    const path = queue.shift();
    const node = path[path.length - 1];

    if (node === end) return path;

    if (!visited.has(node)) {
      visited.add(node);
      for (const neighbor in graph[node]) {
        queue.push([...path, neighbor]);
      }
    }
  }
  return null;
}

// Função para DFS
function dfs(start, end, path = [], visited = new Set()) {
  path.push(start);
  visited.add(start);

  if (start === end) return path;

  for (const neighbor in graph[start]) {
    if (!visited.has(neighbor)) {
      const result = dfs(neighbor, end, path, visited);
      if (result) return result;
    }
  }
  path.pop();
  return null;
}

// Busca de aprofundamento iterativo (IDDFS)
function iddfs(start, end, maxDepth) {
  for (let depth = 0; depth <= maxDepth; depth++) {
    const result = dls(start, end, depth);
    if (result) return result;
  }
  return null;
}

// Busca Gulosa (Greedy Best-First Search)
function greedyBestFirstSearch(start, end) {
  const queue = [[start]]; // Fila de caminhos
  const visited = new Set(); // Conjunto de nós visitados

  while (queue.length > 0) {
    // Ordena a fila com base na heurística (menor valor primeiro)
    queue.sort((a, b) => heuristic(a[a.length - 1], end) - heuristic(b[b.length - 1], end));
    const path = queue.shift(); // Pega o caminho com a menor heurística
    const node = path[path.length - 1]; // Pega o último nó do caminho

    if (node === end) return path; // Retorna o caminho se o nó final for encontrado

    if (!visited.has(node)) {
      visited.add(node); // Marca o nó como visitado
      for (const neighbor in graph[node]) {
        if (!visited.has(neighbor)) {
          queue.push([...path, neighbor]); // Adiciona o vizinho ao caminho
        }
      }
    }
  }
  return null; // Se não encontrar o caminho
}

// function runSearch(algorithm) {
//   const start = document.getElementById('start').value;
//   const end = document.getElementById('end').value;
//   if (!validateInput(start, end)) return;
//   const result = algorithm(start, end);
//   document.getElementById('result').textContent = result ? result.join(' -> ') : "Caminho não encontrado";
// }

// Função para A*
function aStar(start, end) {
  if (!validateInput(start, end)) return null;

  const openSet = new Set([start]);
  const cameFrom = {};
  const gScore = {};
  const fScore = {};

  // Inicializa gScore e fScore corretamente
  for (const node in graph) {
    gScore[node] = Infinity;
    fScore[node] = Infinity;
  }
  gScore[start] = 0;
  fScore[start] = heuristic(start, end);

  while (openSet.size > 0) {
    let current = [...openSet].reduce((a, b) => (fScore[a] < fScore[b] ? a : b));

    if (current === end) return reconstructPath(cameFrom, current);

    openSet.delete(current);

    for (const neighbor in graph[current]) {
      const tentativeGScore = gScore[current] + graph[current][neighbor];

      if (tentativeGScore < gScore[neighbor]) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentativeGScore;
        fScore[neighbor] = gScore[neighbor] + heuristic(neighbor, end);

        if (!openSet.has(neighbor)) {
          openSet.add(neighbor);
        }
      }
    }
  }
  return null;
}

// Heurística (distância estimada)
function heuristic(a, b) {
  const heuristicValues = {
    Arad: 6,
    Zerind: 5,
    Oradea: 4,
    Sibiu: 3,
    Timisoara: 5,
    Lugoj: 4,
    Mehadia: 3,
    Drobeta: 2,
    Craiova: 1,
    RimnicuVilcea: 2,
    Fagaras: 1,
    Pitesti: 1,
    Bucharest: 0,
    Giurgiu: 1,
    Urziceni: 1,
    Hirsova: 2,
    Eforie: 3,
    Vaslui: 2,
    Iasi: 1,
    Neamt: 2,
  };
  return heuristicValues[a] || 0;
}

// Reconstruir caminho
function reconstructPath(cameFrom, current) {
  const path = [current];
  while (cameFrom[current]) {
    current = cameFrom[current];
    if (path.includes(current)) {
      console.error("Loop detectado no caminho.");
      return null;
    }
    path.unshift(current);
  }
  return path;
}

// Funções para exibir resultados
function runBFS() {
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;
  const result = bfs(start, end);
  document.getElementById("result").textContent = result
    ? result.join(" -> ")
    : "Caminho não encontrado";
}

function runDFS() {
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;
  const result = dfs(start, end);
  document.getElementById("result").textContent = result
    ? result.join(" -> ")
    : "Caminho não encontrado";
}

function runAStar() {
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;

  if (!validateInput(start, end)) return;

  const result = aStar(start, end);
  document.getElementById("result").textContent = result
    ? result.join(" -> ")
    : "Caminho não encontrado";
}

function runUCS() {
  runSearch(ucs);
}
function runDLS() {
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;
  const limit = parseInt(prompt("Digite o limite de profundidade:"), 10) || 3; // Limite padrão = 3
  const result = dls(start, end, limit);
  document.getElementById("result").textContent = result
    ? result.join(" -> ")
    : "Caminho não encontrado";
}
function runIDDFS() {
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;
  const maxDepth = parseInt(prompt("Digite o limite máximo de profundidade:"), 10) || 10; // Limite padrão = 10
  const result = iddfs(start, end, maxDepth);
  document.getElementById("result").textContent = result
    ? result.join(" -> ")
    : "Caminho não encontrado";
}
function runGreedy() {
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;
  const result = greedyBestFirstSearch(start, end);
  document.getElementById("result").textContent = result
    ? result.join(" -> ")
    : "Caminho não encontrado";
}
