class AlgorithmSimulator {
    constructor() {
        this.canvas = document.getElementById('algo-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentAlgorithm = null;
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 50;
        this.animationFrame = null;
        this.stats = { comparisons: 0, swaps: 0, operations: 0 };
        this.logEntries = [];
        this.maxLogEntries = 100;
        this.lastDrawTime = 0;
        this.animationDelay = 100;

        this.algorithms = {
            sorting: [
                { name: 'Bubble Sort', id: 'bubbleSort' },
                { name: 'Selection Sort', id: 'selectionSort' },
                { name: 'Insertion Sort', id: 'insertionSort' },
                { name: 'Merge Sort', id: 'mergeSort' },
                { name: 'Quick Sort', id: 'quickSort' },
                { name: 'Heap Sort', id: 'heapSort' },
                { name: 'Counting Sort', id: 'countingSort' },
                { name: 'Radix Sort', id: 'radixSort' }
            ],
            searching: [
                { name: 'Linear Search', id: 'linearSearch' },
                { name: 'Binary Search', id: 'binarySearch' },
                { name: 'Jump Search', id: 'jumpSearch' },
                { name: 'Exponential Search', id: 'exponentialSearch' },
                { name: 'Interpolation Search', id: 'interpolationSearch' }
            ],
            graph: [
                { name: 'BFS', id: 'bfs' },
                { name: 'DFS', id: 'dfs' },
                { name: "Dijkstra's Algorithm", id: 'dijkstra' },
                { name: "Bellman-Ford", id: 'bellmanFord' },
                { name: "Floyd-Warshall", id: 'floydWarshall' },
                { name: "Kruskal's Algorithm", id: 'kruskal' },
                { name: "Prim's Algorithm", id: 'prim' },
                { name: 'Topological Sort', id: 'topologicalSort' },
                { name: 'A* Search', id: 'astar' }
            ],
            dynamic: [
                { name: 'Fibonacci', id: 'fibonacci' },
                { name: 'Longest Common Subsequence', id: 'lcs' },
                { name: 'Knapsack Problem', id: 'knapsack' },
                { name: 'Matrix Chain Multiplication', id: 'matrixChain' },
                { name: 'Coin Change', id: 'coinChange' },
                { name: 'Edit Distance', id: 'editDistance' }
            ],
            tree: [
                { name: 'Binary Search Tree', id: 'bst' },
                { name: 'AVL Tree', id: 'avlTree' },
                { name: 'Red-Black Tree', id: 'redBlackTree' },
                { name: 'Tree Traversals', id: 'treeTraversals' },
                { name: 'Heap Operations', id: 'heapOps' },
                { name: 'Trie', id: 'trie' }
            ],
            string: [
                { name: 'Naive Pattern Search', id: 'naiveSearch' },
                { name: 'KMP Algorithm', id: 'kmp' },
                { name: 'Rabin-Karp', id: 'rabinKarp' },
                { name: 'Z Algorithm', id: 'zAlgorithm' },
                { name: "Manacher's Algorithm", id: 'manacher' }
            ]
        };

        this.data = [];
        this.arraySize = 30;
        this.targetIndex = -1;
        this.graph = null;
        this.tree = null;

        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.loadCategory('sorting');
        this.resetStats();
    }

    setupCanvas() {
        const container = document.getElementById('canvas-container');
        this.canvas.width = container.clientWidth - 48;
        this.canvas.height = 450;

        window.addEventListener('resize', () => {
            this.canvas.width = container.clientWidth - 48;
            this.canvas.height = 450;
            if (this.currentAlgorithm) this.draw();
        });
    }

    setupEventListeners() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.loadCategory(e.target.dataset.category);
            });
        });

        document.getElementById('start-btn').addEventListener('click', () => this.start());
        document.getElementById('pause-btn').addEventListener('click', () => this.pause());
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());

        document.getElementById('speed-slider').addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
        });
    }

    loadCategory(category) {
        const container = document.getElementById('algorithm-buttons');
        container.innerHTML = '';

        this.algorithms[category].forEach(algo => {
            const btn = document.createElement('button');
            btn.className = 'algo-btn';
            btn.textContent = algo.name;
            btn.dataset.id = algo.id;
            btn.addEventListener('click', () => this.selectAlgorithm(algo.id, algo.name, category));
            container.appendChild(btn);
        });
    }

    selectAlgorithm(algoId, algoName, category) {
        this.isRunning = false;
        this.isPaused = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`[data-id="${algoId}"]`).classList.add('active');

        this.currentAlgorithm = algoId;
        this.algorithmName = algoName;
        this.algorithmCategory = category;

        // Reset button state
        document.getElementById('start-btn').disabled = false;
        document.getElementById('pause-btn').textContent = '⏸ Pause';

        this.resetStats();
        this.initializeAlgorithm();
        this.updateDescription();
        this.updateCode();
    }

    initializeAlgorithm() {
        this.data = [];
        this.tree = null;
        this.fibSequence = null;
        this.lcsData = null;
        this.knapsackData = null;
        this.coinData = null;
        this.editData = null;
        this.matrixData = null;
        this.highlightIndices = [];
        this.compareIndices = [];
        this.foundIndex = -1;
        this.currentNode = null;
        this.currentEdge = null;
        this.path = [];

        switch (this.algorithmCategory) {
            case 'sorting':
            case 'searching':
                this.generateArray();
                break;
            case 'graph':
                this.generateGraph();
                break;
            case 'tree':
                this.generateTree();
                break;
            case 'dynamic':
                // DP algorithms initialize their own data during visualization; start with empty canvas
                break;
            case 'string':
                this.generateStringData();
                break;
        }

        this.draw();
    }

    generateArray(size = this.arraySize) {
        this.data = [];
        for (let i = 0; i < size; i++) {
            this.data.push(Math.floor(Math.random() * 300) + 20);
        }
        this.targetIndex = Math.floor(Math.random() * size);
    }

    generateGraph() {
        const nodes = 8;
        this.graph = { nodes: [], edges: [] };

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 60;

        for (let i = 0; i < nodes; i++) {
            const angle = (i * 2 * Math.PI) / nodes - Math.PI / 2;
            this.graph.nodes.push({
                id: i,
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
                value: Math.floor(Math.random() * 100),
                visited: false,
                distance: Infinity
            });
        }

        // Spanning path for connectivity
        for (let i = 0; i < nodes - 1; i++) {
            this.graph.edges.push({ from: i, to: i + 1, weight: Math.floor(Math.random() * 20) + 1 });
        }

        // Extra random edges
        for (let i = 0; i < nodes; i++) {
            const numExtra = Math.floor(Math.random() * 2);
            for (let j = 0; j < numExtra; j++) {
                const target = Math.floor(Math.random() * nodes);
                if (target !== i && Math.abs(target - i) > 1) {
                    const edge = { from: i, to: target, weight: Math.floor(Math.random() * 30) + 5 };
                    if (!this.graph.edges.some(e => e.from === edge.from && e.to === edge.to)) {
                        this.graph.edges.push(edge);
                    }
                }
            }
        }

        this.startNode = 0;
        this.endNode = nodes - 1;
    }

    generateTree() {
        this.tree = { nodes: [], edges: [] };
        const levels = 3;
        const centerX = this.canvas.width / 2;
        const levelHeight = this.canvas.height / (levels + 1);

        let nodeId = 0;
        for (let level = 0; level < levels; level++) {
            const nodesInLevel = Math.pow(2, level);
            const spacing = this.canvas.width / (nodesInLevel + 1);

            for (let i = 0; i < nodesInLevel; i++) {
                const x = spacing * (i + 1);
                const y = levelHeight * (level + 1);

                this.tree.nodes.push({
                    id: nodeId,
                    x, y,
                    value: Math.floor(Math.random() * 100),
                    visited: false,
                    level
                });

                if (level > 0) {
                    const parentId = Math.floor((nodeId - 1) / 2);
                    this.tree.edges.push({ from: parentId, to: nodeId });
                }
                nodeId++;
            }
        }
    }

    generateStringData() {
        const texts = [
            { text: "ALGORITHMS", pattern: "RITH" },
            { text: "VISUALIZATION", pattern: "SUAL" },
            { text: "COMPUTER SCIENCE", pattern: "TER" },
            { text: "DATA STRUCTURES", pattern: "STRUC" }
        ];
        const selected = texts[Math.floor(Math.random() * texts.length)];
        this.data = {
            text: selected.text.split(''),
            pattern: selected.pattern.split(''),
            textIndex: 0,
            patternIndex: 0
        };
    }

    updateDescription() {
        const descriptions = {
            bubbleSort: "Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
            selectionSort: "Selection Sort divides the input list into two parts: sorted and unsorted. It finds the minimum element from unsorted part and puts it at the beginning.",
            insertionSort: "Insertion Sort builds the final sorted array one item at a time by inserting each element into its correct position.",
            mergeSort: "Merge Sort is a divide-and-conquer algorithm that divides the array into halves, sorts them recursively, and then merges them.",
            quickSort: "Quick Sort picks a pivot element and partitions the array around the pivot, placing smaller elements before and larger after.",
            heapSort: "Heap Sort uses a binary heap data structure to sort elements. It builds a max heap and repeatedly extracts the maximum element.",
            countingSort: "Counting Sort counts occurrences of each unique element and uses arithmetic to determine positions in the sorted output.",
            radixSort: "Radix Sort sorts numbers digit by digit from least significant to most significant digit using counting sort as subroutine.",
            linearSearch: "Linear Search checks each element sequentially until the target is found or the end is reached.",
            binarySearch: "Binary Search efficiently finds a target by repeatedly dividing the sorted array in half.",
            jumpSearch: "Jump Search jumps ahead by fixed steps and performs linear search in the identified block.",
            exponentialSearch: "Exponential Search finds a range where the element may be present and does binary search in that range.",
            interpolationSearch: "Interpolation Search estimates the position of the target based on the values at the bounds.",
            bfs: "Breadth-First Search explores all neighbors at the current depth before moving to nodes at the next depth level.",
            dfs: "Depth-First Search explores as far as possible along each branch before backtracking.",
            dijkstra: "Dijkstra's Algorithm finds the shortest path from a source node to all other nodes in a weighted graph.",
            bellmanFord: "Bellman-Ford Algorithm finds shortest paths even with negative edge weights by relaxing all edges repeatedly.",
            floydWarshall: "Floyd-Warshall Algorithm finds shortest paths between all pairs of vertices using dynamic programming.",
            kruskal: "Kruskal's Algorithm finds the Minimum Spanning Tree by adding edges in increasing order of weight without forming cycles.",
            prim: "Prim's Algorithm builds the Minimum Spanning Tree by growing from a starting vertex.",
            topologicalSort: "Topological Sort orders vertices in a directed acyclic graph such that for every edge u→v, u comes before v.",
            astar: "A* Search finds the shortest path using heuristics to guide the search towards the goal.",
            fibonacci: "Fibonacci sequence where each number is the sum of the two preceding ones, visualized as a growing DP table.",
            lcs: "Longest Common Subsequence finds the longest subsequence present in both sequences.",
            knapsack: "Knapsack Problem maximizes value of items that can be carried in a knapsack with weight capacity.",
            matrixChain: "Matrix Chain Multiplication finds the optimal way to multiply a chain of matrices.",
            coinChange: "Coin Change finds the minimum number of coins needed to make a given amount.",
            editDistance: "Edit Distance finds the minimum operations to convert one string to another.",
            bst: "Binary Search Tree maintains ordered data where left child < parent < right child.",
            avlTree: "AVL Tree is a self-balancing BST where heights of subtrees differ by at most 1.",
            redBlackTree: "Red-Black Tree is a self-balancing BST with color properties ensuring balance.",
            treeTraversals: "Tree Traversals visit all nodes in different orders: Inorder, Preorder, Postorder, Level-order.",
            heapOps: "Heap Operations include insert, delete, and heapify maintaining the heap property.",
            trie: "Trie is a tree-like data structure for efficient string storage and retrieval.",
            naiveSearch: "Naive Pattern Search checks for pattern match at every position in the text.",
            kmp: "KMP Algorithm uses preprocessing to avoid unnecessary comparisons when pattern mismatch occurs.",
            rabinKarp: "Rabin-Karp uses hashing to find pattern matches efficiently.",
            zAlgorithm: "Z Algorithm finds all occurrences of a pattern in a text using Z-values.",
            manacher: "Manacher's Algorithm finds the longest palindromic substring in linear time."
        };

        document.getElementById('description').innerHTML = `
            <h3>${this.algorithmName}</h3>
            <p>${descriptions[this.currentAlgorithm] || 'Select an algorithm to see its description.'}</p>
            <p><strong>Time Complexity:</strong> ${this.getTimeComplexity()}</p>
            <p><strong>Space Complexity:</strong> ${this.getSpaceComplexity()}</p>
        `;
    }

    getTimeComplexity() {
        const complexities = {
            bubbleSort: "O(n²)", selectionSort: "O(n²)", insertionSort: "O(n²)",
            mergeSort: "O(n log n)", quickSort: "O(n log n) average, O(n²) worst",
            heapSort: "O(n log n)", countingSort: "O(n + k)", radixSort: "O(d·n)",
            linearSearch: "O(n)", binarySearch: "O(log n)", jumpSearch: "O(√n)",
            exponentialSearch: "O(log n)", interpolationSearch: "O(log log n) average",
            bfs: "O(V + E)", dfs: "O(V + E)", dijkstra: "O((V + E) log V)",
            bellmanFord: "O(V·E)", floydWarshall: "O(V³)", kruskal: "O(E log E)",
            prim: "O((V + E) log V)", topologicalSort: "O(V + E)", astar: "O(b^d)",
            fibonacci: "O(n)", lcs: "O(m·n)", knapsack: "O(n·W)",
            matrixChain: "O(n³)", coinChange: "O(n·amount)", editDistance: "O(m·n)",
            bst: "O(log n) average, O(n) worst", avlTree: "O(log n)",
            redBlackTree: "O(log n)", treeTraversals: "O(n)", heapOps: "O(log n)",
            trie: "O(m)", naiveSearch: "O(m·n)", kmp: "O(m + n)",
            rabinKarp: "O(m + n) average", zAlgorithm: "O(m + n)", manacher: "O(n)"
        };
        return complexities[this.currentAlgorithm] || "N/A";
    }

    getSpaceComplexity() {
        const complexities = {
            bubbleSort: "O(1)", selectionSort: "O(1)", insertionSort: "O(1)",
            mergeSort: "O(n)", quickSort: "O(log n)", heapSort: "O(1)",
            countingSort: "O(k)", radixSort: "O(n + k)",
            linearSearch: "O(1)", binarySearch: "O(1)", jumpSearch: "O(1)",
            exponentialSearch: "O(1)", interpolationSearch: "O(1)",
            bfs: "O(V)", dfs: "O(V)", dijkstra: "O(V)",
            bellmanFord: "O(V)", floydWarshall: "O(V²)", kruskal: "O(V + E)",
            prim: "O(V)", topologicalSort: "O(V)", astar: "O(b^d)",
            fibonacci: "O(n)", lcs: "O(m·n)", knapsack: "O(n·W)",
            matrixChain: "O(n²)", coinChange: "O(amount)", editDistance: "O(m·n)",
            bst: "O(n)", avlTree: "O(n)", redBlackTree: "O(n)",
            treeTraversals: "O(n)", heapOps: "O(n)", trie: "O(m·n)",
            naiveSearch: "O(1)", kmp: "O(m)", rabinKarp: "O(1)",
            zAlgorithm: "O(m + n)", manacher: "O(n)"
        };
        return complexities[this.currentAlgorithm] || "N/A";
    }

    updateCode() {
        const codes = {
            bubbleSort: `function bubbleSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }
        if (!swapped) break; // Early termination
    }
    return arr;
}`,
            selectionSort: `function selectionSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        if (minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        }
    }
    return arr;
}`,
            insertionSort: `function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        let key = arr[i], j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}`,
            mergeSort: `function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    let mid = Math.floor(arr.length / 2);
    return merge(mergeSort(arr.slice(0, mid)), mergeSort(arr.slice(mid)));
}
function merge(left, right) {
    let result = [], i = 0, j = 0;
    while (i < left.length && j < right.length) {
        result.push(left[i] <= right[j] ? left[i++] : right[j++]);
    }
    return result.concat(left.slice(i)).concat(right.slice(j));
}`,
            quickSort: `function quickSort(arr, lo = 0, hi = arr.length - 1) {
    if (lo < hi) {
        let pi = partition(arr, lo, hi);
        quickSort(arr, lo, pi - 1);
        quickSort(arr, pi + 1, hi);
    }
    return arr;
}
function partition(arr, lo, hi) {
    let pivot = arr[hi], i = lo - 1;
    for (let j = lo; j < hi; j++) {
        if (arr[j] < pivot) [arr[++i], arr[j]] = [arr[j], arr[i]];
    }
    [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
    return i + 1;
}`,
            heapSort: `function heapSort(arr) {
    let n = arr.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(arr, n, i);
    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        heapify(arr, i, 0);
    }
    return arr;
}
function heapify(arr, n, i) {
    let largest = i, l = 2*i+1, r = 2*i+2;
    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;
    if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        heapify(arr, n, largest);
    }
}`,
            countingSort: `function countingSort(arr) {
    let max = Math.max(...arr);
    let count = new Array(max + 1).fill(0);
    for (let n of arr) count[n]++;
    let idx = 0;
    for (let i = 0; i <= max; i++) {
        while (count[i]-- > 0) arr[idx++] = i;
    }
    return arr;
}`,
            radixSort: `function radixSort(arr) {
    let max = Math.max(...arr);
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        countByDigit(arr, exp);
    }
    return arr;
}
function countByDigit(arr, exp) {
    let n = arr.length, output = new Array(n), count = new Array(10).fill(0);
    for (let i = 0; i < n; i++) count[Math.floor(arr[i] / exp) % 10]++;
    for (let i = 1; i < 10; i++) count[i] += count[i - 1];
    for (let i = n - 1; i >= 0; i--) {
        let d = Math.floor(arr[i] / exp) % 10;
        output[--count[d]] = arr[i];
    }
    for (let i = 0; i < n; i++) arr[i] = output[i];
}`,
            linearSearch: `function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) return i;
    }
    return -1;
}`,
            binarySearch: `function binarySearch(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        let mid = (left + right) >> 1;
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
            bfs: `function BFS(graph, start) {
    let visited = new Set([start]);
    let queue = [start], result = [];
    while (queue.length > 0) {
        let node = queue.shift();
        result.push(node);
        for (let neighbor of graph[node]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }
    return result;
}`,
            dfs: `function DFS(graph, node, visited = new Set(), result = []) {
    visited.add(node);
    result.push(node);
    for (let neighbor of graph[node]) {
        if (!visited.has(neighbor)) DFS(graph, neighbor, visited, result);
    }
    return result;
}`,
            dijkstra: `function dijkstra(graph, start) {
    let dist = {}, prev = {}, pq = [[0, start]];
    for (let n in graph) dist[n] = Infinity;
    dist[start] = 0;
    while (pq.length) {
        let [d, u] = pq.shift();
        if (d > dist[u]) continue;
        for (let [v, w] of graph[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                prev[v] = u;
                pq.push([dist[v], v]);
                pq.sort((a,b) => a[0]-b[0]);
            }
        }
    }
    return { dist, prev };
}`,
            fibonacci: `function fibonacci(n) {
    let dp = [0, 1];
    for (let i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];
    return dp[n];
}`,
            lcs: `function LCS(s1, s2) {
    let m = s1.length, n = s2.length;
    let dp = Array.from({length: m+1}, () => Array(n+1).fill(0));
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            dp[i][j] = s1[i-1]===s2[j-1] ? dp[i-1][j-1]+1 : Math.max(dp[i-1][j], dp[i][j-1]);
    return dp[m][n];
}`,
            knapsack: `function knapsack(w, v, cap) {
    let n = w.length;
    let dp = Array.from({length: n+1}, () => Array(cap+1).fill(0));
    for (let i = 1; i <= n; i++)
        for (let c = 0; c <= cap; c++)
            dp[i][c] = w[i-1] <= c
                ? Math.max(dp[i-1][c], v[i-1] + dp[i-1][c-w[i-1]])
                : dp[i-1][c];
    return dp[n][cap];
}`,
            kmp: `function KMP(text, pattern) {
    let lps = computeLPS(pattern), matches = [], j = 0;
    for (let i = 0; i < text.length; i++) {
        while (j > 0 && text[i] !== pattern[j]) j = lps[j-1];
        if (text[i] === pattern[j]) j++;
        if (j === pattern.length) { matches.push(i-j+1); j = lps[j-1]; }
    }
    return matches;
}
function computeLPS(p) {
    let lps = [0], len = 0, i = 1;
    while (i < p.length) {
        if (p[i] === p[len]) { lps[i++] = ++len; }
        else if (len) { len = lps[len-1]; }
        else { lps[i++] = 0; }
    }
    return lps;
}`
        };

        document.getElementById('algorithm-code').textContent = codes[this.currentAlgorithm] || '// Code will be displayed here';
    }

    resetStats() {
        this.stats = { comparisons: 0, swaps: 0, operations: 0 };
        this.logEntries = [];
        this.updateStatsDisplay();
        this.clearLog();
    }

    updateStatsDisplay() {
        let parts = [];
        if (this.stats.comparisons > 0) parts.push(`Comparisons: ${this.stats.comparisons}`);
        if (this.stats.swaps > 0) parts.push(`Swaps: ${this.stats.swaps}`);
        if (this.stats.operations > 0) parts.push(`Operations: ${this.stats.operations}`);
        document.getElementById('stats').textContent = parts.join(' | ') || 'Ready';
    }

    addLog(message, type = 'normal') {
        const timestamp = new Date().toLocaleTimeString();
        this.logEntries.push({ message, type, timestamp });
        if (this.logEntries.length > this.maxLogEntries) this.logEntries.shift();
        this.updateLogDisplay();
    }

    updateLogDisplay() {
        const logContainer = document.getElementById('simulation-log');
        if (!logContainer) return;
        logContainer.innerHTML = this.logEntries.map(entry =>
            `<div class="log-entry ${entry.type}">[${entry.timestamp}] ${entry.message}</div>`
        ).join('');
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    clearLog() {
        const logContainer = document.getElementById('simulation-log');
        if (logContainer) logContainer.innerHTML = '';
    }

    waitForResume() {
        return new Promise(resolve => {
            const check = () => {
                if (!this.isPaused) resolve();
                else setTimeout(check, 100);
            };
            check();
        });
    }

    async start() {
        if (!this.currentAlgorithm) {
            alert('Please select an algorithm first!');
            return;
        }
        if (this.isRunning && !this.isPaused) return;

        this.isRunning = true;
        this.isPaused = false;
        document.getElementById('start-btn').disabled = true;

        this.addLog(`Starting ${this.algorithmName} simulation...`, 'highlight');

        try {
            await this.runAlgorithm();
            if (this.isRunning) this.addLog('Simulation completed!', 'success');
        } catch (error) {
            if (this.isRunning) {
                console.error('Algorithm error:', error);
                this.addLog(`Error: ${error.message}`, 'error');
            }
        }

        this.isRunning = false;
        document.getElementById('start-btn').disabled = false;
    }

    pause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pause-btn').textContent = this.isPaused ? '▶ Resume' : '⏸ Pause';
        this.addLog(this.isPaused ? 'Simulation paused' : 'Simulation resumed', 'highlight');
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        document.getElementById('pause-btn').textContent = '⏸ Pause';
        document.getElementById('start-btn').disabled = false;

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        this.fibSequence = null;
        this.lcsData = null;
        this.knapsackData = null;
        this.coinData = null;
        this.editData = null;
        this.matrixData = null;
        this.highlightIndices = [];
        this.compareIndices = [];
        this.foundIndex = -1;
        this.currentNode = null;
        this.currentEdge = null;
        this.path = [];

        if (this.graph && this.graph.nodes) {
            this.graph.nodes.forEach(node => {
                node.visited = false;
                node.distance = Infinity;
                node.previous = null;
                node.inQueue = false;
                node.inStack = false;
                node.finalized = false;
            });
        }

        this.addLog('Simulation reset', 'normal');

        if (this.currentAlgorithm) {
            this.initializeAlgorithm();
        }
    }

    async runAlgorithm() {
        switch (this.currentAlgorithm) {
            case 'bubbleSort': await this.bubbleSort(); break;
            case 'selectionSort': await this.selectionSort(); break;
            case 'insertionSort': await this.insertionSort(); break;
            case 'mergeSort': await this.mergeSort(0, this.data.length - 1); break;
            case 'quickSort': await this.quickSort(0, this.data.length - 1); break;
            case 'heapSort': await this.heapSort(); break;
            case 'countingSort': await this.countingSort(); break;
            case 'radixSort': await this.radixSort(); break;
            case 'linearSearch': await this.linearSearch(); break;
            case 'binarySearch': await this.binarySearch(); break;
            case 'jumpSearch': await this.jumpSearch(); break;
            case 'exponentialSearch': await this.exponentialSearch(); break;
            case 'interpolationSearch': await this.interpolationSearch(); break;
            case 'bfs': await this.runBFS(); break;
            case 'dfs': await this.runDFS(); break;
            case 'dijkstra': await this.runDijkstra(); break;
            case 'bellmanFord': await this.runBellmanFord(); break;
            case 'floydWarshall': await this.runFloydWarshall(); break;
            case 'kruskal': await this.runKruskal(); break;
            case 'prim': await this.runPrim(); break;
            case 'topologicalSort': await this.runTopologicalSort(); break;
            case 'astar': await this.runAStar(); break;
            case 'fibonacci': await this.visualizeFibonacci(); break;
            case 'lcs': await this.visualizeLCS(); break;
            case 'knapsack': await this.visualizeKnapsack(); break;
            case 'coinChange': await this.visualizeCoinChange(); break;
            case 'editDistance': await this.visualizeEditDistance(); break;
            case 'matrixChain': await this.visualizeMatrixChain(); break;
            case 'bst': await this.visualizeBST(); break;
            case 'avlTree': await this.visualizeAVL(); break;
            case 'redBlackTree': await this.visualizeRedBlack(); break;
            case 'treeTraversals': await this.visualizeTreeTraversals(); break;
            case 'heapOps': await this.visualizeHeapOps(); break;
            case 'trie': await this.visualizeTrie(); break;
            case 'naiveSearch': await this.naiveSearch(); break;
            case 'kmp': await this.kmpSearch(); break;
            case 'rabinKarp': await this.rabinKarpSearch(); break;
            case 'zAlgorithm': await this.zAlgorithmSearch(); break;
            case 'manacher': await this.manacherSearch(); break;
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms * (101 - this.speed) / 10));
    }

    // ─── Sorting ──────────────────────────────────────────────────────────────

    async bubbleSort() {
        const n = this.data.length;
        this.addLog(`Bubble Sort on ${n} elements`, 'normal');

        for (let i = 0; i < n - 1; i++) {
            let swapped = false;
            for (let j = 0; j < n - i - 1; j++) {
                if (!this.isRunning) return;
                if (this.isPaused) await this.waitForResume();
                this.stats.comparisons++;
                this.highlightIndices = [j, j + 1];
                this.draw();
                if (this.data[j] > this.data[j + 1]) {
                    this.stats.swaps++;
                    this.addLog(`Swap: ${this.data[j]} ↔ ${this.data[j + 1]}`, 'normal');
                    [this.data[j], this.data[j + 1]] = [this.data[j + 1], this.data[j]];
                    swapped = true;
                    this.draw();
                }
                await this.sleep(50);
            }
            this.updateStatsDisplay();
            if (!swapped) { this.addLog('Early termination — sorted!', 'success'); break; }
        }
        this.highlightIndices = [];
        this.draw();
        this.addLog('Bubble Sort done!', 'success');
    }

    async selectionSort() {
        const n = this.data.length;
        this.addLog(`Selection Sort on ${n} elements`, 'normal');
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            for (let j = i + 1; j < n; j++) {
                if (!this.isRunning) return;
                if (this.isPaused) await this.waitForResume();
                this.stats.comparisons++;
                this.highlightIndices = [minIdx, j];
                this.draw();
                if (this.data[j] < this.data[minIdx]) { minIdx = j; this.addLog(`New min: ${this.data[minIdx]} at ${minIdx}`, 'highlight'); }
                await this.sleep(30);
            }
            if (minIdx !== i) {
                this.stats.swaps++;
                [this.data[i], this.data[minIdx]] = [this.data[minIdx], this.data[i]];
                this.draw();
                await this.sleep(50);
            }
            this.updateStatsDisplay();
        }
        this.highlightIndices = [];
        this.draw();
        this.addLog('Selection Sort done!', 'success');
    }

    async insertionSort() {
        const n = this.data.length;
        this.addLog(`Insertion Sort on ${n} elements`, 'normal');
        for (let i = 1; i < n; i++) {
            let key = this.data[i], j = i - 1;
            this.highlightIndices = [i];
            this.draw();
            await this.sleep(50);
            while (j >= 0) {
                if (!this.isRunning) return;
                if (this.isPaused) await this.waitForResume();
                this.stats.comparisons++;
                this.highlightIndices = [j, j + 1];
                this.draw();
                if (this.data[j] > key) {
                    this.stats.swaps++;
                    this.data[j + 1] = this.data[j];
                    j--;
                    this.draw();
                    await this.sleep(50);
                } else break;
            }
            this.data[j + 1] = key;
            this.draw();
            this.updateStatsDisplay();
        }
        this.highlightIndices = [];
        this.draw();
        this.addLog('Insertion Sort done!', 'success');
    }

    async mergeSort(left, right) {
        if (!this.isRunning) return;
        if (left >= right) return;
        const mid = Math.floor((left + right) / 2);
        await this.mergeSort(left, mid);
        await this.mergeSort(mid + 1, right);
        await this.merge(left, mid, right);
    }

    async merge(left, mid, right) {
        const leftArr = this.data.slice(left, mid + 1);
        const rightArr = this.data.slice(mid + 1, right + 1);
        let i = 0, j = 0, k = left;
        while (i < leftArr.length && j < rightArr.length) {
            if (!this.isRunning) return;
            if (this.isPaused) await this.waitForResume();
            this.stats.comparisons++;
            this.highlightIndices = [k];
            this.data[k++] = leftArr[i] <= rightArr[j] ? leftArr[i++] : rightArr[j++];
            this.stats.swaps++;
            this.draw();
            await this.sleep(50);
        }
        while (i < leftArr.length) { this.data[k++] = leftArr[i++]; this.stats.swaps++; this.draw(); await this.sleep(30); }
        while (j < rightArr.length) { this.data[k++] = rightArr[j++]; this.stats.swaps++; this.draw(); await this.sleep(30); }
        this.updateStatsDisplay();
    }

    async quickSort(low, high) {
        if (!this.isRunning) return;
        if (low < high) {
            const pi = await this.partition(low, high);
            await this.quickSort(low, pi - 1);
            await this.quickSort(pi + 1, high);
        }
    }

    async partition(low, high) {
        const pivot = this.data[high];
        let i = low - 1;
        this.highlightIndices = [high];
        for (let j = low; j < high; j++) {
            if (!this.isRunning) return i + 1;
            if (this.isPaused) await this.waitForResume();
            this.stats.comparisons++;
            this.highlightIndices = [j, high];
            this.draw();
            await this.sleep(50);
            if (this.data[j] < pivot) {
                i++;
                this.stats.swaps++;
                [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
                this.draw();
                await this.sleep(50);
            }
        }
        this.stats.swaps++;
        [this.data[i + 1], this.data[high]] = [this.data[high], this.data[i + 1]];
        this.draw();
        this.updateStatsDisplay();
        return i + 1;
    }

    async heapSort() {
        const n = this.data.length;
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await this.heapify(n, i);
        for (let i = n - 1; i > 0; i--) {
            if (!this.isRunning) return;
            if (this.isPaused) await this.waitForResume();
            this.stats.swaps++;
            [this.data[0], this.data[i]] = [this.data[i], this.data[0]];
            this.highlightIndices = [0, i];
            this.draw();
            await this.sleep(50);
            await this.heapify(i, 0);
            this.updateStatsDisplay();
        }
        this.highlightIndices = [];
        this.draw();
        this.addLog('Heap Sort done!', 'success');
    }

    async heapify(n, i) {
        let largest = i, l = 2 * i + 1, r = 2 * i + 2;
        if (!this.isRunning) return;
        if (this.isPaused) await this.waitForResume();
        this.highlightIndices = [i, l, r].filter(x => x < n);
        this.draw();
        await this.sleep(40);
        if (l < n) { this.stats.comparisons++; if (this.data[l] > this.data[largest]) largest = l; }
        if (r < n) { this.stats.comparisons++; if (this.data[r] > this.data[largest]) largest = r; }
        if (largest !== i) {
            this.stats.swaps++;
            [this.data[i], this.data[largest]] = [this.data[largest], this.data[i]];
            this.draw();
            await this.sleep(40);
            await this.heapify(n, largest);
        }
    }

    async countingSort() {
        const max = Math.max(...this.data);
        const count = new Array(max + 1).fill(0);
        for (const n of this.data) { count[n]++; this.stats.operations++; }
        let idx = 0;
        for (let i = 0; i <= max; i++) {
            while (count[i] > 0) {
                if (!this.isRunning) return;
                if (this.isPaused) await this.waitForResume();
                this.data[idx++] = i;
                count[i]--;
                this.stats.operations++;
                this.highlightIndices = [idx - 1];
                this.draw();
                await this.sleep(30);
            }
        }
        this.updateStatsDisplay();
        this.highlightIndices = [];
        this.draw();
        this.addLog('Counting Sort done!', 'success');
    }

    async radixSort() {
        const max = Math.max(...this.data);
        for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
            await this.countingSortByDigit(exp);
        }
        this.addLog('Radix Sort done!', 'success');
    }

    async countingSortByDigit(exp) {
        const n = this.data.length;
        const output = new Array(n);
        const count = new Array(10).fill(0);
        for (let i = 0; i < n; i++) count[Math.floor(this.data[i] / exp) % 10]++;
        for (let i = 1; i < 10; i++) count[i] += count[i - 1];
        for (let i = n - 1; i >= 0; i--) {
            if (!this.isRunning) return;
            if (this.isPaused) await this.waitForResume();
            const d = Math.floor(this.data[i] / exp) % 10;
            output[--count[d]] = this.data[i];
        }
        for (let i = 0; i < n; i++) {
            this.data[i] = output[i];
            this.highlightIndices = [i];
            this.draw();
            await this.sleep(20);
        }
        this.updateStatsDisplay();
    }

    // ─── Searching ────────────────────────────────────────────────────────────

    async linearSearch() {
        const target = this.data[this.targetIndex];
        this.addLog(`Linear Search for value ${target}`, 'normal');
        for (let i = 0; i < this.data.length; i++) {
            if (!this.isRunning) return;
            if (this.isPaused) await this.waitForResume();
            this.stats.comparisons++;
            this.highlightIndices = [i];
            this.draw();
            this.updateStatsDisplay();
            if (this.data[i] === target) {
                this.foundIndex = i;
                this.draw();
                this.addLog(`Found ${target} at index ${i}!`, 'success');
                return;
            }
            await this.sleep(100);
        }
        this.addLog('Element not found', 'error');
    }

    async binarySearch() {
        this.data.sort((a, b) => a - b);
        this.draw();
        await this.sleep(500);
        const target = this.data[this.targetIndex];
        let left = 0, right = this.data.length - 1;
        this.addLog(`Binary Search for ${target} in sorted array`, 'normal');
        while (left <= right) {
            if (!this.isRunning) return;
            if (this.isPaused) await this.waitForResume();
            const mid = (left + right) >> 1;
            this.stats.comparisons++;
            this.highlightIndices = [left, mid, right];
            this.draw();
            this.updateStatsDisplay();
            if (this.data[mid] === target) { this.foundIndex = mid; this.draw(); this.addLog(`Found at index ${mid}!`, 'success'); return; }
            else if (this.data[mid] < target) { this.addLog(`${this.data[mid]} < ${target}, go right`, 'normal'); left = mid + 1; }
            else { this.addLog(`${this.data[mid]} > ${target}, go left`, 'normal'); right = mid - 1; }
            await this.sleep(100);
        }
        this.addLog('Not found', 'error');
    }

    async jumpSearch() {
        this.data.sort((a, b) => a - b);
        this.draw();
        await this.sleep(500);
        const n = this.data.length, step = Math.floor(Math.sqrt(n));
        const target = this.data[this.targetIndex];
        let prev = 0;
        this.addLog(`Jump Search for ${target}, step=${step}`, 'normal');
        while (prev < n && this.data[Math.min(step, n) - 1] < target) {
            if (!this.isRunning) return;
            if (this.isPaused) await this.waitForResume();
            prev = step; step += Math.floor(Math.sqrt(n));
            this.highlightIndices = [prev - 1];
            this.stats.comparisons++;
            this.draw();
            this.updateStatsDisplay();
            await this.sleep(100);
            if (prev >= n) return;
        }
        while (prev < n && this.data[prev] < target) {
            if (!this.isRunning) return;
            if (this.isPaused) await this.waitForResume();
            this.highlightIndices = [prev];
            this.stats.comparisons++;
            this.draw();
            this.updateStatsDisplay();
            await this.sleep(100);
            prev++;
        }
        if (prev < n && this.data[prev] === target) {
            this.foundIndex = prev; this.draw();
            this.addLog(`Found at index ${prev}!`, 'success');
        } else {
            this.addLog('Not found', 'error');
        }
    }

    async exponentialSearch() {
        this.data.sort((a, b) => a - b);
        this.draw();
        await this.sleep(500);
        const target = this.data[this.targetIndex], n = this.data.length;
        if (this.data[0] === target) { this.foundIndex = 0; this.draw(); this.addLog('Found at index 0!', 'success'); return; }
        let i = 1;
        while (i < n && this.data[i] <= target) {
            if (!this.isRunning) return;
            if (this.isPaused) await this.waitForResume();
            this.highlightIndices = [i]; this.stats.comparisons++; this.draw(); this.updateStatsDisplay();
            await this.sleep(100);
            i *= 2;
        }
        let left = Math.floor(i / 2), right = Math.min(i, n - 1);
        while (left <= right) {
            if (!this.isRunning) return;
            if (this.isPaused) await this.waitForResume();
            const mid = (left + right) >> 1;
            this.stats.comparisons++;
            this.highlightIndices = [left, mid, right];
            this.draw();
            this.updateStatsDisplay();
            await this.sleep(100);
            if (this.data[mid] === target) { this.foundIndex = mid; this.draw(); this.addLog(`Found at ${mid}!`, 'success'); return; }
            else if (this.data[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        this.addLog('Not found', 'error');
    }

    async interpolationSearch() {
        this.data.sort((a, b) => a - b);
        this.draw();
        await this.sleep(500);
        const target = this.data[this.targetIndex];
        let lo = 0, hi = this.data.length - 1;
        this.addLog(`Interpolation Search for ${target}`, 'normal');
        while (lo <= hi && target >= this.data[lo] && target <= this.data[hi]) {
            if (!this.isRunning) return;
            if (this.isPaused) await this.waitForResume();
            const pos = lo + Math.floor(((target - this.data[lo]) * (hi - lo)) / (this.data[hi] - this.data[lo]));
            this.stats.comparisons++;
            this.highlightIndices = [lo, pos, hi];
            this.draw();
            this.updateStatsDisplay();
            await this.sleep(100);
            if (this.data[pos] === target) { this.foundIndex = pos; this.draw(); this.addLog(`Found at ${pos}!`, 'success'); return; }
            if (this.data[pos] < target) lo = pos + 1;
            else hi = pos - 1;
        }
        this.addLog('Not found', 'error');
    }

    // ─── Graph ────────────────────────────────────────────────────────────────

    async runBFS() {
        if (!this.graph) return;
        const visited = new Set([0]);
        const queue = [0];
        this.graph.nodes[0].visited = true;
        this.addLog('BFS from node 0', 'normal');
        this.draw();
        await this.sleep(500);
        while (queue.length > 0 && this.isRunning) {
            if (this.isPaused) await this.waitForResume();
            const current = queue.shift();
            this.stats.operations++;
            this.addLog(`Visit node ${current}`, 'normal');
            this.updateStatsDisplay();
            for (const edge of this.graph.edges.filter(e => e.from === current)) {
                if (!visited.has(edge.to) && this.isRunning) {
                    visited.add(edge.to);
                    this.graph.nodes[edge.to].visited = true;
                    this.currentEdge = edge;
                    this.addLog(`Enqueue ${edge.to} via edge ${current}→${edge.to}`, 'highlight');
                    this.draw();
                    await this.sleep(500);
                    queue.push(edge.to);
                }
            }
        }
        this.addLog('BFS complete!', 'success');
    }

    async runDFS() {
        if (!this.graph) return;
        this.addLog('DFS from node 0', 'normal');
        const visited = new Set();
        await this.dfsVisit(0, visited);
        this.addLog('DFS complete!', 'success');
    }

    async dfsVisit(node, visited) {
        if (!this.isRunning) return;
        if (this.isPaused) await this.waitForResume();
        visited.add(node);
        this.graph.nodes[node].visited = true;
        this.stats.operations++;
        this.addLog(`Visit node ${node}`, 'normal');
        this.updateStatsDisplay();
        this.draw();
        await this.sleep(500);
        for (const edge of this.graph.edges.filter(e => e.from === node)) {
            if (!visited.has(edge.to) && this.isRunning) {
                this.currentEdge = edge;
                await this.dfsVisit(edge.to, visited);
            }
        }
    }

    async runDijkstra() {
        if (!this.graph) return;
        const dist = this.graph.nodes.map(() => Infinity);
        dist[0] = 0;
        const visited = new Set();
        const pq = [{ node: 0, dist: 0 }];
        this.addLog("Dijkstra from node 0", 'normal');
        while (pq.length > 0 && this.isRunning) {
            if (this.isPaused) await this.waitForResume();
            pq.sort((a, b) => a.dist - b.dist);
            const { node } = pq.shift();
            if (visited.has(node)) continue;
            visited.add(node);
            this.currentNode = node;
            this.graph.nodes[node].distance = dist[node];
            this.draw();
            this.stats.operations++;
            this.updateStatsDisplay();
            await this.sleep(400);
            for (const edge of this.graph.edges.filter(e => e.from === node)) {
                if (!visited.has(edge.to) && this.isRunning) {
                    this.currentEdge = edge;
                    const nd = dist[node] + edge.weight;
                    if (nd < dist[edge.to]) {
                        dist[edge.to] = nd;
                        this.graph.nodes[edge.to].distance = nd;
                        pq.push({ node: edge.to, dist: nd });
                        this.draw();
                        await this.sleep(200);
                    }
                }
            }
        }
        this.addLog("Dijkstra complete!", 'success');
    }

    async runBellmanFord() {
        if (!this.graph) return;
        const dist = this.graph.nodes.map(() => Infinity);
        dist[0] = 0;
        this.addLog("Bellman-Ford from node 0", 'normal');
        for (let i = 0; i < this.graph.nodes.length - 1 && this.isRunning; i++) {
            if (this.isPaused) await this.waitForResume();
            let updated = false;
            for (const edge of this.graph.edges) {
                if (!this.isRunning) return;
                this.currentEdge = edge;
                if (dist[edge.from] !== Infinity && dist[edge.from] + edge.weight < dist[edge.to]) {
                    dist[edge.to] = dist[edge.from] + edge.weight;
                    this.graph.nodes[edge.to].distance = dist[edge.to];
                    updated = true;
                    this.stats.operations++;
                    this.updateStatsDisplay();
                    this.draw();
                    await this.sleep(150);
                }
            }
            if (!updated) break;
        }
        this.addLog("Bellman-Ford complete!", 'success');
    }

    async runFloydWarshall() {
        if (!this.graph) return;
        const n = this.graph.nodes.length;
        const dist = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 0 : Infinity));
        for (const e of this.graph.edges) dist[e.from][e.to] = e.weight;
        this.addLog("Floyd-Warshall", 'normal');
        for (let k = 0; k < n && this.isRunning; k++) {
            if (this.isPaused) await this.waitForResume();
            this.currentNode = k;
            this.draw();
            await this.sleep(300);
            for (let i = 0; i < n && this.isRunning; i++) {
                for (let j = 0; j < n && this.isRunning; j++) {
                    if (dist[i][k] !== Infinity && dist[k][j] !== Infinity && dist[i][k] + dist[k][j] < dist[i][j]) {
                        dist[i][j] = dist[i][k] + dist[k][j];
                        this.stats.operations++;
                        this.updateStatsDisplay();
                        this.draw();
                        await this.sleep(50);
                    }
                }
            }
        }
        this.addLog("Floyd-Warshall complete!", 'success');
    }

    async runKruskal() {
        if (!this.graph) return;
        const edges = [...this.graph.edges].sort((a, b) => a.weight - b.weight);
        const parent = this.graph.nodes.map((_, i) => i);
        const find = (x) => { if (parent[x] !== x) parent[x] = find(parent[x]); return parent[x]; };
        const union = (x, y) => { const [px, py] = [find(x), find(y)]; if (px !== py) { parent[px] = py; return true; } return false; };
        const mst = [];
        this.addLog("Kruskal's MST", 'normal');
        for (const edge of edges) {
            if (!this.isRunning) return;
            if (this.isPaused) await this.waitForResume();
            this.currentEdge = edge;
            this.draw();
            if (union(edge.from, edge.to)) {
                mst.push(edge);
                this.stats.operations++;
                this.updateStatsDisplay();
                this.addLog(`Added edge ${edge.from}→${edge.to} (w:${edge.weight})`, 'highlight');
                await this.sleep(400);
            } else {
                await this.sleep(200);
            }
            if (mst.length === this.graph.nodes.length - 1) break;
        }
        this.addLog("Kruskal's complete!", 'success');
    }

    async runPrim() {
        if (!this.graph) return;
        const visited = new Set([0]);
        this.graph.nodes[0].visited = true;
        const pq = [...this.graph.edges.filter(e => e.from === 0)];
        this.addLog("Prim's MST from node 0", 'normal');
        while (pq.length > 0 && this.isRunning && visited.size < this.graph.nodes.length) {
            if (this.isPaused) await this.waitForResume();
            pq.sort((a, b) => a.weight - b.weight);
            const edge = pq.shift();
            this.currentEdge = edge;
            if (!visited.has(edge.to)) {
                visited.add(edge.to);
                this.graph.nodes[edge.to].visited = true;
                this.stats.operations++;
                this.updateStatsDisplay();
                this.addLog(`Add node ${edge.to} (w:${edge.weight})`, 'highlight');
                this.draw();
                await this.sleep(400);
                pq.push(...this.graph.edges.filter(e => e.from === edge.to && !visited.has(e.to)));
            } else {
                await this.sleep(200);
            }
        }
        this.addLog("Prim's complete!", 'success');
    }

    async runTopologicalSort() {
        if (!this.graph) return;
        const inDeg = this.graph.nodes.map(() => 0);
        for (const e of this.graph.edges) inDeg[e.to]++;
        const queue = this.graph.nodes.map((_, i) => i).filter(i => inDeg[i] === 0);
        const result = [];
        this.addLog("Topological Sort", 'normal');
        while (queue.length > 0 && this.isRunning) {
            if (this.isPaused) await this.waitForResume();
            const node = queue.shift();
            this.currentNode = node;
            this.graph.nodes[node].visited = true;
            result.push(node);
            this.stats.operations++;
            this.updateStatsDisplay();
            this.draw();
            await this.sleep(400);
            for (const edge of this.graph.edges.filter(e => e.from === node)) {
                if (this.isRunning) {
                    inDeg[edge.to]--;
                    if (inDeg[edge.to] === 0) queue.push(edge.to);
                    this.currentEdge = edge;
                    this.draw();
                    await this.sleep(150);
                }
            }
        }
        this.addLog(`Order: [${result.join(' → ')}]`, 'success');
    }

    async runAStar() {
        if (!this.graph) return;
        const goal = this.graph.nodes.length - 1;
        const openSet = [{ node: 0, g: 0, h: 0, f: 0 }];
        const gScore = this.graph.nodes.map(() => Infinity);
        gScore[0] = 0;
        const h = (a, b) => {
            const [na, nb] = [this.graph.nodes[a], this.graph.nodes[b]];
            return Math.hypot(na.x - nb.x, na.y - nb.y);
        };
        this.addLog(`A* from 0 to ${goal}`, 'normal');
        while (openSet.length > 0 && this.isRunning) {
            if (this.isPaused) await this.waitForResume();
            openSet.sort((a, b) => a.f - b.f);
            const { node } = openSet.shift();
            this.currentNode = node;
            this.graph.nodes[node].visited = true;
            this.draw();
            this.stats.operations++;
            this.updateStatsDisplay();
            await this.sleep(300);
            if (node === goal) { this.addLog('Goal reached!', 'success'); return; }
            for (const edge of this.graph.edges.filter(e => e.from === node)) {
                if (!this.isRunning) return;
                const tentG = gScore[node] + edge.weight;
                if (tentG < gScore[edge.to]) {
                    gScore[edge.to] = tentG;
                    const hVal = h(edge.to, goal);
                    openSet.push({ node: edge.to, g: tentG, h: hVal, f: tentG + hVal });
                    this.currentEdge = edge;
                    this.draw();
                    await this.sleep(150);
                }
            }
        }
        this.addLog('A* complete', 'success');
    }

    // ─── Dynamic Programming ──────────────────────────────────────────────────

    async visualizeFibonacci() {
        const n = 10;
        const fib = [0, 1];
        this.fibSequence = [0, 1];
        this.highlightIndices = [];
        this.draw();
        this.addLog('Fibonacci: F(0)=0, F(1)=1', 'highlight');
        for (let i = 2; i <= n && this.isRunning; i++) {
            if (this.isPaused) await this.waitForResume();
            fib[i] = fib[i - 1] + fib[i - 2];
            this.fibSequence = fib.slice(0, i + 1);
            this.highlightIndices = [i - 1, i - 2];
            this.stats.operations++;
            this.addLog(`F(${i}) = ${fib[i-1]} + ${fib[i-2]} = ${fib[i]}`, 'highlight');
            this.updateStatsDisplay();
            this.draw();
            await this.sleep(500);
        }
        this.addLog(`Done! F(${n}) = ${fib[n]}`, 'success');
    }

    async visualizeLCS() {
        const s1 = "ABCDGH", s2 = "AEDFHR";
        const m = s1.length, n = s2.length;
        const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
        this.lcsData = { s1, s2, dp, currentI: 0, currentJ: 0 };
        this.draw();
        this.addLog('LCS of "ABCDGH" and "AEDFHR"', 'highlight');
        for (let i = 1; i <= m && this.isRunning; i++) {
            if (this.isPaused) await this.waitForResume();
            for (let j = 1; j <= n && this.isRunning; j++) {
                if (!this.isRunning) return;
                this.lcsData.currentI = i;
                this.lcsData.currentJ = j;
                if (s1[i - 1] === s2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                    this.addLog(`Match '${s1[i-1]}': LCS=${dp[i][j]}`, 'highlight');
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
                this.stats.operations++;
                this.updateStatsDisplay();
                this.draw();
                await this.sleep(100);
            }
        }
        this.addLog(`LCS length: ${dp[m][n]}`, 'success');
    }

    async visualizeKnapsack() {
        const weights = [2, 3, 4, 5], values = [3, 4, 5, 6], capacity = 8;
        const n = weights.length;
        const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));
        this.knapsackData = { weights, values, capacity, dp, currentI: 0, currentW: 0 };
        this.draw();
        this.addLog('0/1 Knapsack, capacity=8', 'highlight');
        for (let i = 1; i <= n && this.isRunning; i++) {
            if (this.isPaused) await this.waitForResume();
            for (let w = 0; w <= capacity && this.isRunning; w++) {
                if (!this.isRunning) return;
                this.knapsackData.currentI = i;
                this.knapsackData.currentW = w;
                dp[i][w] = weights[i - 1] <= w
                    ? Math.max(dp[i - 1][w], values[i - 1] + dp[i - 1][w - weights[i - 1]])
                    : dp[i - 1][w];
                this.stats.operations++;
                this.updateStatsDisplay();
                this.draw();
                await this.sleep(80);
            }
        }
        this.addLog(`Max value: ${dp[n][capacity]}`, 'success');
    }

    async visualizeCoinChange() {
        const coins = [1, 2, 5], amount = 11;
        const dp = Array(amount + 1).fill(Infinity);
        dp[0] = 0;
        this.coinData = { coins, amount, dp, currentCoin: 0, currentAmt: 0 };
        this.draw();
        this.addLog('Coin Change: coins=[1,2,5], amount=11', 'highlight');
        for (const coin of coins) {
            if (!this.isRunning) return;
            if (this.isPaused) await this.waitForResume();
            this.coinData.currentCoin = coin;
            for (let a = coin; a <= amount && this.isRunning; a++) {
                if (!this.isRunning) return;
                this.coinData.currentAmt = a;
                if (dp[a - coin] !== Infinity) dp[a] = Math.min(dp[a], dp[a - coin] + 1);
                this.stats.operations++;
                this.updateStatsDisplay();
                this.draw();
                await this.sleep(150);
            }
        }
        this.addLog(`Min coins: ${dp[amount]}`, 'success');
    }

    async visualizeEditDistance() {
        const s1 = "INTENTION", s2 = "EXECUTION";
        const m = s1.length, n = s2.length;
        const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        this.editData = { s1, s2, dp, currentI: 0, currentJ: 0 };
        this.draw();
        this.addLog('Edit Distance: "INTENTION" → "EXECUTION"', 'highlight');
        for (let i = 1; i <= m && this.isRunning; i++) {
            if (this.isPaused) await this.waitForResume();
            for (let j = 1; j <= n && this.isRunning; j++) {
                if (!this.isRunning) return;
                this.editData.currentI = i;
                this.editData.currentJ = j;
                dp[i][j] = s1[i - 1] === s2[j - 1]
                    ? dp[i - 1][j - 1]
                    : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
                this.stats.operations++;
                this.updateStatsDisplay();
                this.draw();
                await this.sleep(80);
            }
        }
        this.addLog(`Edit distance: ${dp[m][n]}`, 'success');
    }

    async visualizeMatrixChain() {
        const dims = [10, 20, 30, 40, 30];
        const n = dims.length - 1;
        const dp = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
        this.matrixData = { dims, dp, currentLen: 0, currentI: 0, currentJ: 0 };
        this.draw();
        this.addLog('Matrix Chain: [10×20, 20×30, 30×40, 40×30]', 'highlight');
        for (let len = 2; len <= n && this.isRunning; len++) {
            if (this.isPaused) await this.waitForResume();
            this.matrixData.currentLen = len;
            for (let i = 1; i <= n - len + 1 && this.isRunning; i++) {
                const j = i + len - 1;
                this.matrixData.currentI = i;
                this.matrixData.currentJ = j;
                dp[i][j] = Infinity;
                for (let k = i; k < j && this.isRunning; k++) {
                    const cost = dp[i][k] + dp[k + 1][j] + dims[i - 1] * dims[k] * dims[j];
                    dp[i][j] = Math.min(dp[i][j], cost);
                    this.stats.operations++;
                    this.updateStatsDisplay();
                    this.draw();
                    await this.sleep(100);
                }
            }
        }
        this.addLog(`Min multiplications: ${dp[1][n]}`, 'success');
    }

    // ─── Tree ─────────────────────────────────────────────────────────────────

    async visualizeBST() {
        const values = [50, 30, 70, 20, 40, 60, 80];
        this.bstNodes = [];
        this.bstEdges = [];
        const cx = this.canvas.width / 2;

        const insertBST = (root, value, x, y, offset) => {
            if (root === null) return { id: this.bstNodes.length, value, x, y, left: null, right: null };
            if (value < root.value) root.left = insertBST(root.left, value, x - offset, y + 70, offset / 2);
            else root.right = insertBST(root.right, value, x + offset, y + 70, offset / 2);
            return root;
        };

        let root = null;
        const flattenBST = (node, parentId) => {
            if (!node) return;
            const id = this.bstNodes.length;
            this.bstNodes.push({ id, value: node.value, x: node.x, y: node.y, visited: false });
            if (parentId !== null) this.bstEdges.push({ from: parentId, to: id });
            flattenBST(node.left, id);
            flattenBST(node.right, id);
        };

        this.addLog('Building BST', 'normal');
        for (const val of values) {
            if (!this.isRunning) return;
            if (this.isPaused) await this.waitForResume();
            root = insertBST(root, val, cx, 60, cx / 2);
            this.bstNodes = [];
            this.bstEdges = [];
            flattenBST(root, null);
            this.stats.operations++;
            this.updateStatsDisplay();
            this.addLog(`Insert ${val}`, 'highlight');
            this.draw();
            await this.sleep(400);
        }
        this.addLog('BST built!', 'success');
    }

    async visualizeAVL() {
        const values = [30, 20, 40, 10, 25, 35, 50];
        this.avlNodes = [];
        this.avlEdges = [];
        this.addLog('Building AVL Tree (simplified)', 'normal');
        const cx = this.canvas.width / 2;
        for (let i = 0; i < values.length && this.isRunning; i++) {
            if (this.isPaused) await this.waitForResume();
            const level = Math.floor(Math.log2(i + 1));
            const posInLevel = i - (Math.pow(2, level) - 1);
            const nodesInLevel = Math.pow(2, level);
            const node = {
                id: i, value: values[i],
                x: (cx / nodesInLevel) * (2 * posInLevel + 1),
                y: 60 + level * 80,
                visited: true
            };
            this.avlNodes.push(node);
            if (i > 0) this.avlEdges.push({ from: Math.floor((i - 1) / 2), to: i });
            this.currentNode = i;
            this.stats.operations++;
            this.updateStatsDisplay();
            this.addLog(`Insert ${values[i]}`, 'highlight');
            this.draw();
            await this.sleep(500);
        }
        this.addLog('AVL insertion done!', 'success');
    }

    async visualizeRedBlack() {
        const values = [41, 38, 31, 12, 19, 8];
        this.rbNodes = [];
        this.rbEdges = [];
        this.addLog('Building Red-Black Tree (simplified)', 'normal');
        const cx = this.canvas.width / 2;
        for (let i = 0; i < values.length && this.isRunning; i++) {
            if (this.isPaused) await this.waitForResume();
            const level = Math.floor(Math.log2(i + 1));
            const posInLevel = i - (Math.pow(2, level) - 1);
            const nodesInLevel = Math.pow(2, level);
            const node = {
                id: i, value: values[i],
                x: (cx / nodesInLevel) * (2 * posInLevel + 1),
                y: 60 + level * 80,
                visited: true,
                color: i % 2 === 0 ? 'black' : 'red'
            };
            this.rbNodes.push(node);
            if (i > 0) this.rbEdges.push({ from: Math.floor((i - 1) / 2), to: i });
            this.currentNode = i;
            this.stats.operations++;
            this.updateStatsDisplay();
            this.addLog(`Insert ${values[i]} (${node.color})`, 'highlight');
            this.draw();
            await this.sleep(500);
        }
        this.addLog('Red-Black insertion done!', 'success');
    }

    async visualizeTreeTraversals() {
        const values = [1, 2, 3, 4, 5, 6, 7];
        this.traversalOrder = [];
        const cx = this.canvas.width / 2;
        this.treeNodes = values.map((v, i) => {
            const level = Math.floor(Math.log2(i + 1));
            const posInLevel = i - (Math.pow(2, level) - 1);
            const nodesInLevel = Math.pow(2, level);
            return { id: i, value: v, x: (cx / nodesInLevel) * (2 * posInLevel + 1), y: 60 + level * 80, visited: false };
        });
        this.treeEdges = values.map((_, i) => i > 0 ? { from: Math.floor((i - 1) / 2), to: i } : null).filter(Boolean);
        this.addLog('Inorder traversal', 'normal');

        const inorder = async (i) => {
            if (i >= values.length || !this.isRunning) return;
            await inorder(2 * i + 1);
            if (!this.isRunning) return;
            if (this.isPaused) await this.waitForResume();
            this.treeNodes[i].visited = true;
            this.traversalOrder.push(values[i]);
            this.currentNode = i;
            this.stats.operations++;
            this.updateStatsDisplay();
            this.addLog(`Visit ${values[i]}`, 'highlight');
            this.draw();
            await this.sleep(400);
            await inorder(2 * i + 2);
        };

        await inorder(0);
        this.addLog(`Inorder: [${this.traversalOrder.join(', ')}]`, 'success');
    }

    async visualizeHeapOps() {
        const values = [4, 10, 3, 5, 1, 8, 7];
        this.heapArray = [...values];
        this.addLog('Building max-heap', 'normal');
        for (let i = Math.floor(values.length / 2) - 1; i >= 0 && this.isRunning; i--) {
            if (this.isPaused) await this.waitForResume();
            await this.heapifyDown(i, values.length);
            this.stats.operations++;
            this.updateStatsDisplay();
        }
        this.addLog(`Heap: [${this.heapArray.join(', ')}]`, 'success');
    }

    async heapifyDown(i, n) {
        let largest = i;
        const l = 2 * i + 1, r = 2 * i + 2;
        if (!this.isRunning) return;
        if (this.isPaused) await this.waitForResume();
        this.highlightIndices = [i, l, r].filter(x => x < n);
        this.draw();
        await this.sleep(300);
        if (l < n && this.heapArray[l] > this.heapArray[largest]) largest = l;
        if (r < n && this.heapArray[r] > this.heapArray[largest]) largest = r;
        if (largest !== i) {
            [this.heapArray[i], this.heapArray[largest]] = [this.heapArray[largest], this.heapArray[i]];
            this.stats.swaps++;
            this.highlightIndices = [i, largest];
            this.draw();
            await this.sleep(400);
            await this.heapifyDown(largest, n);
        }
    }

    async visualizeTrie() {
        const words = ["CAT", "CAR", "CART", "DOG"];
        this.trieNodes = [{ id: 0, char: '∅', x: this.canvas.width / 2, y: 50, visited: false }];
        this.trieEdges = [];
        let nodeId = 1;
        this.addLog('Building Trie', 'normal');

        for (const word of words) {
            if (!this.isRunning) return;
            if (this.isPaused) await this.waitForResume();
            this.addLog(`Insert "${word}"`, 'highlight');
            let parentId = 0;
            const parent = this.trieNodes[0];
            let cx = parent.x, cy = parent.y;
            for (let c = 0; c < word.length && this.isRunning; c++) {
                const char = word[c];
                const spread = 120 / (c + 1);
                const offsetX = (words.indexOf(word) - words.length / 2) * spread;
                const newNode = { id: nodeId, char, x: parent.x + offsetX + (c * 20), y: cy + 70, visited: true };
                this.trieNodes.push(newNode);
                this.trieEdges.push({ from: parentId, to: nodeId });
                this.currentNode = nodeId;
                parentId = nodeId;
                cy = newNode.y;
                nodeId++;
                this.stats.operations++;
                this.updateStatsDisplay();
                this.draw();
                await this.sleep(300);
            }
        }
        this.addLog('Trie built!', 'success');
    }

    // ─── String ───────────────────────────────────────────────────────────────

    async naiveSearch() {
        const { text, pattern } = this.data;
        const n = text.length, m = pattern.length;
        this.addLog(`Naive search for "${pattern.join('')}" in "${text.join('')}"`, 'normal');
        for (let i = 0; i <= n - m && this.isRunning; i++) {
            if (this.isPaused) await this.waitForResume();
            this.data.textIndex = i;
            let j;
            for (j = 0; j < m && this.isRunning; j++) {
                this.data.patternIndex = j;
                this.compareIndices = [i + j];
                this.stats.comparisons++;
                this.updateStatsDisplay();
                this.draw();
                await this.sleep(200);
                if (text[i + j] !== pattern[j]) break;
            }
            if (j === m) { this.foundIndex = i; this.draw(); this.addLog(`Found at index ${i}!`, 'success'); return; }
        }
        this.addLog('Not found', 'error');
    }

    async kmpSearch() {
        const { text, pattern } = this.data;
        const n = text.length, m = pattern.length;
        const lps = Array(m).fill(0);
        let len = 0, i = 1;
        this.addLog(`KMP: computing LPS for "${pattern.join('')}"`, 'normal');
        while (i < m && this.isRunning) {
            if (this.isPaused) await this.waitForResume();
            if (pattern[i] === pattern[len]) { lps[i++] = ++len; }
            else if (len) { len = lps[len - 1]; }
            else { lps[i++] = 0; }
            this.stats.operations++;
            this.updateStatsDisplay();
            this.draw();
            await this.sleep(150);
        }
        i = 0; let j = 0;
        this.addLog('KMP: searching', 'normal');
        while (i < n && this.isRunning) {
            if (this.isPaused) await this.waitForResume();
            this.data.textIndex = i;
            this.data.patternIndex = j;
            if (pattern[j] === text[i]) {
                i++; j++;
                this.stats.comparisons++;
                this.updateStatsDisplay();
                this.draw();
                await this.sleep(200);
                if (j === m) { this.foundIndex = i - j; this.draw(); this.addLog(`Found at ${i - j}!`, 'success'); return; }
            } else {
                if (j) j = lps[j - 1];
                else i++;
            }
        }
        this.addLog('Not found', 'error');
    }

    async rabinKarpSearch() {
        const { text, pattern } = this.data;
        const n = text.length, m = pattern.length;
        const prime = 101, d = 256;
        let pH = 0, tH = 0, h = 1;
        for (let i = 0; i < m - 1; i++) h = (h * d) % prime;
        for (let i = 0; i < m; i++) {
            pH = (d * pH + pattern[i].charCodeAt(0)) % prime;
            tH = (d * tH + text[i].charCodeAt(0)) % prime;
        }
        this.addLog(`Rabin-Karp for "${pattern.join('')}"`, 'normal');
        for (let i = 0; i <= n - m && this.isRunning; i++) {
            if (this.isPaused) await this.waitForResume();
            this.data.textIndex = i;
            if (pH === tH) {
                let match = true;
                for (let j = 0; j < m && this.isRunning; j++) {
                    this.data.patternIndex = j;
                    this.compareIndices = [i + j];
                    this.stats.comparisons++;
                    this.updateStatsDisplay();
                    this.draw();
                    await this.sleep(150);
                    if (text[i + j] !== pattern[j]) { match = false; break; }
                }
                if (match) { this.foundIndex = i; this.draw(); this.addLog(`Found at ${i}!`, 'success'); return; }
            }
            if (i < n - m) {
                tH = (d * (tH - text[i].charCodeAt(0) * h) + text[i + m].charCodeAt(0)) % prime;
                if (tH < 0) tH += prime;
            }
            this.stats.operations++;
            this.updateStatsDisplay();
            this.draw();
            await this.sleep(100);
        }
        this.addLog('Not found', 'error');
    }

    async zAlgorithmSearch() {
        const text = this.data.text.join(''), pattern = this.data.pattern.join('');
        const combined = pattern + '$' + text;
        const n = combined.length, m = pattern.length;
        const z = Array(n).fill(0);
        let l = 0, r = 0;
        this.addLog(`Z-Algorithm for "${pattern}"`, 'normal');
        for (let i = 1; i < n && this.isRunning; i++) {
            if (this.isPaused) await this.waitForResume();
            if (i > r) {
                l = r = i;
                while (r < n && combined[r - l] === combined[r]) { r++; this.stats.comparisons++; }
                z[i] = r - l;
            } else {
                const k = i - l;
                if (z[k] < r - i + 1) z[i] = z[k];
                else {
                    l = i;
                    while (r < n && combined[r - l] === combined[r]) { r++; this.stats.comparisons++; }
                    z[i] = r - l;
                }
            }
            if (z[i] === m) {
                this.foundIndex = i - m - 1;
                this.addLog(`Found at ${this.foundIndex}!`, 'success');
                this.updateStatsDisplay();
                this.draw();
                await this.sleep(500);
                return;
            }
            this.stats.operations++;
            this.updateStatsDisplay();
            this.draw();
            await this.sleep(100);
        }
        this.addLog('Not found', 'error');
    }

    async manacherSearch() {
        const text = this.data.text.join('');
        const transformed = '#' + text.split('').join('#') + '#';
        const n = transformed.length;
        const p = Array(n).fill(0);
        let center = 0, right = 0;
        this.addLog(`Manacher's on "${text}"`, 'normal');
        for (let i = 0; i < n && this.isRunning; i++) {
            if (this.isPaused) await this.waitForResume();
            const mirror = 2 * center - i;
            if (i < right) p[i] = Math.min(right - i, p[mirror]);
            let a = i + p[i] + 1, b = i - p[i] - 1;
            while (a < n && b >= 0 && transformed[a] === transformed[b]) { p[i]++; a++; b--; this.stats.comparisons++; }
            if (i + p[i] > right) { center = i; right = i + p[i]; }
            this.stats.operations++;
            this.updateStatsDisplay();
            this.draw();
            await this.sleep(100);
        }
        let maxLen = 0, ci = 0;
        for (let i = 0; i < n; i++) if (p[i] > maxLen) { maxLen = p[i]; ci = i; }
        this.foundIndex = Math.floor((ci - maxLen) / 2);
        this.addLog(`Longest palindrome length: ${maxLen}`, 'success');
        this.draw();
        await this.sleep(500);
    }

    // ─── Drawing ──────────────────────────────────────────────────────────────

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.currentAlgorithm) return;

        switch (this.algorithmCategory) {
            case 'sorting':
            case 'searching':
                this.drawArray();
                break;
            case 'graph':
                this.drawGraph();
                break;
            case 'tree':
                this.drawTree();
                break;
            case 'dynamic':
                if (this.fibSequence) this.drawFibonacci();
                else if (this.lcsData) this.drawLCS();
                else if (this.knapsackData) this.drawKnapsack();
                else if (this.coinData) this.drawCoinChange();
                else if (this.editData) this.drawEditDistance();
                else if (this.matrixData) this.drawMatrixChain();
                else {
                    this.ctx.fillStyle = '#888';
                    this.ctx.font = '18px monospace';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('Press Start to begin visualization', this.canvas.width / 2, this.canvas.height / 2);
                }
                break;
            case 'string':
                this.drawString();
                break;
        }

        this.updateStatsDisplay();
    }

    drawArray() {
        if (!this.data || !Array.isArray(this.data)) return;
        const barWidth = (this.canvas.width - 40) / this.data.length;
        const maxHeight = this.canvas.height - 60;
        const showLabels = this.data.length <= 20;

        this.data.forEach((value, index) => {
            const height = (value / 320) * maxHeight;
            const x = 20 + index * barWidth;
            const y = this.canvas.height - 30 - height;

            if (this.foundIndex === index) this.ctx.fillStyle = '#4caf50';
            else if (this.highlightIndices && this.highlightIndices.includes(index)) this.ctx.fillStyle = '#ff5722';
            else if (this.compareIndices && this.compareIndices.includes(index)) this.ctx.fillStyle = '#ff9800';
            else this.ctx.fillStyle = '#667eea';

            this.ctx.fillRect(x, y, Math.max(barWidth - 2, 4), height);

            if (showLabels && barWidth >= 18) {
                this.ctx.fillStyle = '#000000';
                this.ctx.font = 'bold 11px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(value.toString(), x + Math.max(barWidth - 2, 4) / 2, y - 5);
            }
        });
    }

    drawGraph() {
        if (!this.graph || !this.graph.nodes || !this.graph.edges) return;

        // Edges
        this.graph.edges.forEach(edge => {
            const from = this.graph.nodes[edge.from], to = this.graph.nodes[edge.to];
            this.ctx.beginPath();
            this.ctx.moveTo(from.x, from.y);
            this.ctx.lineTo(to.x, to.y);
            const isCurrent = this.currentEdge && this.currentEdge.from === edge.from && this.currentEdge.to === edge.to;
            this.ctx.strokeStyle = isCurrent ? '#ff5722' : '#999';
            this.ctx.lineWidth = isCurrent ? 4 : 2;
            this.ctx.stroke();

            const midX = (from.x + to.x) / 2, midY = (from.y + to.y) / 2;
            this.ctx.beginPath();
            this.ctx.arc(midX, midY, 12, 0, 2 * Math.PI);
            this.ctx.fillStyle = 'white';
            this.ctx.fill();
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 11px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(edge.weight.toString(), midX, midY);
        });

        // Nodes
        this.graph.nodes.forEach(node => {
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, 24, 0, 2 * Math.PI);
            let fill = '#667eea';
            if (node.id === 0) fill = '#4caf50';
            else if (node.id === this.graph.nodes.length - 1) fill = '#f44336';
            else if (this.currentNode === node.id) fill = '#ff5722';
            else if (node.visited) fill = '#81c784';
            this.ctx.fillStyle = fill;
            this.ctx.fill();
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();

            this.ctx.fillStyle = node.id === 0 || node.id === this.graph.nodes.length - 1 ? '#fff' : '#000';
            this.ctx.font = 'bold 15px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(node.id.toString(), node.x, node.y);

            // Distance label for weighted algorithms
            if (node.distance !== undefined && node.distance !== Infinity) {
                this.ctx.fillStyle = '#1976d2';
                this.ctx.font = '10px Arial';
                this.ctx.fillText(`d=${node.distance}`, node.x, node.y + 32);
            }
        });
    }

    drawTree() {
        const nodes = this.bstNodes || this.avlNodes || this.rbNodes || this.treeNodes || (this.tree && this.tree.nodes);
        const edges = this.bstEdges || this.avlEdges || this.rbEdges || this.treeEdges || (this.tree && this.tree.edges);
        if (!nodes || !edges) return;

        edges.forEach(edge => {
            const from = nodes[edge.from], to = nodes[edge.to];
            if (!from || !to) return;
            this.ctx.beginPath();
            this.ctx.moveTo(from.x, from.y);
            this.ctx.lineTo(to.x, to.y);
            this.ctx.strokeStyle = '#90a4ae';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });

        nodes.forEach((node, idx) => {
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, 22, 0, 2 * Math.PI);
            let fill = '#667eea';
            if (node.color === 'red') fill = '#ef5350';
            else if (node.color === 'black') fill = '#424242';
            else if (node.visited) fill = '#4caf50';
            if (this.currentNode === (node.id !== undefined ? node.id : idx)) fill = '#ff5722';
            this.ctx.fillStyle = fill;
            this.ctx.fill();
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            this.ctx.fillStyle = node.color === 'red' || node.color === 'black' ? '#fff' : '#000';
            this.ctx.font = 'bold 13px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(node.value !== undefined ? node.value : (node.char || ''), node.x, node.y);
        });
    }

    drawFibonacci() {
        if (!this.fibSequence) return;
        const boxW = 65, boxH = 48;
        const startX = 20, startY = this.canvas.height / 2 - boxH / 2;

        this.fibSequence.forEach((value, index) => {
            const x = startX + index * (boxW + 12);
            const isHighlighted = this.highlightIndices && this.highlightIndices.includes(index);
            this.ctx.fillStyle = isHighlighted ? '#ff5722' : '#667eea';
            this.ctx.fillRect(x, startY, boxW, boxH);
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, startY, boxW, boxH);

            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(value.toString(), x + boxW / 2, startY + boxH / 2);

            this.ctx.fillStyle = '#555';
            this.ctx.font = '11px Arial';
            this.ctx.fillText(`F(${index})`, x + boxW / 2, startY + boxH + 20);
        });
    }

    drawLCS() {
        if (!this.lcsData) return;
        const { s1, s2, dp, currentI, currentJ } = this.lcsData;
        const cs = 34, ox = 65, oy = 55;
        this.ctx.fillStyle = '#1976d2';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('LCS Table', this.canvas.width / 2, 25);
        for (let j = 0; j <= s2.length; j++) {
            this.ctx.fillStyle = '#333';
            this.ctx.font = 'bold 13px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(j === 0 ? '' : s2[j - 1], ox + j * cs + cs / 2, oy - 10);
        }
        for (let i = 0; i <= s1.length; i++) {
            if (i > 0) {
                this.ctx.fillStyle = '#333';
                this.ctx.font = 'bold 13px Arial';
                this.ctx.textAlign = 'right';
                this.ctx.fillText(s1[i - 1], ox - 10, oy + i * cs + cs / 2 + 4);
            }
            for (let j = 0; j <= s2.length; j++) {
                const x = ox + j * cs, y = oy + i * cs;
                this.ctx.fillStyle = i === currentI && j === currentJ ? '#ff5722' : (i === 0 || j === 0 ? '#e3f2fd' : '#fff');
                this.ctx.fillRect(x, y, cs, cs);
                this.ctx.strokeStyle = '#bbb';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, cs, cs);
                this.ctx.fillStyle = '#000';
                this.ctx.font = 'bold 12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(dp[i][j].toString(), x + cs / 2, y + cs / 2);
            }
        }
    }

    drawKnapsack() {
        if (!this.knapsackData) return;
        const { weights, values, capacity, dp, currentI, currentW } = this.knapsackData;
        const cs = 28, ox = 100, oy = 65;
        this.ctx.fillStyle = '#1976d2';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Knapsack DP', this.canvas.width / 2, 25);
        for (let w = 0; w <= capacity; w++) {
            this.ctx.fillStyle = '#333';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(w.toString(), ox + w * cs + cs / 2, oy - 10);
        }
        for (let i = 0; i <= weights.length; i++) {
            if (i > 0) {
                this.ctx.fillStyle = '#333';
                this.ctx.font = '9px Arial';
                this.ctx.textAlign = 'right';
                this.ctx.fillText(`i${i}(w${weights[i-1]},v${values[i-1]})`, ox - 5, oy + i * cs + cs / 2 + 3);
            }
            for (let w = 0; w <= capacity; w++) {
                const x = ox + w * cs, y = oy + i * cs;
                this.ctx.fillStyle = i === currentI && w === currentW ? '#ff5722' : (i === 0 ? '#e3f2fd' : '#fff');
                this.ctx.fillRect(x, y, cs, cs);
                this.ctx.strokeStyle = '#bbb';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, cs, cs);
                this.ctx.fillStyle = '#000';
                this.ctx.font = 'bold 10px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(dp[i][w].toString(), x + cs / 2, y + cs / 2);
            }
        }
    }

    drawCoinChange() {
        if (!this.coinData) return;
        const { coins, amount, dp, currentCoin, currentAmt } = this.coinData;
        const cs = 33, ox = 55, oy = 65;
        this.ctx.fillStyle = '#1976d2';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Coin Change DP', this.canvas.width / 2, 25);
        for (let a = 0; a <= amount; a++) {
            this.ctx.fillStyle = '#333';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(a.toString(), ox + a * cs + cs / 2, oy - 10);
        }
        coins.forEach((coin, idx) => {
            const rowY = oy + idx * cs;
            this.ctx.fillStyle = '#333';
            this.ctx.font = '11px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`c=${coin}`, ox - 8, rowY + cs / 2 + 4);
            for (let a = 0; a <= amount; a++) {
                const x = ox + a * cs;
                this.ctx.fillStyle = currentCoin === coin && currentAmt === a ? '#ff5722' : '#fff';
                this.ctx.fillRect(x, rowY, cs, cs);
                this.ctx.strokeStyle = '#bbb';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, rowY, cs, cs);
                this.ctx.fillStyle = '#000';
                this.ctx.font = 'bold 11px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(dp[a] !== Infinity ? dp[a] : '∞', x + cs / 2, rowY + cs / 2);
            }
        });
        const ry = oy + coins.length * cs + 10;
        this.ctx.fillStyle = '#4caf50';
        this.ctx.fillRect(ox, ry, (amount + 1) * cs, cs);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`Result: ${dp[amount] !== Infinity ? dp[amount] : 'Impossible'}`, ox + (amount + 1) * cs / 2, ry + cs / 2);
    }

    drawEditDistance() {
        if (!this.editData) return;
        const { s1, s2, dp, currentI, currentJ } = this.editData;
        const cs = 30, ox = 60, oy = 55;
        this.ctx.fillStyle = '#1976d2';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Edit Distance', this.canvas.width / 2, 25);
        for (let j = 0; j <= s2.length; j++) {
            this.ctx.fillStyle = '#333';
            this.ctx.font = '11px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(j === 0 ? '' : s2[j - 1], ox + j * cs + cs / 2, oy - 10);
        }
        for (let i = 0; i <= s1.length; i++) {
            if (i > 0) {
                this.ctx.fillStyle = '#333';
                this.ctx.font = '11px Arial';
                this.ctx.textAlign = 'right';
                this.ctx.fillText(s1[i - 1], ox - 8, oy + i * cs + cs / 2 + 4);
            }
            for (let j = 0; j <= s2.length; j++) {
                const x = ox + j * cs, y = oy + i * cs;
                this.ctx.fillStyle = i === currentI && j === currentJ ? '#ff5722' : (i === 0 || j === 0 ? '#e3f2fd' : '#fff');
                this.ctx.fillRect(x, y, cs, cs);
                this.ctx.strokeStyle = '#bbb';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, cs, cs);
                this.ctx.fillStyle = '#000';
                this.ctx.font = 'bold 11px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(dp[i][j].toString(), x + cs / 2, y + cs / 2);
            }
        }
        const dist = dp[s1.length] && dp[s1.length][s2.length] !== undefined ? dp[s1.length][s2.length] : '—';
        const ry = oy + (s1.length + 1) * cs + 12;
        this.ctx.fillStyle = '#4caf50';
        this.ctx.fillRect(ox, ry, 160, 28);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 13px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`Distance: ${dist}`, ox + 80, ry + 14);
    }

    drawMatrixChain() {
        if (!this.matrixData) return;
        const { dims, dp, currentLen, currentI, currentJ } = this.matrixData;
        const n = dims.length - 1, cs = 42, ox = 50, oy = 55;
        this.ctx.fillStyle = '#1976d2';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Matrix Chain DP', this.canvas.width / 2, 25);
        this.ctx.fillStyle = '#555';
        this.ctx.font = '11px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Matrices: [${dims.slice(0,-1).map((d,i)=>`${d}×${dims[i+1]}`).join(', ')}]`, ox, oy - 20);
        for (let i = 1; i <= n; i++) {
            for (let j = i; j <= n; j++) {
                const x = ox + (j - 1) * cs, y = oy + (i - 1) * cs;
                const isActive = i === currentI && j === currentJ;
                const isCurrentLen = j - i + 1 === currentLen;
                this.ctx.fillStyle = isActive ? '#ff5722' : isCurrentLen ? '#ffe0b2' : '#fff';
                this.ctx.fillRect(x, y, cs, cs);
                this.ctx.strokeStyle = '#bbb';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, cs, cs);
                if (dp[i][j] !== 0 && dp[i][j] !== Infinity) {
                    this.ctx.fillStyle = '#000';
                    this.ctx.font = 'bold 9px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(dp[i][j].toLocaleString(), x + cs / 2, y + cs / 2);
                }
            }
        }
        const minCost = dp[1] && dp[1][n] !== undefined ? dp[1][n] : '—';
        const ry = oy + n * cs + 12;
        this.ctx.fillStyle = '#4caf50';
        this.ctx.fillRect(ox, ry, 200, 28);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`Min ops: ${typeof minCost === 'number' ? minCost.toLocaleString() : minCost}`, ox + 100, ry + 14);
    }

    // FIX: drawString was broken — missing closing brace and early-return on object data
    drawString() {
        // this.data is an object {text, pattern, textIndex, patternIndex} for string algorithms
        if (!this.data || typeof this.data !== 'object' || Array.isArray(this.data)) return;
        if (!this.data.text || !this.data.pattern) return;

        const charW = 35, charH = 35, startX = 30, textY = 80, patternY = 200;

        this.ctx.fillStyle = '#1976d2';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Text:', startX, textY - 25);

        this.data.text.forEach((char, index) => {
            const x = startX + 70 + index * charW;
            const isHighlighted = this.data.textIndex === index || (this.compareIndices && this.compareIndices.includes(index));
            const isFound = this.foundIndex !== -1 && index >= this.foundIndex && index < this.foundIndex + this.data.pattern.length;

            this.ctx.fillStyle = isFound ? '#4caf50' : isHighlighted ? '#ff5722' : '#667eea';
            this.ctx.fillRect(x, textY - 20, charW, charH);
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, textY - 20, charW, charH);
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(char, x + charW / 2, textY - 2);
            this.ctx.fillStyle = '#666';
            this.ctx.font = '11px Arial';
            this.ctx.fillText(index.toString(), x + charW / 2, textY + 20);
        });

        this.ctx.fillStyle = '#388e3c';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Pattern:', startX, patternY - 25);

        this.data.pattern.forEach((char, index) => {
            const x = startX + 70 + index * charW;
            this.ctx.fillStyle = this.data.patternIndex === index ? '#ff5722' : '#4caf50';
            this.ctx.fillRect(x, patternY - 20, charW, charH);
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, patternY - 20, charW, charH);
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(char, x + charW / 2, patternY - 2);
            this.ctx.fillStyle = '#666';
            this.ctx.font = '11px Arial';
            this.ctx.fillText(index.toString(), x + charW / 2, patternY + 20);
        });

        // Match indicator
        if (this.foundIndex !== -1) {
            this.ctx.fillStyle = '#4caf50';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`✓ Match found at index ${this.foundIndex}!`, startX, patternY + 60);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.simulator = new AlgorithmSimulator();
});

function closeWarning() {
    document.getElementById('warning-modal').classList.remove('active');
}

function showWarningForIncomplete(algoId) {
    return false;
}
