// Visual Algorithm Simulator - Main Application

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
        
        this.algorithms = {
            // Sorting Algorithms
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
            // Searching Algorithms
            searching: [
                { name: 'Linear Search', id: 'linearSearch' },
                { name: 'Binary Search', id: 'binarySearch' },
                { name: 'Jump Search', id: 'jumpSearch' },
                { name: 'Exponential Search', id: 'exponentialSearch' },
                { name: 'Interpolation Search', id: 'interpolationSearch' }
            ],
            // Graph Algorithms
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
            // Dynamic Programming
            dynamic: [
                { name: 'Fibonacci', id: 'fibonacci' },
                { name: 'Longest Common Subsequence', id: 'lcs' },
                { name: 'Knapsack Problem', id: 'knapsack' },
                { name: 'Matrix Chain Multiplication', id: 'matrixChain' },
                { name: 'Coin Change', id: 'coinChange' },
                { name: 'Edit Distance', id: 'editDistance' }
            ],
            // Tree Algorithms
            tree: [
                { name: 'Binary Search Tree', id: 'bst' },
                { name: 'AVL Tree', id: 'avlTree' },
                { name: 'Red-Black Tree', id: 'redBlackTree' },
                { name: 'Tree Traversals', id: 'treeTraversals' },
                { name: 'Heap Operations', id: 'heapOps' },
                { name: 'Trie', id: 'trie' }
            ],
            // String Algorithms
            string: [
                { name: 'Naive Pattern Search', id: 'naiveSearch' },
                { name: 'KMP Algorithm', id: 'kmp' },
                { name: 'Rabin-Karp', id: 'rabinKarp' },
                { name: 'Z Algorithm', id: 'zAlgorithm' },
                { name: 'Manacher\'s Algorithm', id: 'manacher' }
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
            if (this.currentAlgorithm) {
                this.draw();
            }
        });
    }

    setupEventListeners() {
        // Category navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.loadCategory(e.target.dataset.category);
            });
        });

        // Control buttons
        document.getElementById('start-btn').addEventListener('click', () => this.start());
        document.getElementById('pause-btn').addEventListener('click', () => this.pause());
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
        
        // Speed slider
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
        document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`[data-id="${algoId}"]`).classList.add('active');
        
        this.currentAlgorithm = algoId;
        this.algorithmName = algoName;
        this.algorithmCategory = category;
        
        this.reset();
        this.initializeAlgorithm();
        this.updateDescription();
        this.updateCode();
    }

    initializeAlgorithm() {
        this.resetStats();
        this.data = [];
        this.graph = null;
        this.tree = null;
        
        switch(this.algorithmCategory) {
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
        this.graph = {
            nodes: [],
            edges: []
        };
        
        // Create nodes in a circular layout
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 50;
        
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
        
        // Create random edges
        for (let i = 0; i < nodes; i++) {
            const numEdges = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < numEdges; j++) {
                const target = Math.floor(Math.random() * nodes);
                if (target !== i) {
                    const edge = { from: i, to: target, weight: Math.floor(Math.random() * 50) + 1 };
                    if (!this.graph.edges.some(e => e.from === edge.from && e.to === edge.to)) {
                        this.graph.edges.push(edge);
                    }
                }
            }
        }
    }

    generateTree() {
        this.tree = {
            nodes: [],
            edges: []
        };
        
        // Create a simple binary tree
        const levels = 3;
        const nodeCount = Math.pow(2, levels) - 1;
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
                    x: x,
                    y: y,
                    value: Math.floor(Math.random() * 100),
                    visited: false,
                    level: level
                });
                
                // Add edge to parent
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
            fibonacci: "Fibonacci sequence where each number is the sum of the two preceding ones.",
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
            rabinKarp: "O(m + n) average", zAlgorithm: "O(m + n)",
            manacher: "O(n)"
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
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    return arr;
}`,
            selectionSort: `function selectionSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        // Swap
        let temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
    }
    return arr;
}`,
            insertionSort: `function insertionSort(arr) {
    let n = arr.length;
    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;
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
    let left = mergeSort(arr.slice(0, mid));
    let right = mergeSort(arr.slice(mid));
    
    return merge(left, right);
}

function merge(left, right) {
    let result = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i++]);
        } else {
            result.push(right[j++]);
        }
    }
    
    return result.concat(left.slice(i)).concat(right.slice(j));
}`,
            quickSort: `function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        let pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
    return arr;
}

function partition(arr, low, high) {
    let pivot = arr[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}`,
            heapSort: `function heapSort(arr) {
    let n = arr.length;
    
    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }
    
    // Extract elements
    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        heapify(arr, i, 0);
    }
    return arr;
}

function heapify(arr, n, i) {
    let largest = i;
    let left = 2 * i + 1;
    let right = 2 * i + 2;
    
    if (left < n && arr[left] > arr[largest]) {
        largest = left;
    }
    if (right < n && arr[right] > arr[largest]) {
        largest = right;
    }
    
    if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        heapify(arr, n, largest);
    }
}`,
            countingSort: `function countingSort(arr) {
    let max = Math.max(...arr);
    let count = new Array(max + 1).fill(0);
    
    // Count occurrences
    for (let num of arr) {
        count[num]++;
    }
    
    // Reconstruct array
    let idx = 0;
    for (let i = 0; i <= max; i++) {
        while (count[i] > 0) {
            arr[idx++] = i;
            count[i]--;
        }
    }
    return arr;
}`,
            radixSort: `function radixSort(arr) {
    let max = Math.max(...arr);
    let exp = 1;
    
    while (Math.floor(max / exp) > 0) {
        countingSortByDigit(arr, exp);
        exp *= 10;
    }
    return arr;
}

function countingSortByDigit(arr, exp) {
    let n = arr.length;
    let output = new Array(n);
    let count = new Array(10).fill(0);
    
    for (let i = 0; i < n; i++) {
        let digit = Math.floor(arr[i] / exp) % 10;
        count[digit]++;
    }
    
    for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1];
    }
    
    for (let i = n - 1; i >= 0; i--) {
        let digit = Math.floor(arr[i] / exp) % 10;
        output[count[digit] - 1] = arr[i];
        count[digit]--;
    }
    
    for (let i = 0; i < n; i++) {
        arr[i] = output[i];
    }
}`,
            linearSearch: `function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) {
            return i;
        }
    }
    return -1;
}`,
            binarySearch: `function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        
        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}`,
            bfs: `function BFS(graph, start) {
    let visited = new Set();
    let queue = [start];
    let result = [];
    
    visited.add(start);
    
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
        if (!visited.has(neighbor)) {
            DFS(graph, neighbor, visited, result);
        }
    }
    return result;
}`,
            dijkstra: `function dijkstra(graph, start) {
    let distances = {};
    let previous = {};
    let pq = new PriorityQueue();
    
    for (let node in graph) {
        distances[node] = Infinity;
        previous[node] = null;
    }
    distances[start] = 0;
    pq.enqueue(start, 0);
    
    while (!pq.isEmpty()) {
        let current = pq.dequeue().value;
        
        for (let neighbor in graph[current]) {
            let alt = distances[current] + graph[current][neighbor];
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                previous[neighbor] = current;
                pq.enqueue(neighbor, alt);
            }
        }
    }
    return { distances, previous };
}`,
            fibonacci: `function fibonacci(n) {
    if (n <= 1) return n;
    
    let dp = [0, 1];
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}`,
            lcs: `function LCS(text1, text2) {
    let m = text1.length;
    let n = text2.length;
    let dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (text1[i - 1] === text2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
}`,
            knapsack: `function knapsack(weights, values, capacity) {
    let n = weights.length;
    let dp = Array(n + 1).fill(null).map(() => Array(capacity + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
        for (let w = 0; w <= capacity; w++) {
            if (weights[i - 1] <= w) {
                dp[i][w] = Math.max(
                    dp[i - 1][w],
                    dp[i - 1][w - weights[i - 1]] + values[i - 1]
                );
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    return dp[n][capacity];
}`,
            kmp: `function KMP(text, pattern) {
    let lps = computeLPS(pattern);
    let i = 0, j = 0;
    let matches = [];
    
    while (i < text.length) {
        if (pattern[j] === text[i]) {
            i++;
            j++;
        }
        
        if (j === pattern.length) {
            matches.push(i - j);
            j = lps[j - 1];
        } else if (i < text.length && pattern[j] !== text[i]) {
            if (j !== 0) {
                j = lps[j - 1];
            } else {
                i++;
            }
        }
    }
    return matches;
}

function computeLPS(pattern) {
    let lps = new Array(pattern.length).fill(0);
    let len = 0, i = 1;
    
    while (i < pattern.length) {
        if (pattern[i] === pattern[len]) {
            len++;
            lps[i] = len;
            i++;
        } else {
            if (len !== 0) {
                len = lps[len - 1];
            } else {
                lps[i] = 0;
                i++;
            }
        }
    }
    return lps;
}`
        };
        
        document.getElementById('algorithm-code').textContent = codes[this.currentAlgorithm] || '// Code will be displayed here';
    }

    resetStats() {
        this.stats = { comparisons: 0, swaps: 0, operations: 0 };
        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        let statsText = '';
        if (this.stats.comparisons > 0) statsText += `Comparisons: ${this.stats.comparisons} | `;
        if (this.stats.swaps > 0) statsText += `Swaps: ${this.stats.swaps} | `;
        if (this.stats.operations > 0) statsText += `Operations: ${this.stats.operations}`;
        document.getElementById('stats').textContent = statsText;
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
        
        try {
            await this.runAlgorithm();
        } catch (error) {
            console.error('Algorithm error:', error);
        }
        
        this.isRunning = false;
        document.getElementById('start-btn').disabled = false;
    }

    pause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pause-btn').textContent = this.isPaused ? '▶ Resume' : '⏸ Pause';
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        document.getElementById('pause-btn').textContent = '⏸ Pause';
        document.getElementById('start-btn').disabled = false;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        this.initializeAlgorithm();
    }

    async runAlgorithm() {
        switch(this.currentAlgorithm) {
            case 'bubbleSort':
                await this.bubbleSort();
                break;
            case 'selectionSort':
                await this.selectionSort();
                break;
            case 'insertionSort':
                await this.insertionSort();
                break;
            case 'mergeSort':
                await this.mergeSort(0, this.data.length - 1);
                break;
            case 'quickSort':
                await this.quickSort(0, this.data.length - 1);
                break;
            case 'heapSort':
                await this.heapSort();
                break;
            case 'countingSort':
                await this.countingSort();
                break;
            case 'radixSort':
                await this.radixSort();
                break;
            case 'linearSearch':
                await this.linearSearch();
                break;
            case 'binarySearch':
                await this.binarySearch();
                break;
            case 'bfs':
                await this.runBFS();
                break;
            case 'dfs':
                await this.runDFS();
                break;
            case 'fibonacci':
                await this.visualizeFibonacci();
                break;
            default:
                this.draw();
                await this.sleep(1000);
                alert('Visualization for this algorithm is coming soon!');
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms * (101 - this.speed) / 10));
    }

    // Sorting Algorithm Implementations
    async bubbleSort() {
        let n = this.data.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (this.isPaused) await this.waitForResume();
                
                this.stats.comparisons++;
                this.updateStatsDisplay();
                
                this.highlightIndices = [j, j + 1];
                this.draw();
                await this.sleep(50);
                
                if (this.data[j] > this.data[j + 1]) {
                    this.stats.swaps++;
                    [this.data[j], this.data[j + 1]] = [this.data[j + 1], this.data[j]];
                    this.draw();
                    await this.sleep(50);
                }
            }
        }
        this.highlightIndices = [];
        this.draw();
    }

    async selectionSort() {
        let n = this.data.length;
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            
            for (let j = i + 1; j < n; j++) {
                if (this.isPaused) await this.waitForResume();
                
                this.stats.comparisons++;
                this.highlightIndices = [minIdx, j];
                this.draw();
                await this.sleep(50);
                
                if (this.data[j] < this.data[minIdx]) {
                    minIdx = j;
                }
            }
            
            if (minIdx !== i) {
                this.stats.swaps++;
                [this.data[i], this.data[minIdx]] = [this.data[minIdx], this.data[i]];
                this.draw();
                await this.sleep(50);
            }
        }
        this.highlightIndices = [];
        this.draw();
    }

    async insertionSort() {
        let n = this.data.length;
        for (let i = 1; i < n; i++) {
            let key = this.data[i];
            let j = i - 1;
            
            this.highlightIndices = [i];
            this.draw();
            await this.sleep(50);
            
            while (j >= 0) {
                if (this.isPaused) await this.waitForResume();
                
                this.stats.comparisons++;
                this.highlightIndices = [j, j + 1];
                this.draw();
                await this.sleep(50);
                
                if (this.data[j] > key) {
                    this.stats.swaps++;
                    this.data[j + 1] = this.data[j];
                    j--;
                    this.draw();
                    await this.sleep(50);
                } else {
                    break;
                }
            }
            this.data[j + 1] = key;
            this.draw();
        }
        this.highlightIndices = [];
        this.draw();
    }

    async mergeSort(left, right) {
        if (left >= right) return;
        
        let mid = Math.floor((left + right) / 2);
        await this.mergeSort(left, mid);
        await this.mergeSort(mid + 1, right);
        await this.merge(left, mid, right);
    }

    async merge(left, mid, right) {
        let leftArr = this.data.slice(left, mid + 1);
        let rightArr = this.data.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArr.length && j < rightArr.length) {
            if (this.isPaused) await this.waitForResume();
            
            this.stats.comparisons++;
            this.highlightIndices = [k];
            this.draw();
            await this.sleep(50);
            
            if (leftArr[i] <= rightArr[j]) {
                this.data[k] = leftArr[i];
                i++;
            } else {
                this.data[k] = rightArr[j];
                j++;
            }
            this.stats.swaps++;
            k++;
            this.draw();
        }
        
        while (i < leftArr.length) {
            if (this.isPaused) await this.waitForResume();
            this.data[k] = leftArr[i];
            this.stats.swaps++;
            k++;
            i++;
            this.draw();
            await this.sleep(30);
        }
        
        while (j < rightArr.length) {
            if (this.isPaused) await this.waitForResume();
            this.data[k] = rightArr[j];
            this.stats.swaps++;
            k++;
            j++;
            this.draw();
            await this.sleep(30);
        }
    }

    async quickSort(low, high) {
        if (low < high) {
            let pi = await this.partition(low, high);
            await this.quickSort(low, pi - 1);
            await this.quickSort(pi + 1, high);
        }
    }

    async partition(low, high) {
        let pivot = this.data[high];
        let i = low - 1;
        
        this.highlightIndices = [high];
        this.draw();
        
        for (let j = low; j < high; j++) {
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
        await this.sleep(50);
        
        return i + 1;
    }

    async heapSort() {
        let n = this.data.length;
        
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            await this.heapify(n, i);
        }
        
        for (let i = n - 1; i > 0; i--) {
            if (this.isPaused) await this.waitForResume();
            
            this.stats.swaps++;
            [this.data[0], this.data[i]] = [this.data[i], this.data[0]];
            this.highlightIndices = [0, i];
            this.draw();
            await this.sleep(50);
            
            await this.heapify(i, 0);
        }
    }

    async heapify(n, i) {
        let largest = i;
        let left = 2 * i + 1;
        let right = 2 * i + 2;
        
        if (this.isPaused) await this.waitForResume();
        
        this.highlightIndices = [i, left, right].filter(x => x < n);
        this.draw();
        await this.sleep(50);
        
        if (left < n) {
            this.stats.comparisons++;
            if (this.data[left] > this.data[largest]) {
                largest = left;
            }
        }
        
        if (right < n) {
            this.stats.comparisons++;
            if (this.data[right] > this.data[largest]) {
                largest = right;
            }
        }
        
        if (largest !== i) {
            this.stats.swaps++;
            [this.data[i], this.data[largest]] = [this.data[largest], this.data[i]];
            this.draw();
            await this.sleep(50);
            await this.heapify(n, largest);
        }
    }

    async countingSort() {
        let max = Math.max(...this.data);
        let count = new Array(max + 1).fill(0);
        
        for (let num of this.data) {
            if (this.isPaused) await this.waitForResume();
            count[num]++;
            this.stats.operations++;
            this.draw();
            await this.sleep(30);
        }
        
        let idx = 0;
        for (let i = 0; i <= max; i++) {
            while (count[i] > 0) {
                if (this.isPaused) await this.waitForResume();
                this.data[idx] = i;
                count[i]--;
                idx++;
                this.stats.operations++;
                this.draw();
                await this.sleep(30);
            }
        }
    }

    async radixSort() {
        let max = Math.max(...this.data);
        let exp = 1;
        
        while (Math.floor(max / exp) > 0) {
            await this.countingSortByDigit(exp);
            exp *= 10;
        }
    }

    async countingSortByDigit(exp) {
        let n = this.data.length;
        let output = new Array(n);
        let count = new Array(10).fill(0);
        
        for (let i = 0; i < n; i++) {
            let digit = Math.floor(this.data[i] / exp) % 10;
            count[digit]++;
        }
        
        for (let i = 1; i < 10; i++) {
            count[i] += count[i - 1];
        }
        
        for (let i = n - 1; i >= 0; i--) {
            if (this.isPaused) await this.waitForResume();
            let digit = Math.floor(this.data[i] / exp) % 10;
            output[count[digit] - 1] = this.data[i];
            count[digit]--;
            this.draw();
            await this.sleep(30);
        }
        
        for (let i = 0; i < n; i++) {
            this.data[i] = output[i];
        }
    }

    // Searching Algorithms
    async linearSearch() {
        let target = this.data[this.targetIndex];
        
        for (let i = 0; i < this.data.length; i++) {
            if (this.isPaused) await this.waitForResume();
            
            this.stats.comparisons++;
            this.highlightIndices = [i];
            this.draw();
            await this.sleep(100);
            
            if (this.data[i] === target) {
                this.foundIndex = i;
                this.draw();
                await this.sleep(500);
                return;
            }
        }
    }

    async binarySearch() {
        // First sort the array
        this.data.sort((a, b) => a - b);
        this.draw();
        await this.sleep(500);
        
        let target = this.data[this.targetIndex];
        let left = 0;
        let right = this.data.length - 1;
        
        while (left <= right) {
            if (this.isPaused) await this.waitForResume();
            
            let mid = Math.floor((left + right) / 2);
            this.stats.comparisons++;
            this.highlightIndices = [left, mid, right];
            this.draw();
            await this.sleep(100);
            
            if (this.data[mid] === target) {
                this.foundIndex = mid;
                this.draw();
                await this.sleep(500);
                return;
            } else if (this.data[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }

    // Graph Algorithms
    async runBFS() {
        if (!this.graph || this.graph.nodes.length === 0) return;
        
        let startNode = 0;
        let visited = new Set();
        let queue = [startNode];
        
        visited.add(startNode);
        this.graph.nodes[startNode].visited = true;
        this.draw();
        await this.sleep(500);
        
        while (queue.length > 0) {
            if (this.isPaused) await this.waitForResume();
            
            let current = queue.shift();
            this.stats.operations++;
            
            // Find neighbors
            let neighbors = this.graph.edges
                .filter(e => e.from === current)
                .map(e => e.to);
            
            for (let neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    if (this.isPaused) await this.waitForResume();
                    
                    visited.add(neighbor);
                    this.graph.nodes[neighbor].visited = true;
                    this.currentEdge = { from: current, to: neighbor };
                    this.draw();
                    await this.sleep(500);
                    
                    queue.push(neighbor);
                }
            }
        }
    }

    async runDFS() {
        if (!this.graph || this.graph.nodes.length === 0) return;
        
        let visited = new Set();
        await this.dfsVisit(0, visited);
    }

    async dfsVisit(node, visited) {
        if (this.isPaused) await this.waitForResume();
        
        visited.add(node);
        this.graph.nodes[node].visited = true;
        this.stats.operations++;
        this.draw();
        await this.sleep(500);
        
        let neighbors = this.graph.edges
            .filter(e => e.from === node)
            .map(e => e.to);
        
        for (let neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                this.currentEdge = { from: node, to: neighbor };
                await this.dfsVisit(neighbor, visited);
            }
        }
    }

    async visualizeFibonacci() {
        let n = 10;
        let fib = [0, 1];
        
        for (let i = 2; i <= n; i++) {
            if (this.isPaused) await this.waitForResume();
            
            fib[i] = fib[i - 1] + fib[i - 2];
            this.stats.operations++;
            this.fibSequence = fib.slice(0, i + 1);
            this.highlightIndices = [i - 1, i - 2];
            this.draw();
            await this.sleep(500);
        }
    }

    waitForResume() {
        return new Promise(resolve => {
            const check = () => {
                if (!this.isPaused) {
                    resolve();
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        switch(this.algorithmCategory) {
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
                if (this.fibSequence) {
                    this.drawFibonacci();
                } else {
                    this.drawArray();
                }
                break;
            case 'string':
                this.drawString();
                break;
        }
    }

    drawArray() {
        const barWidth = (this.canvas.width - 40) / this.data.length;
        const maxHeight = this.canvas.height - 60;
        
        this.data.forEach((value, index) => {
            const height = (value / 320) * maxHeight;
            const x = 20 + index * barWidth;
            const y = this.canvas.height - 30 - height;
            
            // Color based on state
            if (this.foundIndex === index) {
                this.ctx.fillStyle = '#4caf50';
            } else if (this.highlightIndices && this.highlightIndices.includes(index)) {
                this.ctx.fillStyle = '#ff5722';
            } else if (this.compareIndices && this.compareIndices.includes(index)) {
                this.ctx.fillStyle = '#ff9800';
            } else {
                this.ctx.fillStyle = '#667eea';
            }
            
            this.ctx.fillRect(x, y, Math.max(barWidth - 2, 8), height);
            
            // Draw value with better contrast
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 11px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
            this.ctx.shadowBlur = 3;
            this.ctx.fillText(value.toString(), x + Math.max(barWidth - 2, 8) / 2, y - 8);
            this.ctx.shadowBlur = 0;
        });
    }

    drawGraph() {
        if (!this.graph) return;
        
        // Draw edges first (behind nodes)
        this.graph.edges.forEach(edge => {
            const fromNode = this.graph.nodes[edge.from];
            const toNode = this.graph.nodes[edge.to];
            
            this.ctx.beginPath();
            this.ctx.moveTo(fromNode.x, fromNode.y);
            this.ctx.lineTo(toNode.x, toNode.y);
            
            if (this.currentEdge && 
                this.currentEdge.from === edge.from && 
                this.currentEdge.to === edge.to) {
                this.ctx.strokeStyle = '#ff5722';
                this.ctx.lineWidth = 4;
            } else {
                this.ctx.strokeStyle = '#b0b0b0';
                this.ctx.lineWidth = 2;
            }
            
            this.ctx.stroke();
            
            // Draw weight with background
            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2;
            
            // Weight background circle
            this.ctx.beginPath();
            this.ctx.arc(midX, midY, 12, 0, 2 * Math.PI);
            this.ctx.fillStyle = 'white';
            this.ctx.fill();
            
            // Weight text
            this.ctx.fillStyle = '#333';
            this.ctx.font = 'bold 11px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(edge.weight.toString(), midX, midY);
        });
        
        // Draw nodes on top
        this.graph.nodes.forEach(node => {
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, 24, 0, 2 * Math.PI);
            
            if (node.visited) {
                this.ctx.fillStyle = '#4caf50';
            } else if (this.currentNode && this.currentNode === node.id) {
                this.ctx.fillStyle = '#ff5722';
            } else {
                this.ctx.fillStyle = '#667eea';
            }
            
            this.ctx.fill();
            this.ctx.strokeStyle = '#2c3e50';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            // Node value with better contrast
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
            this.ctx.shadowBlur = 2;
            this.ctx.fillText(node.id.toString(), node.x, node.y);
            this.ctx.shadowBlur = 0;
        });
    }

    drawTree() {
        if (!this.tree) return;
        
        // Draw edges first (behind nodes)
        this.tree.edges.forEach(edge => {
            const fromNode = this.tree.nodes[edge.from];
            const toNode = this.tree.nodes[edge.to];
            
            this.ctx.beginPath();
            this.ctx.moveTo(fromNode.x, fromNode.y);
            this.ctx.lineTo(toNode.x, toNode.y);
            this.ctx.strokeStyle = '#90a4ae';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        });
        
        // Draw nodes on top
        this.tree.nodes.forEach(node => {
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, 24, 0, 2 * Math.PI);
            
            if (node.visited) {
                this.ctx.fillStyle = '#4caf50';
            } else if (this.currentNode && this.currentNode === node.id) {
                this.ctx.fillStyle = '#ff5722';
            } else {
                this.ctx.fillStyle = '#667eea';
            }
            
            this.ctx.fill();
            this.ctx.strokeStyle = '#2c3e50';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            // Node value with better contrast
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
            this.ctx.shadowBlur = 2;
            this.ctx.fillText(node.value.toString(), node.x, node.y);
            this.ctx.shadowBlur = 0;
        });
    }

    drawFibonacci() {
        const boxWidth = 70;
        const boxHeight = 50;
        const startX = 30;
        const startY = this.canvas.height / 2 - boxHeight / 2;
        
        this.fibSequence.forEach((value, index) => {
            const x = startX + index * (boxWidth + 15);
            const y = startY;
            
            // Box with gradient effect
            this.ctx.fillStyle = this.highlightIndices && this.highlightIndices.includes(index) 
                ? '#ff5722' 
                : '#667eea';
            
            this.ctx.fillRect(x, y, boxWidth, boxHeight);
            
            // Border
            this.ctx.strokeStyle = '#2c3e50';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, boxWidth, boxHeight);
            
            // Value text
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
            this.ctx.shadowBlur = 2;
            this.ctx.fillText(value.toString(), x + boxWidth / 2, y + boxHeight / 2);
            this.ctx.shadowBlur = 0;
            
            // Index label
            this.ctx.fillStyle = '#424242';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(`F(${index})`, x + boxWidth / 2, y + boxHeight + 25);
        });
    }

    drawString() {
        if (!this.data || !this.data.text) return;
        
        const charWidth = 35;
        const charHeight = 35;
        const startX = 30;
        const textY = 80;
        const patternY = 200;
        
        // Draw text label
        this.ctx.fillStyle = '#1976d2';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Text:', startX, textY - 25);
        
        // Draw text characters
        this.data.text.forEach((char, index) => {
            const x = startX + 70 + index * charWidth;
            
            // Box background
            this.ctx.fillStyle = this.data.textIndex === index ? '#ff5722' : '#667eea';
            this.ctx.fillRect(x, textY - 20, charWidth, charHeight);
            
            // Border
            this.ctx.strokeStyle = '#2c3e50';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, textY - 20, charWidth, charHeight);
            
            // Character text
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
            this.ctx.shadowBlur = 2;
            this.ctx.fillText(char, x + charWidth / 2, textY - 2);
            this.ctx.shadowBlur = 0;
            
            // Index below
            this.ctx.fillStyle = '#666';
            this.ctx.font = '11px Arial';
            this.ctx.fillText(index.toString(), x + charWidth / 2, textY + 20);
        });
        
        // Draw pattern label
        this.ctx.fillStyle = '#1976d2';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Pattern:', startX, patternY - 25);
        
        // Draw pattern characters
        this.data.pattern.forEach((char, index) => {
            const x = startX + 70 + index * charWidth;
            
            // Box background
            this.ctx.fillStyle = this.data.patternIndex === index ? '#ff5722' : '#4caf50';
            this.ctx.fillRect(x, patternY - 20, charWidth, charHeight);
            
            // Border
            this.ctx.strokeStyle = '#2c3e50';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, patternY - 20, charWidth, charHeight);
            
            // Character text
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
            this.ctx.shadowBlur = 2;
            this.ctx.fillText(char, x + charWidth / 2, patternY - 2);
            this.ctx.shadowBlur = 0;
            
            // Index below
            this.ctx.fillStyle = '#666';
            this.ctx.font = '11px Arial';
            this.ctx.fillText(index.toString(), x + charWidth / 2, patternY + 20);
        });
    }
}

// Initialize the simulator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.simulator = new AlgorithmSimulator();
});
