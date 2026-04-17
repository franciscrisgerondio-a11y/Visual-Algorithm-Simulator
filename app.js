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
        this.logEntries = [];
        this.maxLogEntries = 100;
        
        // Animation timing
        this.lastDrawTime = 0;
        this.animationDelay = 100; // Base delay in ms
        
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
        // CRITICAL FIX: Stop any running simulation immediately
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
        
        // Show warning for incomplete algorithms
        showWarningForIncomplete(algoId);
        
        this.reset();
        this.initializeAlgorithm();
        this.updateDescription();
        this.updateCode();
    }

    initializeAlgorithm() {
        this.resetStats();
        this.data = [];
        // Don't set graph to null here, preserve structure for reset
        // this.graph = null;
        this.tree = null;
        
        // Clear all DP data structures
        this.fibSequence = null;
        this.lcsData = null;
        this.knapsackData = null;
        this.coinData = null;
        this.editData = null;
        this.matrixData = null;
        
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
        
        // Create random edges with guaranteed connectivity
        // First create a spanning path to ensure all nodes are connected
        for (let i = 0; i < nodes - 1; i++) {
            const edge = { from: i, to: i + 1, weight: Math.floor(Math.random() * 20) + 1 };
            this.graph.edges.push(edge);
        }
        
        // Add some random extra edges
        for (let i = 0; i < nodes; i++) {
            const numExtraEdges = Math.floor(Math.random() * 2);
            for (let j = 0; j < numExtraEdges; j++) {
                const target = Math.floor(Math.random() * nodes);
                if (target !== i && Math.abs(target - i) > 1) {
                    const edge = { from: i, to: target, weight: Math.floor(Math.random() * 30) + 5 };
                    if (!this.graph.edges.some(e => e.from === edge.from && e.to === edge.to)) {
                        this.graph.edges.push(edge);
                    }
                }
            }
        }
        
        // Set start and end nodes
        this.startNode = 0;
        this.endNode = nodes - 1;
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
        this.logEntries = [];
        this.updateStatsDisplay();
        this.clearLog();
    }

    updateStatsDisplay() {
        let statsText = '';
        if (this.stats.comparisons > 0) statsText += `Comparisons: ${this.stats.comparisons} | `;
        if (this.stats.swaps > 0) statsText += `Swaps: ${this.stats.swaps} | `;
        if (this.stats.operations > 0) statsText += `Operations: ${this.stats.operations}`;
        document.getElementById('stats').textContent = statsText || 'Ready';
    }

    // Logging functionality
    addLog(message, type = 'normal') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            message: message,
            type: type,
            timestamp: timestamp
        };
        
        this.logEntries.push(logEntry);
        
        // Keep only last maxLogEntries
        if (this.logEntries.length > this.maxLogEntries) {
            this.logEntries.shift();
        }
        
        this.updateLogDisplay();
    }

    updateLogDisplay() {
        const logContainer = document.getElementById('simulation-log');
        if (!logContainer) return;
        
        logContainer.innerHTML = this.logEntries.map(entry => {
            const className = `log-entry ${entry.type}`;
            return `<div class="${className}">[${entry.timestamp}] ${entry.message}</div>`;
        }).join('');
        
        // Auto-scroll to bottom
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    clearLog() {
        const logContainer = document.getElementById('simulation-log');
        if (logContainer) {
            logContainer.innerHTML = '';
        }
    }

    async waitForResume() {
        while (this.isPaused && this.isRunning) {
            await this.sleep(100);
        }
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
            this.addLog('Simulation completed successfully!', 'success');
        } catch (error) {
            console.error('Algorithm error:', error);
            this.addLog(`Error: ${error.message}`, 'error');
        }
        
        this.isRunning = false;
        document.getElementById('start-btn').disabled = false;
    }

    pause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pause-btn').textContent = this.isPaused ? '▶ Resume' : '⏸ Pause';
        
        if (this.isPaused) {
            this.addLog('Simulation paused', 'highlight');
        } else {
            this.addLog('Simulation resumed', 'normal');
        }
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
        
        // Clear all DP and visualization data
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
        
        // Reset graph node states if graph exists
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
            case 'jumpSearch':
                await this.jumpSearch();
                break;
            case 'exponentialSearch':
                await this.exponentialSearch();
                break;
            case 'interpolationSearch':
                await this.interpolationSearch();
                break;
            case 'bfs':
                await this.runBFS();
                break;
            case 'dfs':
                await this.runDFS();
                break;
            case 'dijkstra':
                await this.runDijkstra();
                break;
            case 'bellmanFord':
                await this.runBellmanFord();
                break;
            case 'floydWarshall':
                await this.runFloydWarshall();
                break;
            case 'kruskal':
                await this.runKruskal();
                break;
            case 'prim':
                await this.runPrim();
                break;
            case 'topologicalSort':
                await this.runTopologicalSort();
                break;
            case 'astar':
                await this.runAStar();
                break;
            case 'fibonacci':
                await this.visualizeFibonacci();
                break;
            case 'lcs':
                await this.visualizeLCS();
                break;
            case 'knapsack':
                await this.visualizeKnapsack();
                break;
            case 'coinChange':
                await this.visualizeCoinChange();
                break;
            case 'editDistance':
                await this.visualizeEditDistance();
                break;
            case 'matrixChain':
                await this.visualizeMatrixChain();
                break;
            case 'bst':
                await this.visualizeBST();
                break;
            case 'avlTree':
                await this.visualizeAVL();
                break;
            case 'redBlackTree':
                await this.visualizeRedBlack();
                break;
            case 'treeTraversals':
                await this.visualizeTreeTraversals();
                break;
            case 'heapOps':
                await this.visualizeHeapOps();
                break;
            case 'trie':
                await this.visualizeTrie();
                break;
            case 'naiveSearch':
                await this.naiveSearch();
                break;
            case 'kmp':
                await this.kmpSearch();
                break;
            case 'rabinKarp':
                await this.rabinKarpSearch();
                break;
            case 'zAlgorithm':
                await this.zAlgorithmSearch();
                break;
            case 'manacher':
                await this.manacherSearch();
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
        this.addLog(`Starting Bubble Sort on array of ${n} elements`, 'normal');
        
        for (let i = 0; i < n - 1; i++) {
            let swapped = false;
            this.addLog(`Pass ${i + 1}: Starting iteration`, 'normal');
            
            for (let j = 0; j < n - i - 1; j++) {
                if (this.isPaused) await this.waitForResume();
                
                this.stats.comparisons++;
                this.highlightIndices = [j, j + 1];
                this.draw();
                
                if (this.data[j] > this.data[j + 1]) {
                    this.stats.swaps++;
                    this.addLog(`Comparing indices ${j} and ${j+1}: ${this.data[j]} > ${this.data[j+1]}, swapping!`, 'normal');
                    [this.data[j], this.data[j + 1]] = [this.data[j + 1], this.data[j]];
                    this.draw();
                    await this.sleep(50);
                    swapped = true;
                } else {
                    this.addLog(`Comparing indices ${j} and ${j+1}: ${this.data[j]} ≤ ${this.data[j+1]}, no swap`, 'normal');
                    await this.sleep(30);
                }
            }
            
            if (!swapped) {
                this.addLog('Array is already sorted, early termination', 'success');
                break;
            }
        }
        
        this.highlightIndices = [];
        this.draw();
        this.addLog('Bubble Sort completed!', 'success');
    }

    async selectionSort() {
        let n = this.data.length;
        this.addLog(`Starting Selection Sort on array of ${n} elements`, 'normal');
        
        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            this.addLog(`Finding minimum element from index ${i} to ${n-1}`, 'normal');
            
            for (let j = i + 1; j < n; j++) {
                if (this.isPaused) await this.waitForResume();
                
                this.stats.comparisons++;
                this.highlightIndices = [minIdx, j];
                this.draw();
                
                if (this.data[j] < this.data[minIdx]) {
                    this.addLog(`Found new minimum: ${this.data[j]} at index ${j} (was ${this.data[minIdx]} at ${minIdx})`, 'highlight');
                    minIdx = j;
                }
                
                await this.sleep(30);
            }
            
            if (minIdx !== i) {
                this.stats.swaps++;
                this.addLog(`Swapping ${this.data[i]} with minimum ${this.data[minIdx]}`, 'normal');
                [this.data[i], this.data[minIdx]] = [this.data[minIdx], this.data[i]];
                this.draw();
                await this.sleep(50);
            } else {
                this.addLog(`Element at index ${i} is already in correct position`, 'normal');
            }
        }
        
        this.highlightIndices = [];
        this.draw();
        this.addLog('Selection Sort completed!', 'success');
    }

    async insertionSort() {
        let n = this.data.length;
        this.addLog(`Starting Insertion Sort on array of ${n} elements`, 'normal');
        
        for (let i = 1; i < n; i++) {
            let key = this.data[i];
            let j = i - 1;
            
            this.highlightIndices = [i];
            this.draw();
            this.addLog(`Taking element at index ${i} (value: ${key})`, 'normal');
            await this.sleep(50);
            
            while (j >= 0) {
                if (this.isPaused) await this.waitForResume();
                
                this.stats.comparisons++;
                this.highlightIndices = [j, j + 1];
                this.draw();
                
                if (this.data[j] > key) {
                    this.stats.swaps++;
                    this.addLog(`${this.data[j]} > ${key}, shifting ${this.data[j]} to right`, 'normal');
                    this.data[j + 1] = this.data[j];
                    j--;
                    this.draw();
                    await this.sleep(50);
                } else {
                    this.addLog(`${this.data[j]} ≤ ${key}, found correct position`, 'success');
                    break;
                }
            }
            this.data[j + 1] = key;
            this.addLog(`Inserted ${key} at position ${j + 1}`, 'highlight');
            this.draw();
        }
        
        this.highlightIndices = [];
        this.draw();
        this.addLog('Insertion Sort completed!', 'success');
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
        this.addLog(`Starting Linear Search for value ${target}`, 'normal');
        
        for (let i = 0; i < this.data.length; i++) {
            if (this.isPaused) await this.waitForResume();
            
            this.stats.comparisons++;
            this.highlightIndices = [i];
            this.draw();
            
            if (this.data[i] === target) {
                this.addLog(`Found ${target} at index ${i}!`, 'success');
                this.foundIndex = i;
                this.draw();
                await this.sleep(500);
                return;
            } else {
                this.addLog(`Checking index ${i}: ${this.data[i]} ≠ ${target}`, 'normal');
                await this.sleep(100);
            }
        }
        
        this.addLog('Element not found', 'error');
    }

    async binarySearch() {
        // First sort the array
        this.data.sort((a, b) => a - b);
        this.draw();
        await this.sleep(500);
        
        let target = this.data[this.targetIndex];
        let left = 0;
        let right = this.data.length - 1;
        
        this.addLog(`Starting Binary Search for value ${target}`, 'normal');
        
        while (left <= right) {
            if (this.isPaused) await this.waitForResume();
            
            let mid = Math.floor((left + right) / 2);
            this.stats.comparisons++;
            this.highlightIndices = [left, mid, right];
            this.draw();
            
            if (this.data[mid] === target) {
                this.addLog(`Found ${target} at index ${mid}!`, 'success');
                this.foundIndex = mid;
                this.draw();
                await this.sleep(500);
                return;
            } else if (this.data[mid] < target) {
                this.addLog(`${this.data[mid]} < ${target}, searching right half`, 'normal');
                left = mid + 1;
            } else {
                this.addLog(`${this.data[mid]} > ${target}, searching left half`, 'normal');
                right = mid - 1;
            }
            
            await this.sleep(100);
        }
        
        this.addLog('Element not found', 'error');
    }

    async jumpSearch() {
        this.data.sort((a, b) => a - b);
        this.draw();
        await this.sleep(500);
        
        let n = this.data.length;
        let step = Math.floor(Math.sqrt(n));
        let target = this.data[this.targetIndex];
        let prev = 0;
        
        while (this.data[Math.min(step, n) - 1] < target) {
            if (this.isPaused) await this.waitForResume();
            prev = step;
            step += Math.floor(Math.sqrt(n));
            this.highlightIndices = [prev];
            this.stats.comparisons++;
            this.draw();
            await this.sleep(100);
            if (prev >= n) return;
        }
        
        while (this.data[prev] < target) {
            if (this.isPaused) await this.waitForResume();
            this.highlightIndices = [prev];
            this.stats.comparisons++;
            this.draw();
            await this.sleep(100);
            prev++;
            if (prev >= n) return;
        }
        
        if (this.data[prev] === target) {
            this.foundIndex = prev;
            this.draw();
            await this.sleep(500);
        }
    }

    async exponentialSearch() {
        this.data.sort((a, b) => a - b);
        this.draw();
        await this.sleep(500);
        
        let target = this.data[this.targetIndex];
        let n = this.data.length;
        
        if (this.data[0] === target) {
            this.foundIndex = 0;
            this.draw();
            await this.sleep(500);
            return;
        }
        
        let i = 1;
        while (i < n && this.data[i] <= target) {
            if (this.isPaused) await this.waitForResume();
            this.highlightIndices = [i];
            this.stats.comparisons++;
            this.draw();
            await this.sleep(100);
            i *= 2;
        }
        
        let left = Math.floor(i / 2);
        let right = Math.min(i, n - 1);
        
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

    async interpolationSearch() {
        this.data.sort((a, b) => a - b);
        this.draw();
        await this.sleep(500);
        
        let target = this.data[this.targetIndex];
        let lo = 0;
        let hi = this.data.length - 1;
        
        while (lo <= hi && target >= this.data[lo] && target <= this.data[hi]) {
            if (this.isPaused) await this.waitForResume();
            
            let pos = lo + Math.floor(((target - this.data[lo]) * (hi - lo)) / (this.data[hi] - this.data[lo]));
            this.stats.comparisons++;
            this.highlightIndices = [lo, pos, hi];
            this.draw();
            await this.sleep(100);
            
            if (this.data[pos] === target) {
                this.foundIndex = pos;
                this.draw();
                await this.sleep(500);
                return;
            }
            
            if (this.data[pos] < target) {
                lo = pos + 1;
            } else {
                hi = pos - 1;
            }
        }
    }

    // Graph Algorithms
    async runBFS() {
        if (!this.graph || this.graph.nodes.length === 0) return;
        
        let startNode = 0;
        let visited = new Set();
        let queue = [startNode];
        
        this.addLog(`Starting BFS from node ${startNode}`, 'normal');
        
        visited.add(startNode);
        this.graph.nodes[startNode].visited = true;
        this.draw();
        await this.sleep(500);
        
        while (queue.length > 0 && this.isRunning) {
            if (this.isPaused) await this.waitForResume();
            if (!this.isRunning) return;
            
            let current = queue.shift();
            this.stats.operations++;
            this.addLog(`Visiting node ${current}`, 'normal');
            
            // Find neighbors
            let neighbors = this.graph.edges
                .filter(e => e.from === current)
                .map(e => e.to);
            
            for (let neighbor of neighbors) {
                if (!visited.has(neighbor) && this.isRunning) {
                    if (this.isPaused) await this.waitForResume();
                    if (!this.isRunning) return;
                    
                    visited.add(neighbor);
                    this.graph.nodes[neighbor].visited = true;
                    this.currentEdge = { from: current, to: neighbor };
                    this.addLog(`Exploring edge ${current} → ${neighbor}`, 'highlight');
                    this.draw();
                    await this.sleep(500);
                    
                    queue.push(neighbor);
                }
            }
        }
        
        this.addLog('BFS traversal completed!', 'success');
    }

    async runDFS() {
        if (!this.graph || this.graph.nodes.length === 0) return;
        
        this.addLog('Starting DFS traversal', 'normal');
        let visited = new Set();
        await this.dfsVisit(0, visited);
        this.addLog('DFS traversal completed!', 'success');
    }

    async dfsVisit(node, visited) {
        if (!this.isRunning) return;
        if (this.isPaused) await this.waitForResume();
        if (!this.isRunning) return;
        
        visited.add(node);
        this.graph.nodes[node].visited = true;
        this.stats.operations++;
        this.addLog(`Visiting node ${node}`, 'normal');
        this.draw();
        await this.sleep(500);
        
        let neighbors = this.graph.edges
            .filter(e => e.from === node)
            .map(e => e.to);
        
        for (let neighbor of neighbors) {
            if (!visited.has(neighbor) && this.isRunning) {
                this.currentEdge = { from: node, to: neighbor };
                this.addLog(`Exploring edge ${node} → ${neighbor}`, 'highlight');
                await this.dfsVisit(neighbor, visited);
            }
        }
    }

    async runDijkstra() {
        if (!this.graph || this.graph.nodes.length === 0) return;
        
        const startNode = 0;
        const distances = this.graph.nodes.map(() => Infinity);
        distances[startNode] = 0;
        const visited = new Set();
        const pq = [{ node: startNode, dist: 0 }];
        
        while (pq.length > 0 && this.isRunning) {
            if (this.isPaused) await this.waitForResume();
            if (!this.isRunning) return;
            
            pq.sort((a, b) => a.dist - b.dist);
            const current = pq.shift();
            const node = current.node;
            
            if (visited.has(node)) continue;
            
            visited.add(node);
            this.currentNode = node;
            this.graph.nodes[node].distance = distances[node];
            this.draw();
            this.stats.operations++;
            await this.sleep(400);
            
            const neighbors = this.graph.edges.filter(e => e.from === node);
            for (const edge of neighbors) {
                if (this.isRunning && !visited.has(edge.to)) {
                    this.currentEdge = { from: node, to: edge.to };
                    const newDist = distances[node] + edge.weight;
                    if (newDist < distances[edge.to]) {
                        distances[edge.to] = newDist;
                        pq.push({ node: edge.to, dist: newDist });
                        this.graph.nodes[edge.to].distance = newDist;
                        this.draw();
                        await this.sleep(200);
                    }
                }
            }
        }
    }

    async runBellmanFord() {
        if (!this.graph || this.graph.nodes.length === 0) return;
        
        const startNode = 0;
        const distances = this.graph.nodes.map(() => Infinity);
        distances[startNode] = 0;
        
        for (let i = 0; i < this.graph.nodes.length - 1 && this.isRunning; i++) {
            if (this.isPaused) await this.waitForResume();
            if (!this.isRunning) return;
            
            let updated = false;
            for (const edge of this.graph.edges) {
                if (!this.isRunning) return;
                
                this.currentEdge = edge;
                this.currentNode = edge.from;
                
                if (distances[edge.from] !== Infinity && distances[edge.from] + edge.weight < distances[edge.to]) {
                    distances[edge.to] = distances[edge.from] + edge.weight;
                    this.graph.nodes[edge.to].distance = distances[edge.to];
                    updated = true;
                    this.stats.operations++;
                    this.draw();
                    await this.sleep(150);
                }
            }
            
            if (!updated) break;
        }
    }

    async runFloydWarshall() {
        if (!this.graph || this.graph.nodes.length === 0) return;
        
        const n = this.graph.nodes.length;
        const dist = Array(n).fill(null).map(() => Array(n).fill(Infinity));
        
        for (let i = 0; i < n; i++) dist[i][i] = 0;
        for (const edge of this.graph.edges) {
            dist[edge.from][edge.to] = edge.weight;
        }
        
        for (let k = 0; k < n && this.isRunning; k++) {
            if (this.isPaused) await this.waitForResume();
            if (!this.isRunning) return;
            
            this.currentNode = k;
            this.draw();
            await this.sleep(300);
            
            for (let i = 0; i < n && this.isRunning; i++) {
                for (let j = 0; j < n && this.isRunning; j++) {
                    if (dist[i][k] !== Infinity && dist[k][j] !== Infinity && dist[i][k] + dist[k][j] < dist[i][j]) {
                        dist[i][j] = dist[i][k] + dist[k][j];
                        this.stats.operations++;
                        this.draw();
                        await this.sleep(50);
                    }
                }
            }
        }
    }

    async runKruskal() {
        if (!this.graph || this.graph.nodes.length === 0) return;
        
        const edges = [...this.graph.edges].sort((a, b) => a.weight - b.weight);
        const parent = this.graph.nodes.map((_, i) => i);
        const mst = [];
        
        const find = (x) => {
            if (parent[x] !== x) parent[x] = find(parent[x]);
            return parent[x];
        };
        
        const union = (x, y) => {
            const px = find(x), py = find(y);
            if (px !== py) { parent[px] = py; return true; }
            return false;
        };
        
        for (const edge of edges) {
            if (!this.isRunning) return;
            if (this.isPaused) await this.waitForResume();
            
            this.currentEdge = edge;
            this.draw();
            
            if (union(edge.from, edge.to)) {
                mst.push(edge);
                this.stats.operations++;
                await this.sleep(400);
            } else {
                await this.sleep(200);
            }
            
            if (mst.length === this.graph.nodes.length - 1) break;
        }
    }

    async runPrim() {
        if (!this.graph || this.graph.nodes.length === 0) return;
        
        const startNode = 0;
        const visited = new Set([startNode]);
        const mst = [];
        const pq = [];
        
        // Add edges from start node
        this.graph.edges.filter(e => e.from === startNode).forEach(e => {
            pq.push(e);
        });
        
        while (pq.length > 0 && this.isRunning && visited.size < this.graph.nodes.length) {
            if (this.isPaused) await this.waitForResume();
            if (!this.isRunning) return;
            
            pq.sort((a, b) => a.weight - b.weight);
            const edge = pq.shift();
            
            this.currentEdge = edge;
            
            if (!visited.has(edge.to)) {
                visited.add(edge.to);
                mst.push(edge);
                this.graph.nodes[edge.to].visited = true;
                this.stats.operations++;
                this.draw();
                await this.sleep(400);
                
                // Add edges from new node
                this.graph.edges.filter(e => e.from === edge.to && !visited.has(e.to)).forEach(e => {
                    pq.push(e);
                });
            } else {
                await this.sleep(200);
            }
        }
    }

    async runTopologicalSort() {
        if (!this.graph || this.graph.nodes.length === 0) return;
        
        const inDegree = this.graph.nodes.map(() => 0);
        for (const edge of this.graph.edges) {
            inDegree[edge.to]++;
        }
        
        const queue = [];
        for (let i = 0; i < this.graph.nodes.length; i++) {
            if (inDegree[i] === 0) queue.push(i);
        }
        
        const result = [];
        
        while (queue.length > 0 && this.isRunning) {
            if (this.isPaused) await this.waitForResume();
            if (!this.isRunning) return;
            
            const node = queue.shift();
            this.currentNode = node;
            this.graph.nodes[node].visited = true;
            result.push(node);
            this.stats.operations++;
            this.draw();
            await this.sleep(400);
            
            const neighbors = this.graph.edges.filter(e => e.from === node);
            for (const edge of neighbors) {
                if (this.isRunning) {
                    inDegree[edge.to]--;
                    if (inDegree[edge.to] === 0) {
                        queue.push(edge.to);
                    }
                    this.currentEdge = edge;
                    this.draw();
                    await this.sleep(150);
                }
            }
        }
    }

    async runAStar() {
        if (!this.graph || this.graph.nodes.length === 0) return;
        
        const startNode = 0;
        const goalNode = this.graph.nodes.length - 1;
        const openSet = [{ node: startNode, g: 0, h: 0, f: 0 }];
        const cameFrom = {};
        const gScore = this.graph.nodes.map(() => Infinity);
        gScore[startNode] = 0;
        
        const heuristic = (a, b) => {
            const na = this.graph.nodes[a], nb = this.graph.nodes[b];
            return Math.sqrt(Math.pow(na.x - nb.x, 2) + Math.pow(na.y - nb.y, 2));
        };
        
        while (openSet.length > 0 && this.isRunning) {
            if (this.isPaused) await this.waitForResume();
            if (!this.isRunning) return;
            
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            const node = current.node;
            
            this.currentNode = node;
            this.graph.nodes[node].visited = true;
            this.draw();
            this.stats.operations++;
            await this.sleep(300);
            
            if (node === goalNode) break;
            
            const neighbors = this.graph.edges.filter(e => e.from === node);
            for (const edge of neighbors) {
                if (this.isRunning) {
                    this.currentEdge = edge;
                    const tentativeG = gScore[node] + edge.weight;
                    
                    if (tentativeG < gScore[edge.to]) {
                        cameFrom[edge.to] = node;
                        gScore[edge.to] = tentativeG;
                        const h = heuristic(edge.to, goalNode);
                        const f = tentativeG + h;
                        openSet.push({ node: edge.to, g: tentativeG, h, f });
                        this.draw();
                        await this.sleep(150);
                    }
                }
            }
        }
    }

    async visualizeFibonacci() {
        let n = 10;
        let fib = [0, 1];
        
        this.fibSequence = [0, 1];
        this.highlightIndices = [];
        
        // Initial draw
        this.draw();
        this.addLog('Starting Fibonacci sequence: F(0)=0, F(1)=1', 'highlight');
        
        for (let i = 2; i <= n && this.isRunning; i++) {
            if (this.isPaused) await this.waitForResume();
            if (!this.isRunning) return;
            
            fib[i] = fib[i - 1] + fib[i - 2];
            this.stats.operations++;
            this.fibSequence = fib.slice(0, i + 1);
            this.highlightIndices = [i - 1, i - 2];
            this.addLog(`F(${i}) = F(${i-1}) + F(${i-2}) = ${fib[i-1]} + ${fib[i-2]} = ${fib[i]}`, 'highlight');
            this.draw();
            await this.sleep(500);
        }
        
        this.addLog(`Fibonacci sequence complete! F(${n}) = ${fib[n]}`, 'success');
        this.isRunning = false;
        document.getElementById('startBtn').disabled = false;
    }

    async visualizeLCS() {
        const s1 = "ABCDGH";
        const s2 = "AEDFHR";
        const m = s1.length, n = s2.length;
        const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
        
        this.lcsData = { s1, s2, dp, currentI: 0, currentJ: 0 };
        
        // Initial draw
        this.draw();
        this.addLog('Finding Longest Common Subsequence', 'highlight');
        
        for (let i = 1; i <= m && this.isRunning; i++) {
            if (this.isPaused) await this.waitForResume();
            if (!this.isRunning) return;
            
            for (let j = 1; j <= n && this.isRunning; j++) {
                if (!this.isRunning) return;
                
                this.lcsData.currentI = i;
                this.lcsData.currentJ = j;
                
                if (s1[i - 1] === s2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                    this.addLog(`Match: '${s1[i-1]}' == '${s2[j-1]}', LCS length = ${dp[i][j]}`, 'highlight');
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                    this.addLog(`No match: max(LCS[${i-1}][${j}], LCS[${i}][${j-1}]) = ${dp[i][j]}`, 'highlight');
                }
                
                this.stats.operations++;
                this.draw();
                await this.sleep(100);
            }
        }
        
        this.addLog(`LCS length: ${dp[m][n]}`, 'success');
        this.isRunning = false;
        document.getElementById('startBtn').disabled = false;
    }

    async visualizeKnapsack() {
        const weights = [2, 3, 4, 5];
        const values = [3, 4, 5, 6];
        const capacity = 8;
        const n = weights.length;
        const dp = Array(n + 1).fill(null).map(() => Array(capacity + 1).fill(0));
        
        this.knapsackData = { weights, values, capacity, dp, currentI: 0, currentW: 0 };
        
        // Initial draw
        this.draw();
        
        for (let i = 1; i <= n && this.isRunning; i++) {
            if (this.isPaused) await this.waitForResume();
            if (!this.isRunning) return;
            
            for (let w = 0; w <= capacity && this.isRunning; w++) {
                if (!this.isRunning) return;
                
                this.knapsackData.currentI = i;
                this.knapsackData.currentW = w;
                
                if (weights[i - 1] <= w) {
                    dp[i][w] = Math.max(dp[i - 1][w], values[i - 1] + dp[i - 1][w - weights[i - 1]]);
                } else {
                    dp[i][w] = dp[i - 1][w];
                }
                
                this.stats.operations++;
                this.addLog(`Item ${i}, Capacity ${w}: Value = ${dp[i][w]}`, 'highlight');
                this.draw();
                await this.sleep(80);
            }
        }
        
        this.addLog(`Maximum value: ${dp[n][capacity]}`, 'success');
        this.isRunning = false;
        document.getElementById('startBtn').disabled = false;
    }

    async visualizeCoinChange() {
        const coins = [1, 2, 5];
        const amount = 11;
        const dp = Array(amount + 1).fill(Infinity);
        dp[0] = 0;
        
        this.coinData = { coins, amount, dp, currentCoin: 0, currentAmt: 0 };
        
        // Initial draw
        this.draw();
        
        for (let coin of coins) {
            if (!this.isRunning) return;
            if (this.isPaused) await this.waitForResume();
            
            this.coinData.currentCoin = coin;
            this.addLog(`Using coin: ${coin}`, 'highlight');
            
            for (let a = coin; a <= amount && this.isRunning; a++) {
                if (!this.isRunning) return;
                
                this.coinData.currentAmt = a;
                
                if (dp[a - coin] !== Infinity) {
                    dp[a] = Math.min(dp[a], dp[a - coin] + 1);
                    this.addLog(`Amount ${a}: min coins = ${dp[a]}`, 'highlight');
                }
                
                this.stats.operations++;
                this.draw();
                await this.sleep(150);
            }
        }
        
        this.addLog(`Minimum coins needed: ${dp[amount]}`, 'success');
        this.isRunning = false;
        document.getElementById('startBtn').disabled = false;
    }

    async visualizeEditDistance() {
        const s1 = "INTENTION";
        const s2 = "EXECUTION";
        const m = s1.length, n = s2.length;
        const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
        
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        
        this.editData = { s1, s2, dp, currentI: 0, currentJ: 0 };
        
        // Initial draw
        this.draw();
        
        for (let i = 1; i <= m && this.isRunning; i++) {
            if (this.isPaused) await this.waitForResume();
            if (!this.isRunning) return;
            
            for (let j = 1; j <= n && this.isRunning; j++) {
                if (!this.isRunning) return;
                
                this.editData.currentI = i;
                this.editData.currentJ = j;
                
                if (s1[i - 1] === s2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                    this.addLog(`Match: '${s1[i-1]}' == '${s2[j-1]}', dp[${i}][${j}] = ${dp[i][j]}`, 'highlight');
                } else {
                    dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
                    this.addLog(`Edit: dp[${i}][${j}] = 1 + min(${dp[i-1][j]}, ${dp[i][j-1]}, ${dp[i-1][j-1]})`, 'highlight');
                }
                
                this.stats.operations++;
                this.draw();
                await this.sleep(80);
            }
        }
        
        this.addLog(`Edit distance: ${dp[m][n]}`, 'success');
        this.isRunning = false;
        document.getElementById('startBtn').disabled = false;
    }

    async visualizeMatrixChain() {
        const dims = [10, 20, 30, 40, 30];
        const n = dims.length - 1;
        const dp = Array(n + 1).fill(null).map(() => Array(n + 1).fill(0));
        
        this.matrixData = { dims, dp, currentLen: 0, currentI: 0, currentJ: 0 };
        
        // Initial draw
        this.draw();
        
        for (let len = 2; len <= n && this.isRunning; len++) {
            if (this.isPaused) await this.waitForResume();
            if (!this.isRunning) return;
            
            this.matrixData.currentLen = len;
            this.addLog(`Chain length: ${len}`, 'highlight');
            
            for (let i = 1; i <= n - len + 1 && this.isRunning; i++) {
                if (!this.isRunning) return;
                
                const j = i + len - 1;
                this.matrixData.currentI = i;
                this.matrixData.currentJ = j;
                
                dp[i][j] = Infinity;
                
                for (let k = i; k < j && this.isRunning; k++) {
                    if (!this.isRunning) return;
                    
                    const cost = dp[i][k] + dp[k + 1][j] + dims[i - 1] * dims[k] * dims[j];
                    dp[i][j] = Math.min(dp[i][j], cost);
                    this.addLog(`Split at ${k}: cost = ${cost}`, 'highlight');
                    
                    this.stats.operations++;
                    this.draw();
                    await this.sleep(100);
                }
            }
        }
        
        this.addLog(`Minimum multiplications: ${dp[1][n]}`, 'success');
        this.isRunning = false;
        document.getElementById('startBtn').disabled = false;
    }

    async visualizeBST() {
        const values = [50, 30, 70, 20, 40, 60, 80];
        this.bstNodes = [];
        this.bstEdges = [];
        
        const insertNode = async (value) => {
            if (!this.isRunning) return;
            if (this.isPaused) await this.waitForResume();
            
            const newNode = { id: this.bstNodes.length, value, x: 0, y: 0, visited: false };
            this.bstNodes.push(newNode);
            
            if (this.bstNodes.length === 1) {
                newNode.x = this.canvas.width / 2;
                newNode.y = 60;
            } else {
                // Simple positioning
                const parentIdx = Math.floor((this.bstNodes.length - 2) / 2);
                const parent = this.bstNodes[parentIdx];
                const isLeft = value < parent.value;
                const level = Math.floor(Math.log2(this.bstNodes.length)) + 1;
                const spacing = this.canvas.width / Math.pow(2, level);
                
                newNode.y = parent.y + 70;
                newNode.x = isLeft ? parent.x - spacing : parent.x + spacing;
                
                this.bstEdges.push({ from: parentIdx, to: this.bstNodes.length - 1 });
            }
            
            this.currentNode = this.bstNodes.length - 1;
            this.stats.operations++;
            this.draw();
            await this.sleep(400);
        };
        
        for (const val of values) {
            await insertNode(val);
        }
    }

    async visualizeAVL() {
        // Simplified AVL visualization showing basic insertions
        const values = [30, 20, 40, 10, 25];
        this.avlNodes = [];
        this.avlEdges = [];
        
        for (let i = 0; i < values.length && this.isRunning; i++) {
            if (this.isPaused) await this.waitForResume();
            if (!this.isRunning) return;
            
            const node = { id: i, value: values[i], x: 50 + i * 80, y: 100 + (i % 3) * 80, visited: true };
            this.avlNodes.push(node);
            
            if (i > 0) {
                this.avlEdges.push({ from: i - 1, to: i });
            }
            
            this.currentNode = i;
            this.stats.operations++;
            this.draw();
            await this.sleep(500);
        }
    }

    async visualizeRedBlack() {
        // Simplified Red-Black Tree visualization
        const values = [41, 38, 31, 12, 19, 8];
        this.rbNodes = [];
        this.rbEdges = [];
        
        for (let i = 0; i < values.length && this.isRunning; i++) {
            if (this.isPaused) await this.waitForResume();
            if (!this.isRunning) return;
            
            const isRed = i % 2 === 0;
            const node = { 
                id: i, 
                value: values[i], 
                x: 50 + i * 80, 
                y: 100 + (i % 3) * 80, 
                visited: true,
                color: isRed ? 'red' : 'black'
            };
            this.rbNodes.push(node);
            
            if (i > 0) {
                this.rbEdges.push({ from: i - 1, to: i });
            }
            
            this.currentNode = i;
            this.stats.operations++;
            this.draw();
            await this.sleep(500);
        }
    }

    async visualizeTreeTraversals() {
        // Show inorder traversal animation
        const values = [50, 30, 70, 20, 40, 60, 80];
        this.traversalOrder = [];
        this.treeNodes = values.map((v, i) => ({
            id: i,
            value: v,
            x: 50 + (i % 4) * 100,
            y: 50 + Math.floor(i / 4) * 80,
            visited: false
        }));
        
        for (let i = 0; i < this.treeNodes.length && this.isRunning; i++) {
            if (this.isPaused) await this.waitForResume();
            if (!this.isRunning) return;
            
            this.treeNodes[i].visited = true;
            this.traversalOrder.push(this.treeNodes[i].value);
            this.currentNode = i;
            this.stats.operations++;
            this.draw();
            await this.sleep(400);
        }
    }

    async visualizeHeapOps() {
        const values = [4, 10, 3, 5, 1];
        this.heapArray = [...values];
        
        // Build max heap
        for (let i = Math.floor(values.length / 2) - 1; i >= 0 && this.isRunning; i--) {
            if (this.isPaused) await this.waitForResume();
            if (!this.isRunning) return;
            
            await this.heapifyDown(i, values.length);
        }
    }

    async heapifyDown(i, n) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        
        this.highlightIndices = [i];
        this.draw();
        await this.sleep(300);
        
        if (left < n && this.heapArray[left] > this.heapArray[largest]) {
            largest = left;
        }
        if (right < n && this.heapArray[right] > this.heapArray[largest]) {
            largest = right;
        }
        
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
        this.trieNodes = [{ id: 0, char: 'root', x: this.canvas.width / 2, y: 50, visited: false }];
        this.trieEdges = [];
        
        let nodeId = 1;
        const levelHeight = 70;
        
        for (const word of words) {
            if (!this.isRunning) return;
            if (this.isPaused) await this.waitForResume();
            
            let parentId = 0;
            let x = this.trieNodes[0].x;
            let y = this.trieNodes[0].y;
            
            for (let c = 0; c < word.length && this.isRunning; c++) {
                const char = word[c];
                const newNode = {
                    id: nodeId,
                    char: char,
                    x: x + (c - 1) * 40,
                    y: y + levelHeight,
                    visited: true
                };
                
                this.trieNodes.push(newNode);
                this.trieEdges.push({ from: parentId, to: nodeId });
                
                this.currentNode = nodeId;
                parentId = nodeId;
                x = newNode.x;
                y = newNode.y;
                nodeId++;
                
                this.stats.operations++;
                this.draw();
                await this.sleep(300);
            }
        }
    }

    async naiveSearch() {
        const text = this.data.text;
        const pattern = this.data.pattern;
        const n = text.length;
        const m = pattern.length;
        
        for (let i = 0; i <= n - m && this.isRunning; i++) {
            if (this.isPaused) await this.waitForResume();
            if (!this.isRunning) return;
            
            this.data.textIndex = i;
            let j;
            
            for (j = 0; j < m && this.isRunning; j++) {
                if (!this.isRunning) return;
                
                this.data.patternIndex = j;
                this.compareIndices = [i + j];
                this.stats.comparisons++;
                this.draw();
                await this.sleep(200);
                
                if (text[i + j] !== pattern[j]) {
                    break;
                }
            }
            
            if (j === m) {
                this.foundIndex = i;
                this.draw();
                await this.sleep(500);
                return;
            }
        }
    }

    async kmpSearch() {
        const text = this.data.text;
        const pattern = this.data.pattern;
        const n = text.length;
        const m = pattern.length;
        
        // Compute LPS array
        const lps = Array(m).fill(0);
        let len = 0, i = 1;
        
        while (i < m && this.isRunning) {
            if (this.isPaused) await this.waitForResume();
            if (!this.isRunning) return;
            
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
            this.stats.operations++;
            this.draw();
            await this.sleep(150);
        }
        
        // Search using LPS
        i = 0;
        let j = 0;
        
        while (i < n && this.isRunning) {
            if (this.isPaused) await this.waitForResume();
            if (!this.isRunning) return;
            
            this.data.textIndex = i;
            this.data.patternIndex = j;
            
            if (pattern[j] === text[i]) {
                i++;
                j++;
                this.stats.comparisons++;
                this.draw();
                await this.sleep(200);
                
                if (j === m) {
                    this.foundIndex = i - j;
                    this.draw();
                    await this.sleep(500);
                    return;
                }
            } else {
                if (j !== 0) {
                    j = lps[j - 1];
                } else {
                    i++;
                }
            }
        }
    }

    async rabinKarpSearch() {
        const text = this.data.text;
        const pattern = this.data.pattern;
        const n = text.length;
        const m = pattern.length;
        const prime = 101;
        const d = 256;
        
        let patternHash = 0, textHash = 0, h = 1;
        
        for (let i = 0; i < m - 1; i++) {
            h = (h * d) % prime;
        }
        
        for (let i = 0; i < m; i++) {
            patternHash = (d * patternHash + pattern[i].charCodeAt(0)) % prime;
            textHash = (d * textHash + text[i].charCodeAt(0)) % prime;
        }
        
        for (let i = 0; i <= n - m && this.isRunning; i++) {
            if (this.isPaused) await this.waitForResume();
            if (!this.isRunning) return;
            
            this.data.textIndex = i;
            
            if (patternHash === textHash) {
                let match = true;
                for (let j = 0; j < m; j++) {
                    if (!this.isRunning) return;
                    
                    this.data.patternIndex = j;
                    this.compareIndices = [i + j];
                    this.stats.comparisons++;
                    this.draw();
                    await this.sleep(150);
                    
                    if (text[i + j] !== pattern[j]) {
                        match = false;
                        break;
                    }
                }
                
                if (match) {
                    this.foundIndex = i;
                    this.draw();
                    await this.sleep(500);
                    return;
                }
            }
            
            if (i < n - m) {
                textHash = (d * (textHash - text[i].charCodeAt(0) * h) + text[i + m].charCodeAt(0)) % prime;
                if (textHash < 0) textHash += prime;
            }
            
            this.stats.operations++;
            this.draw();
            await this.sleep(100);
        }
    }

    async zAlgorithmSearch() {
        const text = this.data.text.join('');
        const pattern = this.data.pattern.join('');
        const combined = pattern + '$' + text;
        const n = combined.length;
        const m = pattern.length;
        const z = Array(n).fill(0);
        
        let l = 0, r = 0;
        
        for (let i = 1; i < n && this.isRunning; i++) {
            if (this.isPaused) await this.waitForResume();
            if (!this.isRunning) return;
            
            if (i > r) {
                l = r = i;
                while (r < n && combined[r - l] === combined[r]) {
                    if (!this.isRunning) return;
                    r++;
                    this.stats.comparisons++;
                }
                z[i] = r - l;
                if (z[i] === m) {
                    this.foundIndex = i - m - 1;
                    this.draw();
                    await this.sleep(500);
                    return;
                }
            } else {
                const k = i - l;
                if (z[k] < r - i + 1) {
                    z[i] = z[k];
                } else {
                    l = i;
                    while (r < n && combined[r - l] === combined[r]) {
                        if (!this.isRunning) return;
                        r++;
                        this.stats.comparisons++;
                    }
                    z[i] = r - l;
                    if (z[i] === m) {
                        this.foundIndex = i - m - 1;
                        this.draw();
                        await this.sleep(500);
                        return;
                    }
                }
            }
            
            this.stats.operations++;
            this.draw();
            await this.sleep(100);
        }
    }

    async manacherSearch() {
        const text = this.data.text.join('');
        const transformed = '#' + text.split('').join('#') + '#';
        const n = transformed.length;
        const p = Array(n).fill(0);
        
        let center = 0, right = 0;
        
        for (let i = 0; i < n && this.isRunning; i++) {
            if (this.isPaused) await this.waitForResume();
            if (!this.isRunning) return;
            
            const mirror = 2 * center - i;
            
            if (i < right) {
                p[i] = Math.min(right - i, p[mirror]);
            }
            
            let a = i + p[i] + 1, b = i - p[i] - 1;
            while (a < n && b >= 0 && transformed[a] === transformed[b]) {
                if (!this.isRunning) return;
                p[i]++;
                a++;
                b--;
                this.stats.comparisons++;
            }
            
            if (i + p[i] > right) {
                center = i;
                right = i + p[i];
            }
            
            this.stats.operations++;
            this.draw();
            await this.sleep(100);
        }
        
        // Find the longest palindrome
        let maxLen = 0, centerIndex = 0;
        for (let i = 0; i < n; i++) {
            if (p[i] > maxLen) {
                maxLen = p[i];
                centerIndex = i;
            }
        }
        
        this.foundIndex = Math.floor((centerIndex - maxLen) / 2);
        this.draw();
        await this.sleep(500);
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
                } else if (this.lcsData) {
                    this.drawLCS();
                } else if (this.knapsackData) {
                    this.drawKnapsack();
                } else if (this.coinData) {
                    this.drawCoinChange();
                } else if (this.editData) {
                    this.drawEditDistance();
                } else if (this.matrixData) {
                    this.drawMatrixChain();
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
        if (!this.data || !Array.isArray(this.data)) return;
        
        const barWidth = (this.canvas.width - 40) / this.data.length;
        const maxHeight = this.canvas.height - 60;
        const showLabels = this.data.length <= 20;
    
        this.data.forEach((value, index) => {
            const height = (value / 320) * maxHeight;
            const x = 20 + index * barWidth;
            const y = this.canvas.height - 30 - height;
    
            if (this.foundIndex === index) {
                this.ctx.fillStyle = '#4caf50';
            } else if (this.highlightIndices && this.highlightIndices.includes(index)) {
                this.ctx.fillStyle = '#ff5722';
            } else if (this.compareIndices && this.compareIndices.includes(index)) {
                this.ctx.fillStyle = '#ff9800';
            } else {
                this.ctx.fillStyle = '#667eea';
            }
    
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
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
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
                this.ctx.strokeStyle = '#999999';
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
            this.ctx.fillStyle = '#000000';
            this.ctx.font = 'bold 11px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(edge.weight.toString(), midX, midY);
        });
        
        // Draw nodes on top - mark start (node 0) and end (last node)
        this.graph.nodes.forEach(node => {
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, 24, 0, 2 * Math.PI);
            
            let fillColor = '#667eea'; // Default blue
            
            // Start node (green)
            if (node.id === 0) {
                fillColor = '#4caf50';
            }
            // End node (red) - last node
            else if (node.id === this.graph.nodes.length - 1) {
                fillColor = '#f44336';
            }
            // Currently being processed (orange)
            else if (this.currentNode === node.id) {
                fillColor = '#ff5722';
            }
            // Visited nodes (green)
            else if (node.visited) {
                fillColor = '#4caf50';
            }
            
            this.ctx.fillStyle = fillColor;
            this.ctx.fill();
            this.ctx.strokeStyle = '#333333';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            // Node ID with black text for better contrast
            this.ctx.fillStyle = '#000000';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(node.id.toString(), node.x, node.y);
            
            // Mark Start and End nodes
            if (node.id === 0) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 10px Arial';
                this.ctx.fillText('S', node.x - 8, node.y - 8);
            } else if (node.id === this.graph.nodes.length - 1) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 10px Arial';
                this.ctx.fillText('E', node.x - 8, node.y - 8);
            }
        });
    }

    drawTree() {
        if (!this.tree || !this.tree.nodes || !this.tree.edges) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
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
            this.ctx.strokeStyle = '#333333';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            // Node value with black text for better contrast
            this.ctx.fillStyle = '#000000';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(node.value.toString(), node.x, node.y);
        });
    }

    drawFibonacci() {
        const boxWidth = 70;
        const boxHeight = 50;
        const startX = 30;
        const startY = this.canvas.height / 2 - boxHeight / 2;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.fibSequence.forEach((value, index) => {
            const x = startX + index * (boxWidth + 15);
            const y = startY;
            
            // Box with solid color
            this.ctx.fillStyle = this.highlightIndices && this.highlightIndices.includes(index) 
                ? '#ff5722' 
                : '#667eea';
            
            this.ctx.fillRect(x, y, boxWidth, boxHeight);
            
            // Border
            this.ctx.strokeStyle = '#333333';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, boxWidth, boxHeight);
            
            // Value text with black color for better contrast
            this.ctx.fillStyle = '#000000';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(value.toString(), x + boxWidth / 2, y + boxHeight / 2);
            
            // Index label
            this.ctx.fillStyle = '#424242';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(`F(${index})`, x + boxWidth / 2, y + boxHeight + 25);
        });
    }

    drawLCS() {
        if (!this.lcsData) return;
        const { s1, s2, dp, currentI, currentJ } = this.lcsData;
        const cellSize = 35;
        const offsetX = 60;
        const offsetY = 60;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw headers
        this.ctx.fillStyle = '#1976d2';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('LCS DP Table', this.canvas.width / 2, 25);
        
        // Draw s2 (columns)
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '12px Arial';
        for (let j = 0; j <= s2.length; j++) {
            const x = offsetX + j * cellSize;
            this.ctx.fillText(j === 0 ? '' : s2[j - 1], x + cellSize / 2, offsetY - 10);
        }
        
        // Draw s1 (rows) and DP table
        for (let i = 0; i <= s1.length; i++) {
            // Row header
            if (i > 0) {
                this.ctx.fillStyle = '#000000';
                this.ctx.font = '12px Arial';
                this.ctx.fillText(s1[i - 1], offsetX - 20, offsetY + i * cellSize + cellSize / 2);
            }
            
            for (let j = 0; j <= s2.length; j++) {
                const x = offsetX + j * cellSize;
                const y = offsetY + i * cellSize;
                
                // Cell background
                if (i === currentI && j === currentJ) {
                    this.ctx.fillStyle = '#ff5722'; // Current cell
                } else if (i === currentI - 1 || j === currentJ - 1) {
                    this.ctx.fillStyle = '#ffe0b2'; // Referenced cells
                } else {
                    this.ctx.fillStyle = i === 0 || j === 0 ? '#e3f2fd' : '#ffffff';
                }
                
                this.ctx.fillRect(x, y, cellSize, cellSize);
                this.ctx.strokeStyle = '#bdbdbd';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, cellSize, cellSize);
                
                // Cell value
                this.ctx.fillStyle = '#000000';
                this.ctx.font = 'bold 12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(dp[i][j].toString(), x + cellSize / 2, y + cellSize / 2);
            }
        }
        
        // Legend
        this.ctx.fillStyle = '#ff5722';
        this.ctx.fillRect(offsetX, offsetY + (s1.length + 1) * cellSize + 15, 20, 20);
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '11px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('= Current', offsetX + 25, offsetY + (s1.length + 1) * cellSize + 30);
    }

    drawKnapsack() {
        if (!this.knapsackData) return;
        const { weights, values, capacity, dp, currentI, currentW } = this.knapsackData;
        const cellSize = 30;
        const offsetX = 80;
        const offsetY = 70;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Title
        this.ctx.fillStyle = '#1976d2';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('0/1 Knapsack DP Table', this.canvas.width / 2, 25);
        
        // Draw capacity (columns)
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '10px Arial';
        for (let w = 0; w <= capacity; w++) {
            const x = offsetX + w * cellSize;
            this.ctx.fillText(w.toString(), x + cellSize / 2, offsetY - 10);
        }
        
        // Draw items (rows) and DP table
        for (let i = 0; i <= weights.length; i++) {
            // Row header
            if (i > 0) {
                this.ctx.fillStyle = '#000000';
                this.ctx.font = '10px Arial';
                this.ctx.fillText(`Item${i}\n(w:${weights[i-1]},v:${values[i-1]})`, offsetX - 70, offsetY + i * cellSize + cellSize / 2);
            }
            
            for (let w = 0; w <= capacity; w++) {
                const x = offsetX + w * cellSize;
                const y = offsetY + i * cellSize;
                
                // Cell background
                if (i === currentI && w === currentW) {
                    this.ctx.fillStyle = '#ff5722';
                } else {
                    this.ctx.fillStyle = i === 0 ? '#e3f2fd' : '#ffffff';
                }
                
                this.ctx.fillRect(x, y, cellSize, cellSize);
                this.ctx.strokeStyle = '#bdbdbd';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, cellSize, cellSize);
                
                // Cell value
                this.ctx.fillStyle = '#000000';
                this.ctx.font = 'bold 10px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(dp[i][w].toString(), x + cellSize / 2, y + cellSize / 2);
            }
        }
    }

    drawCoinChange() {
        if (!this.coinData) return;
        const { coins, amount, dp, currentCoin, currentAmt } = this.coinData;
        const cellSize = 35;
        const offsetX = 60;
        const offsetY = 70;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Title
        this.ctx.fillStyle = '#1976d2';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Coin Change DP', this.canvas.width / 2, 25);
        
        // Draw amounts (columns)
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '10px Arial';
        for (let a = 0; a <= amount; a++) {
            const x = offsetX + a * cellSize;
            this.ctx.fillText(a.toString(), x + cellSize / 2, offsetY - 10);
        }
        
        // Draw coins (rows) and DP array
        coins.forEach((coin, idx) => {
            const rowY = offsetY + idx * cellSize;
            
            // Row header
            this.ctx.fillStyle = '#000000';
            this.ctx.font = '11px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`Coin ${coin}`, offsetX - 10, rowY + cellSize / 2);
            
            // DP cells for this coin
            for (let a = 0; a <= amount; a++) {
                const x = offsetX + a * cellSize;
                
                // Cell background
                if (currentCoin === coin && currentAmt === a) {
                    this.ctx.fillStyle = '#ff5722';
                } else {
                    this.ctx.fillStyle = '#ffffff';
                }
                
                this.ctx.fillRect(x, rowY, cellSize, cellSize);
                this.ctx.strokeStyle = '#bdbdbd';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, rowY, cellSize, cellSize);
                
                // Cell value
                this.ctx.fillStyle = '#000000';
                this.ctx.font = 'bold 11px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                if (dp[a] !== Infinity) {
                    this.ctx.fillText(dp[a].toString(), x + cellSize / 2, rowY + cellSize / 2);
                } else {
                    this.ctx.fillText('∞', x + cellSize / 2, rowY + cellSize / 2);
                }
            }
        });
        
        // Final result row
        const finalY = offsetY + coins.length * cellSize;
        this.ctx.fillStyle = '#4caf50';
        this.ctx.fillRect(offsetX, finalY, (amount + 1) * cellSize, cellSize);
        this.ctx.strokeStyle = '#2e7d32';
        this.ctx.strokeRect(offsetX, finalY, (amount + 1) * cellSize, cellSize);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        const result = dp[amount] !== Infinity ? dp[amount].toString() : 'Impossible';
        this.ctx.fillText(`Result: ${result}`, offsetX + amount * cellSize / 2, finalY + cellSize / 2);
    }

    drawEditDistance() {
        if (!this.editData) return;
        const { s1, s2, dp, currentI, currentJ } = this.editData;
        const cellSize = 32;
        const offsetX = 70;
        const offsetY = 60;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Title
        this.ctx.fillStyle = '#1976d2';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Edit Distance (Levenshtein)', this.canvas.width / 2, 25);
        
        // Draw s2 (columns)
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '11px Arial';
        for (let j = 0; j <= s2.length; j++) {
            const x = offsetX + j * cellSize;
            this.ctx.fillText(j === 0 ? '' : s2[j - 1], x + cellSize / 2, offsetY - 10);
        }
        
        // Draw s1 (rows) and DP table
        for (let i = 0; i <= s1.length; i++) {
            // Row header
            if (i > 0) {
                this.ctx.fillStyle = '#000000';
                this.ctx.font = '11px Arial';
                this.ctx.textAlign = 'right';
                this.ctx.fillText(s1[i - 1], offsetX - 15, offsetY + i * cellSize + cellSize / 2);
            }
            
            for (let j = 0; j <= s2.length; j++) {
                const x = offsetX + j * cellSize;
                const y = offsetY + i * cellSize;
                
                // Cell background
                if (i === currentI && j === currentJ) {
                    this.ctx.fillStyle = '#ff5722';
                } else {
                    this.ctx.fillStyle = i === 0 || j === 0 ? '#e3f2fd' : '#ffffff';
                }
                
                this.ctx.fillRect(x, y, cellSize, cellSize);
                this.ctx.strokeStyle = '#bdbdbd';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, cellSize, cellSize);
                
                // Cell value
                this.ctx.fillStyle = '#000000';
                this.ctx.font = 'bold 11px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(dp[i][j].toString(), x + cellSize / 2, y + cellSize / 2);
            }
        }
        
        // Result
        const finalDist = dp[s1.length][s2.length];
        this.ctx.fillStyle = '#4caf50';
        this.ctx.fillRect(offsetX, offsetY + (s1.length + 1) * cellSize + 15, 150, 30);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 13px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`Distance: ${finalDist}`, offsetX + 75, offsetY + (s1.length + 1) * cellSize + 30);
    }

    drawMatrixChain() {
        if (!this.matrixData) return;
        const { dims, dp, currentLen, currentI, currentJ } = this.matrixData;
        const n = dims.length - 1;
        const cellSize = 40;
        const offsetX = 50;
        const offsetY = 50;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Title
        this.ctx.fillStyle = '#1976d2';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Matrix Chain Multiplication', this.canvas.width / 2, 25);
        
        // Draw dimensions info
        this.ctx.fillStyle = '#424242';
        this.ctx.font = '11px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Dimensions: [${dims.join('x')}]`, offsetX, offsetY - 20);
        
        // Draw upper triangular DP table
        for (let i = 1; i <= n; i++) {
            for (let j = i; j <= n; j++) {
                const x = offsetX + (j - 1) * cellSize;
                const y = offsetY + (i - 1) * cellSize;
                
                // Cell background
                if (i === currentI && j === currentJ) {
                    this.ctx.fillStyle = '#ff5722';
                } else if (j - i + 1 === currentLen) {
                    this.ctx.fillStyle = '#ffe0b2';
                } else {
                    this.ctx.fillStyle = '#ffffff';
                }
                
                this.ctx.fillRect(x, y, cellSize, cellSize);
                this.ctx.strokeStyle = '#bdbdbd';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, cellSize, cellSize);
                
                // Cell value
                this.ctx.fillStyle = '#000000';
                this.ctx.font = 'bold 10px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                if (dp[i][j] !== 0 && dp[i][j] !== Infinity) {
                    this.ctx.fillText(dp[i][j].toString(), x + cellSize / 2, y + cellSize / 2);
                }
            }
        }
        
        // Result
        const minCost = dp[1][n];
        this.ctx.fillStyle = '#4caf50';
        this.ctx.fillRect(offsetX, offsetY + n * cellSize + 20, 200, 35);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 13px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`Min Cost: ${minCost}`, offsetX + 100, offsetY + n * cellSize + 37);
    }

    drawString() {
        if (!this.data || !Array.isArray(this.data)) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
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
        if (this.data.text && Array.isArray(this.data.text)) {
            this.data.text.forEach((char, index) => {
            const x = startX + 70 + index * charWidth;
            
            // Box background
            this.ctx.fillStyle = this.data.textIndex === index ? '#ff5722' : '#667eea';
            this.ctx.fillRect(x, textY - 20, charWidth, charHeight);
            
            // Border
            this.ctx.strokeStyle = '#333333';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, textY - 20, charWidth, charHeight);
            
            // Character text with black color for better contrast
            this.ctx.fillStyle = '#000000';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(char, x + charWidth / 2, textY - 2);
            
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
            this.ctx.strokeStyle = '#333333';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, patternY - 20, charWidth, charHeight);
            
            // Character text with black color for better contrast
            this.ctx.fillStyle = '#000000';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(char, x + charWidth / 2, patternY - 2);
            
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

// Warning modal close function
function closeWarning() {
    document.getElementById('warning-modal').classList.remove('active');
}

// Show warning for incomplete algorithms - All algorithms are now fully implemented
function showWarningForIncomplete(algoId) {
    // No incomplete algorithms - all are fully implemented
    return false;
}
