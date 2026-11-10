// Graph and tree problems. Format of each entry: see scripts/seedProblems.js.
// solve(input) must be self-contained (its source becomes the stored reference solution).
// Solutions avoid deep recursion because trees and graphs here can be 10^4 levels deep.

// Generator helpers (not part of any stored solution).

// Simple graph (no self-loops or repeated edges) as "n m" plus edge lines.
// connected: starts from a random spanning tree. weight: max edge weight, 0 for unweighted.
function randomGraph(r, n, m, { directed = false, connected = false, weight = 0 } = {}) {
    const label = r.shuffle(Array.from({ length: n }, (_, i) => i + 1));
    const seen = new Set();
    const edges = [];
    const add = (u, v) => {
        if (u === v) return;
        const key = directed ? `${u} ${v}` : `${Math.min(u, v)} ${Math.max(u, v)}`;
        if (seen.has(key)) return;
        seen.add(key);
        edges.push(weight ? `${u} ${v} ${r.int(1, weight)}` : `${u} ${v}`);
    };
    if (connected) for (let i = 1; i < n; i++) add(label[r.int(0, i - 1)], label[i]);
    for (let tries = 0; edges.length < m && tries < m * 20; tries++) add(r.int(1, n), r.int(1, n));
    return `${n} ${edges.length}\n${r.shuffle(edges).join("\n")}`;
}

// Random tree on labels 1..n; returns [parent, child] pairs. deep: a long chain.
function randomTree(r, n, deep) {
    const label = [1, ...r.shuffle(Array.from({ length: n - 1 }, (_, i) => i + 2))];
    const pairs = [];
    for (let i = 1; i < n; i++) pairs.push([label[deep && r.chance(0.95) ? i - 1 : r.int(0, i - 1)], label[i]]);
    return pairs;
}

// Binary tree on labels 1..n with root 1; returns left/right child arrays (0 = none).
function binaryTree(r, n, deep) {
    const label = [1, ...r.shuffle(Array.from({ length: n - 1 }, (_, i) => i + 2))];
    const left = new Array(n + 1).fill(0);
    const right = new Array(n + 1).fill(0);
    const open = [1];
    for (let i = 1; i < n; i++) {
        const idx = deep ? open.length - 1 : r.int(0, open.length - 1);
        const parent = open[idx];
        if (!left[parent] && (right[parent] || r.chance(0.5))) left[parent] = label[i];
        else right[parent] = label[i];
        if (left[parent] && right[parent]) open.splice(idx, 1);
        open.push(label[i]);
    }
    return { left, right };
}

const childLines = ({ left, right }, n) => Array.from({ length: n }, (_, i) => `${left[i + 1]} ${right[i + 1]}`).join("\n");

const BINARY_TREE_FORMAT = `The first line contains n, the number of nodes. The nodes are labelled 1 to n and node 1 is the root.
Each of the next n lines describes one node, in order from node 1 to node n, with two integers: its left child and its right child (0 means no child).`;

const grid = (r, rows, cols, pick) => Array.from({ length: rows }, () => Array.from({ length: cols }, pick).join(""));

module.exports = [
    {
        title: "Count Connected Components",
        difficulty: "easy",
        tags: ["graphs"],
        description: `
Given an undirected graph with n vertices and m edges, count its connected components.

Input
The first line contains n and m. Each of the next m lines contains two integers u and v: an edge between u and v.

Output
Print the number of connected components.`,
        constraints: ["1 <= n <= 10^4", "0 <= m <= 10^4", "1 <= u, v <= n, u != v", "There are no repeated edges"],
        examples: [
            { input: "5 3\n1 2\n2 3\n4 5", explanation: "The components are {1, 2, 3} and {4, 5}." },
            { input: "3 0", explanation: "Three isolated vertices." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const [n, m] = t;
            const parent = Array.from({ length: n + 1 }, (_, i) => i);
            const find = (x) => {
                while (parent[x] !== x) x = parent[x] = parent[parent[x]];
                return x;
            };
            let components = n;
            for (let i = 0; i < m; i++) {
                const a = find(t[2 + 2 * i]);
                const b = find(t[3 + 2 * i]);
                if (a !== b) {
                    parent[a] = b;
                    components--;
                }
            }
            return components;
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 10);
            return randomGraph(r, n, big ? r.int(5000, 10000) : r.int(0, n));
        },
    },
    {
        title: "Flood Fill",
        difficulty: "easy",
        tags: ["graphs", "recursion"],
        description: `
An image is an r x c grid of pixels, each a color from 0 to 9. Starting from pixel (sr, sc), recolor it and every pixel connected to it (up, down, left or right) through pixels of the same original color to the new color.

Input
The first line contains r and c. Each of the next r lines contains c digits.
The last line contains sr, sc (0-based row and column) and the new color.

Output
Print the resulting grid: r lines of c digits.`,
        constraints: ["1 <= r, c <= 300", "0 <= sr < r, 0 <= sc < c", "0 <= color <= 9"],
        examples: [
            { input: "3 3\n111\n110\n101\n1 1 2", explanation: "All 1s connected to the center become 2. The 1 in the bottom-right corner is not connected." },
            { input: "2 3\n000\n000\n0 0 0", explanation: "The new color equals the old one, so nothing changes." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/);
            const [R, C] = [Number(t[0]), Number(t[1])];
            const g = t.slice(2, 2 + R).map((row) => row.split(""));
            const [sr, sc, color] = t.slice(2 + R).map(Number);
            const old = g[sr][sc];
            const target = String(color);
            if (old !== target) {
                const stack = [[sr, sc]];
                g[sr][sc] = target;
                while (stack.length) {
                    const [i, j] = stack.pop();
                    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                        const x = i + di;
                        const y = j + dj;
                        if (x >= 0 && y >= 0 && x < R && y < C && g[x][y] === old) {
                            g[x][y] = target;
                            stack.push([x, y]);
                        }
                    }
                }
            }
            return g.map((row) => row.join("")).join("\n");
        },
        generate: (r, big) => {
            const rows = big ? 300 : r.int(1, 6);
            const cols = big ? 300 : r.int(1, 6);
            const colors = r.pick(["01", "012", "0123456789"]);
            return `${rows} ${cols}\n${grid(r, rows, cols, () => r.pick(colors)).join("\n")}\n${r.int(0, rows - 1)} ${r.int(0, cols - 1)} ${r.int(0, 3)}`;
        },
    },
    {
        title: "Shortest Path in an Unweighted Graph",
        difficulty: "easy",
        tags: ["graphs", "queue"],
        description: `
Given an undirected graph with n vertices and m edges, find the minimum number of edges on a path from vertex 1 to vertex n. Breadth-first search finds it.

Input
The first line contains n and m. Each of the next m lines contains two integers u and v: an edge between u and v.

Output
Print the length of the shortest path from 1 to n, or -1 if n cannot be reached.`,
        constraints: ["1 <= n <= 10^4", "0 <= m <= 10^4", "1 <= u, v <= n, u != v", "There are no repeated edges"],
        examples: [
            { input: "4 4\n1 2\n2 4\n1 3\n3 2", explanation: "1 -> 2 -> 4 uses 2 edges." },
            { input: "3 1\n1 2", explanation: "Vertex 3 has no edges." },
        ],
        edge: ["1 0"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const [n, m] = t;
            const adj = Array.from({ length: n + 1 }, () => []);
            for (let i = 0; i < m; i++) {
                adj[t[2 + 2 * i]].push(t[3 + 2 * i]);
                adj[t[3 + 2 * i]].push(t[2 + 2 * i]);
            }
            const dist = new Array(n + 1).fill(-1);
            dist[1] = 0;
            const queue = [1];
            for (let head = 0; head < queue.length; head++) {
                const v = queue[head];
                for (const to of adj[v]) {
                    if (dist[to] === -1) {
                        dist[to] = dist[v] + 1;
                        queue.push(to);
                    }
                }
            }
            return dist[n];
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(2, 10);
            return randomGraph(r, n, big ? r.int(n - 1, 10000) : r.int(0, 2 * n), { connected: r.chance(0.7) });
        },
    },
    {
        title: "Binary Tree Height",
        difficulty: "easy",
        tags: ["trees", "recursion"],
        description: `
Given a binary tree, find its height: the number of nodes on the longest path from the root down to a leaf.

Input
${BINARY_TREE_FORMAT}

Output
Print the height of the tree.`,
        constraints: ["1 <= n <= 10^4", "The input describes a valid binary tree rooted at node 1"],
        examples: [
            { input: "5\n2 3\n0 0\n4 5\n0 0\n0 0", explanation: "The longest path is 1 -> 3 -> 4 (or 1 -> 3 -> 5), which has 3 nodes." },
            { input: "1\n0 0", explanation: "A single node has height 1." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            let level = [1];
            let height = 0;
            while (level.length) {
                height++;
                const next = [];
                for (const v of level) {
                    if (t[2 * v - 1]) next.push(t[2 * v - 1]);
                    if (t[2 * v]) next.push(t[2 * v]);
                }
                level = next;
            }
            return height;
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 10);
            return `${n}\n${childLines(binaryTree(r, n, big && r.chance(0.5)), n)}`;
        },
    },
    {
        title: "Binary Tree Traversals",
        difficulty: "easy",
        tags: ["trees", "recursion"],
        description: `
Given a binary tree, print its preorder (node, left, right), inorder (left, node, right) and postorder (left, right, node) traversals.

The tree can be very deep, so a recursive solution may overflow the call stack in some languages. Consider an explicit stack.

Input
${BINARY_TREE_FORMAT}

Output
Print three lines: the preorder, inorder and postorder traversals, each as node labels separated by spaces.`,
        constraints: ["1 <= n <= 10^4", "The input describes a valid binary tree rooted at node 1"],
        examples: [
            { input: "3\n2 3\n0 0\n0 0", explanation: "Root 1 with left child 2 and right child 3." },
            { input: "3\n0 2\n3 0\n0 0", explanation: "1 has right child 2, and 2 has left child 3." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const left = (v) => t[2 * v - 1];
            const right = (v) => t[2 * v];
            const pre = [];
            const post = [];
            const stack = [1];
            while (stack.length) {
                const v = stack.pop();
                pre.push(v);
                if (right(v)) stack.push(right(v));
                if (left(v)) stack.push(left(v));
            }
            stack.push(1);
            while (stack.length) {
                const v = stack.pop();
                post.push(v);
                if (left(v)) stack.push(left(v));
                if (right(v)) stack.push(right(v));
            }
            post.reverse();
            const ino = [];
            let v = 1;
            while (v || stack.length) {
                while (v) {
                    stack.push(v);
                    v = left(v);
                }
                v = stack.pop();
                ino.push(v);
                v = right(v);
            }
            return [pre, ino, post].map((x) => x.join(" ")).join("\n");
        },
        generate: (r, big) => {
            const n = big ? 5000 : r.int(1, 10);
            return `${n}\n${childLines(binaryTree(r, n, big && r.chance(0.5)), n)}`;
        },
    },
    {
        title: "Subtree Sizes",
        difficulty: "easy",
        tags: ["trees", "graphs"],
        description: `
A tree has n nodes labelled 1 to n and is rooted at node 1. For every node, find the size of its subtree: the number of nodes in it, counting the node itself.

Input
The first line contains n. Each of the next n - 1 lines contains two integers u and v: an edge of the tree.

Output
Print n integers separated by spaces: the subtree sizes of nodes 1, 2, ..., n.`,
        constraints: ["1 <= n <= 10^4", "The edges form a tree"],
        examples: [
            { input: "5\n1 2\n1 3\n3 4\n3 5", explanation: "Node 3's subtree is {3, 4, 5}; node 1's subtree is the whole tree." },
            { input: "1", explanation: "A single node." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const n = t[0];
            const adj = Array.from({ length: n + 1 }, () => []);
            for (let i = 0; i < n - 1; i++) {
                adj[t[1 + 2 * i]].push(t[2 + 2 * i]);
                adj[t[2 + 2 * i]].push(t[1 + 2 * i]);
            }
            const parent = new Array(n + 1).fill(0);
            const order = [1];
            parent[1] = -1;
            for (let head = 0; head < order.length; head++) {
                for (const to of adj[order[head]]) {
                    if (!parent[to]) {
                        parent[to] = order[head];
                        order.push(to);
                    }
                }
            }
            const size = new Array(n + 1).fill(1);
            for (let i = n - 1; i > 0; i--) size[parent[order[i]]] += size[order[i]];
            return size.slice(1).join(" ");
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 10);
            const edges = randomTree(r, n, big && r.chance(0.5)).map(([a, b]) => (r.chance(0.5) ? `${a} ${b}` : `${b} ${a}`));
            return `${n}${edges.length ? "\n" : ""}${r.shuffle(edges).join("\n")}`;
        },
    },
    {
        title: "Number of Islands",
        difficulty: "medium",
        tags: ["graphs"],
        description: `
Given an r x c grid of '1' (land) and '0' (water), count the islands. An island is a group of land cells connected horizontally or vertically.

Input
The first line contains r and c. Each of the next r lines contains c characters, each '0' or '1'.

Output
Print the number of islands.`,
        constraints: ["1 <= r, c <= 300"],
        examples: [
            { input: "4 5\n11110\n11010\n11000\n00000", explanation: "All the land is connected into one island." },
            { input: "4 5\n11000\n11000\n00100\n00011", explanation: "Three separate islands." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/);
            const [R, C] = [Number(t[0]), Number(t[1])];
            const seen = new Uint8Array(R * C);
            const land = (i, j) => t[2 + i][j] === "1";
            let islands = 0;
            for (let i = 0; i < R; i++) {
                for (let j = 0; j < C; j++) {
                    if (!land(i, j) || seen[i * C + j]) continue;
                    islands++;
                    seen[i * C + j] = 1;
                    const stack = [[i, j]];
                    while (stack.length) {
                        const [x, y] = stack.pop();
                        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                            const a = x + dx;
                            const b = y + dy;
                            if (a >= 0 && b >= 0 && a < R && b < C && land(a, b) && !seen[a * C + b]) {
                                seen[a * C + b] = 1;
                                stack.push([a, b]);
                            }
                        }
                    }
                }
            }
            return islands;
        },
        generate: (r, big) => {
            const rows = big ? 300 : r.int(1, 7);
            const cols = big ? 300 : r.int(1, 7);
            const p = r.pick([0.3, 0.5, 0.65]);
            return `${rows} ${cols}\n${grid(r, rows, cols, () => (r.chance(p) ? "1" : "0")).join("\n")}`;
        },
    },
    {
        title: "Cheapest Flights Within K Stops",
        difficulty: "hard",
        tags: ["graphs", "dynamic programming"],
        description: `
There are n cities and m one-way flights; flight i goes from u to v and costs w. Find the cheapest way to travel from city src to city dst using at most k stops (a route with at most k + 1 flights). Print -1 if there is no such route.

Note that the overall cheapest route may use too many stops, so a plain shortest-path algorithm is not enough.

Input
The first line contains n and m. Each of the next m lines contains u, v and w.
The last line contains src, dst and k.

Output
Print the minimum cost, or -1.`,
        constraints: ["2 <= n <= 100", "0 <= m <= 5000", "1 <= w <= 10^4", "1 <= src, dst <= n, src != dst", "0 <= k < n", "There are no repeated flights or self-loops"],
        examples: [
            { input: "4 5\n1 2 100\n2 3 100\n2 4 600\n3 4 200\n1 3 500\n1 4 1", explanation: "1 -> 2 -> 4 and 1 -> 3 -> 4 both cost 700 with one stop. 1 -> 2 -> 3 -> 4 costs only 400 but needs two stops." },
            { input: "3 3\n1 2 100\n2 3 100\n1 3 500\n1 3 0", explanation: "With no stops allowed, only the direct flight for 500 works." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const [n, m] = t;
            const [src, dst, k] = t.slice(2 + 3 * m);
            let cost = new Array(n + 1).fill(Infinity);
            cost[src] = 0;
            for (let round = 0; round <= k; round++) {
                const next = cost.slice();
                for (let i = 0; i < m; i++) {
                    const [u, v, w] = [t[2 + 3 * i], t[3 + 3 * i], t[4 + 3 * i]];
                    if (cost[u] + w < next[v]) next[v] = cost[u] + w;
                }
                cost = next;
            }
            return cost[dst] === Infinity ? -1 : cost[dst];
        },
        generate: (r, big) => {
            const n = big ? 100 : r.int(2, 7);
            const graph = randomGraph(r, n, big ? 5000 : r.int(0, n * 2), { directed: true, weight: big ? 10000 : 20 });
            const src = r.int(1, n);
            let dst = r.int(1, n - 1);
            if (dst >= src) dst++;
            return `${graph}\n${src} ${dst} ${r.int(0, Math.min(n - 1, big ? 10 : 3))}`;
        },
    },
    {
        title: "Dijkstra Shortest Paths",
        difficulty: "medium",
        tags: ["graphs", "heaps"],
        description: `
Given an undirected weighted graph with n vertices and m edges, find the shortest distance from vertex 1 to every vertex.

Use Dijkstra's algorithm with a priority queue (min-heap).

Input
The first line contains n and m. Each of the next m lines contains u, v and w: an edge between u and v with weight w.

Output
Print n integers separated by spaces: the distance from 1 to each vertex 1..n, or -1 for unreachable vertices. Distances may not fit in a 32-bit integer.`,
        constraints: ["1 <= n <= 5000", "0 <= m <= 10^4", "1 <= w <= 10^6", "There are no repeated edges or self-loops"],
        examples: [
            { input: "4 4\n1 2 4\n1 3 1\n3 2 2\n2 4 5", explanation: "1 -> 3 -> 2 costs 3, which beats the direct edge of 4. Then 2 -> 4 adds 5." },
            { input: "3 1\n1 2 7", explanation: "Vertex 3 is unreachable." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const [n, m] = t;
            const adj = Array.from({ length: n + 1 }, () => []);
            for (let i = 0; i < m; i++) {
                const [u, v, w] = [t[2 + 3 * i], t[3 + 3 * i], t[4 + 3 * i]];
                adj[u].push([v, w]);
                adj[v].push([u, w]);
            }
            const heap = [];
            const push = (item) => {
                heap.push(item);
                for (let i = heap.length - 1; i > 0; ) {
                    const p = (i - 1) >> 1;
                    if (heap[p][0] <= heap[i][0]) break;
                    [heap[p], heap[i]] = [heap[i], heap[p]];
                    i = p;
                }
            };
            const pop = () => {
                const top = heap[0];
                const last = heap.pop();
                if (heap.length) {
                    heap[0] = last;
                    for (let i = 0; ; ) {
                        const l = 2 * i + 1;
                        const r = l + 1;
                        let s = i;
                        if (l < heap.length && heap[l][0] < heap[s][0]) s = l;
                        if (r < heap.length && heap[r][0] < heap[s][0]) s = r;
                        if (s === i) break;
                        [heap[s], heap[i]] = [heap[i], heap[s]];
                        i = s;
                    }
                }
                return top;
            };
            const dist = new Array(n + 1).fill(Infinity);
            dist[1] = 0;
            push([0, 1]);
            while (heap.length) {
                const [d, v] = pop();
                if (d > dist[v]) continue;
                for (const [to, w] of adj[v]) {
                    if (d + w < dist[to]) {
                        dist[to] = d + w;
                        push([dist[to], to]);
                    }
                }
            }
            return dist.slice(1).map((d) => (d === Infinity ? -1 : d)).join(" ");
        },
        generate: (r, big) => {
            const n = big ? 5000 : r.int(1, 8);
            return randomGraph(r, n, big ? 10000 : r.int(0, 2 * n), { connected: r.chance(0.7), weight: big ? 1e6 : 20 });
        },
    },
    {
        title: "Count Bridges",
        difficulty: "hard",
        tags: ["graphs"],
        description: `
A bridge is an edge whose removal increases the number of connected components of the graph. Given an undirected graph, count its bridges.

Checking every edge separately is too slow; Tarjan's low-link algorithm finds all bridges in one DFS.

Input
The first line contains n and m. Each of the next m lines contains two integers u and v: an edge between u and v.

Output
Print the number of bridges.`,
        constraints: ["1 <= n <= 10^4", "0 <= m <= 10^4", "1 <= u, v <= n, u != v", "There are no repeated edges"],
        examples: [
            { input: "4 4\n1 2\n2 3\n3 1\n3 4", explanation: "Only 3-4 is a bridge; the other three edges form a cycle." },
            { input: "3 2\n1 2\n2 3", explanation: "In a path every edge is a bridge." },
        ],
        edge: ["1 0"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const [n, m] = t;
            const adj = Array.from({ length: n + 1 }, () => []);
            for (let i = 0; i < m; i++) {
                adj[t[2 + 2 * i]].push([t[3 + 2 * i], i]);
                adj[t[3 + 2 * i]].push([t[2 + 2 * i], i]);
            }
            const tin = new Int32Array(n + 1);
            const low = new Int32Array(n + 1);
            let timer = 0;
            let bridges = 0;
            for (let s = 1; s <= n; s++) {
                if (tin[s]) continue;
                tin[s] = low[s] = ++timer;
                const stack = [[s, -1, 0]]; // vertex, edge used to enter it, next neighbour index
                while (stack.length) {
                    const top = stack[stack.length - 1];
                    const v = top[0];
                    if (top[2] < adj[v].length) {
                        const [to, id] = adj[v][top[2]++];
                        if (id === top[1]) continue;
                        if (tin[to]) low[v] = Math.min(low[v], tin[to]);
                        else {
                            tin[to] = low[to] = ++timer;
                            stack.push([to, id, 0]);
                        }
                    } else {
                        stack.pop();
                        if (stack.length) {
                            const p = stack[stack.length - 1][0];
                            low[p] = Math.min(low[p], low[v]);
                            if (low[v] > tin[p]) bridges++;
                        }
                    }
                }
            }
            return bridges;
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 9);
            return randomGraph(r, n, big ? r.int(n - 1, 10000) : r.int(0, n + 2), { connected: r.chance(0.7) });
        },
    },
    {
        title: "Lexicographically Smallest Topological Order",
        difficulty: "medium",
        tags: ["graphs", "heaps"],
        description: `
Given a directed graph with n vertices and m edges, print a topological order: an ordering of all vertices where every edge u -> v has u before v. If several orders exist, print the lexicographically smallest one. If the graph has a cycle, no order exists; print -1.

Kahn's algorithm with a min-heap instead of a plain queue gives the smallest order.

Input
The first line contains n and m. Each of the next m lines contains two integers u and v: an edge u -> v.

Output
Print the order as n vertices separated by spaces, or -1.`,
        constraints: ["1 <= n <= 10^4", "0 <= m <= 10^4", "There are no repeated edges or self-loops"],
        examples: [
            { input: "4 3\n2 1\n3 1\n4 3", explanation: "1 must come after 2 and 3, and 3 after 4. The smallest valid order is 2 4 3 1." },
            { input: "3 3\n1 2\n2 3\n3 1", explanation: "1 -> 2 -> 3 -> 1 is a cycle." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const [n, m] = t;
            const adj = Array.from({ length: n + 1 }, () => []);
            const indeg = new Array(n + 1).fill(0);
            for (let i = 0; i < m; i++) {
                adj[t[2 + 2 * i]].push(t[3 + 2 * i]);
                indeg[t[3 + 2 * i]]++;
            }
            const heap = [];
            const push = (x) => {
                heap.push(x);
                for (let i = heap.length - 1; i > 0; ) {
                    const p = (i - 1) >> 1;
                    if (heap[p] <= heap[i]) break;
                    [heap[p], heap[i]] = [heap[i], heap[p]];
                    i = p;
                }
            };
            const pop = () => {
                const top = heap[0];
                const last = heap.pop();
                if (heap.length) {
                    heap[0] = last;
                    for (let i = 0; ; ) {
                        const l = 2 * i + 1;
                        const r = l + 1;
                        let s = i;
                        if (l < heap.length && heap[l] < heap[s]) s = l;
                        if (r < heap.length && heap[r] < heap[s]) s = r;
                        if (s === i) break;
                        [heap[s], heap[i]] = [heap[i], heap[s]];
                        i = s;
                    }
                }
                return top;
            };
            for (let v = 1; v <= n; v++) if (!indeg[v]) push(v);
            const order = [];
            while (heap.length) {
                const v = pop();
                order.push(v);
                for (const to of adj[v]) if (--indeg[to] === 0) push(to);
            }
            return order.length === n ? order.join(" ") : -1;
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 8);
            const rank = r.shuffle(Array.from({ length: n }, (_, i) => i + 1));
            const seen = new Set();
            const edges = [];
            const target = big ? 10000 : r.int(0, 2 * n);
            for (let tries = 0; edges.length < target && tries < target * 20; tries++) {
                let a = r.int(0, n - 1);
                let b = r.int(0, n - 1);
                if (a === b) continue;
                if (a > b) [a, b] = [b, a];
                const key = `${rank[a]} ${rank[b]}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    edges.push(key);
                }
            }
            if (edges.length && r.chance(0.3)) {
                const [u, v] = edges[r.int(0, edges.length - 1)].split(" ");
                if (!seen.has(`${v} ${u}`)) edges.push(`${v} ${u}`); // adds a cycle
            }
            return `${n} ${edges.length}\n${r.shuffle(edges).join("\n")}`;
        },
    },
    {
        title: "Is Graph Bipartite",
        difficulty: "medium",
        tags: ["graphs", "queue"],
        description: `
An undirected graph is bipartite if its vertices can be split into two groups so that every edge connects vertices from different groups. Decide whether the given graph is bipartite. The graph may be disconnected.

Input
The first line contains n and m. Each of the next m lines contains two integers u and v: an edge between u and v.

Output
Print YES if the graph is bipartite, otherwise print NO.`,
        constraints: ["1 <= n <= 10^4", "0 <= m <= 10^4", "1 <= u, v <= n, u != v", "There are no repeated edges"],
        examples: [
            { input: "4 4\n1 2\n2 3\n3 4\n4 1", explanation: "Groups {1, 3} and {2, 4}." },
            { input: "3 3\n1 2\n2 3\n3 1", explanation: "A triangle is an odd cycle and cannot be split." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const [n, m] = t;
            const adj = Array.from({ length: n + 1 }, () => []);
            for (let i = 0; i < m; i++) {
                adj[t[2 + 2 * i]].push(t[3 + 2 * i]);
                adj[t[3 + 2 * i]].push(t[2 + 2 * i]);
            }
            const color = new Int8Array(n + 1).fill(-1);
            for (let s = 1; s <= n; s++) {
                if (color[s] !== -1) continue;
                color[s] = 0;
                const queue = [s];
                for (let head = 0; head < queue.length; head++) {
                    const v = queue[head];
                    for (const to of adj[v]) {
                        if (color[to] === -1) {
                            color[to] = 1 - color[v];
                            queue.push(to);
                        } else if (color[to] === color[v]) return "NO";
                    }
                }
            }
            return "YES";
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 8);
            const side = Array.from({ length: n + 1 }, () => r.int(0, 1));
            const seen = new Set();
            const edges = [];
            const target = big ? 10000 : r.int(0, 2 * n);
            for (let tries = 0; edges.length < target && tries < target * 20; tries++) {
                const u = r.int(1, n);
                const v = r.int(1, n);
                const key = `${Math.min(u, v)} ${Math.max(u, v)}`;
                if (u === v || side[u] === side[v] || seen.has(key)) continue;
                seen.add(key);
                edges.push(key);
            }
            if (r.chance(0.4)) {
                for (let tries = 0; tries < 50; tries++) {
                    const u = r.int(1, n);
                    const v = r.int(1, n);
                    const key = `${Math.min(u, v)} ${Math.max(u, v)}`;
                    if (u !== v && side[u] === side[v] && !seen.has(key)) {
                        edges.push(key); // may create an odd cycle
                        break;
                    }
                }
            }
            return `${n} ${edges.length}\n${r.shuffle(edges).join("\n")}`;
        },
    },
    {
        title: "Minimum Spanning Tree",
        difficulty: "medium",
        tags: ["graphs", "sorting"],
        description: `
Given a connected undirected weighted graph, find the total weight of its minimum spanning tree: a set of edges connecting all vertices with the smallest possible total weight.

Kruskal's algorithm (sort the edges and join components with a disjoint-set union) or Prim's algorithm both work.

Input
The first line contains n and m. Each of the next m lines contains u, v and w: an edge between u and v with weight w.

Output
Print the total weight of the minimum spanning tree. It may not fit in a 32-bit integer.`,
        constraints: ["1 <= n <= 5000", "n - 1 <= m <= 10^4", "1 <= w <= 10^6", "The graph is connected and has no repeated edges or self-loops"],
        examples: [
            { input: "4 5\n1 2 1\n2 3 2\n3 4 3\n4 1 4\n1 3 5", explanation: "Take the edges with weights 1, 2 and 3." },
            { input: "2 1\n1 2 10", explanation: "The single edge is the whole tree." },
        ],
        edge: ["1 0"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const [n, m] = t;
            const edges = [];
            for (let i = 0; i < m; i++) edges.push([t[4 + 3 * i], t[2 + 3 * i], t[3 + 3 * i]]);
            edges.sort((a, b) => a[0] - b[0]);
            const parent = Array.from({ length: n + 1 }, (_, i) => i);
            const find = (x) => {
                while (parent[x] !== x) x = parent[x] = parent[parent[x]];
                return x;
            };
            let total = 0;
            for (const [w, u, v] of edges) {
                const a = find(u);
                const b = find(v);
                if (a !== b) {
                    parent[a] = b;
                    total += w;
                }
            }
            return total;
        },
        generate: (r, big) => {
            const n = big ? 5000 : r.int(2, 8);
            return randomGraph(r, n, big ? 10000 : r.int(n - 1, 2 * n), { connected: true, weight: big ? 1e6 : 20 });
        },
    },
    {
        title: "Rotting Oranges",
        difficulty: "medium",
        tags: ["graphs", "queue"],
        description: `
Each cell of an r x c grid is 0 (empty), 1 (fresh orange) or 2 (rotten orange). Every minute, each fresh orange next to a rotten one (up, down, left or right) becomes rotten. Find the minimum number of minutes until no fresh orange remains, or -1 if that never happens.

Input
The first line contains r and c. Each of the next r lines contains c digits.

Output
Print the number of minutes, or -1.`,
        constraints: ["1 <= r, c <= 300", "Each cell is 0, 1 or 2"],
        examples: [
            { input: "3 3\n211\n110\n011", explanation: "The rot spreads from the top-left corner and reaches the bottom-right orange after 4 minutes." },
            { input: "3 3\n211\n011\n101", explanation: "The orange in the bottom-left corner is never reached." },
        ],
        edge: ["1 2\n00", "1 1\n2"],
        solve: (input) => {
            const t = input.trim().split(/\s+/);
            const [R, C] = [Number(t[0]), Number(t[1])];
            const g = t.slice(2, 2 + R).map((row) => row.split(""));
            let fresh = 0;
            let queue = [];
            for (let i = 0; i < R; i++) {
                for (let j = 0; j < C; j++) {
                    if (g[i][j] === "1") fresh++;
                    if (g[i][j] === "2") queue.push([i, j]);
                }
            }
            let minutes = 0;
            while (queue.length && fresh) {
                const next = [];
                for (const [i, j] of queue) {
                    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                        const x = i + di;
                        const y = j + dj;
                        if (x >= 0 && y >= 0 && x < R && y < C && g[x][y] === "1") {
                            g[x][y] = "2";
                            fresh--;
                            next.push([x, y]);
                        }
                    }
                }
                queue = next;
                minutes++;
            }
            return fresh ? -1 : minutes;
        },
        generate: (r, big) => {
            const rows = big ? 300 : r.int(1, 6);
            const cols = big ? 300 : r.int(1, 6);
            const rotten = big ? 0.0005 : 0.15;
            const empty = r.pick([0, 0.05, 0.25]);
            return `${rows} ${cols}\n${grid(r, rows, cols, () => (r.chance(rotten) ? "2" : r.chance(empty) ? "0" : "1")).join("\n")}`;
        },
    },
    {
        title: "Binary Tree Level Order Traversal",
        difficulty: "medium",
        tags: ["trees", "queue"],
        description: `
Given a binary tree, print its nodes level by level: the root on the first line, its children on the second line, and so on. Within a level, print nodes from left to right.

Input
${BINARY_TREE_FORMAT}

Output
Print one line per level with the node labels separated by spaces.`,
        constraints: ["1 <= n <= 10^4", "The input describes a valid binary tree rooted at node 1"],
        examples: [
            { input: "5\n2 3\n0 0\n4 5\n0 0\n0 0", explanation: "Level 1: 1. Level 2: 2 3. Level 3: 4 5." },
            { input: "3\n0 2\n0 3\n0 0", explanation: "A chain going right has one node per level." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const out = [];
            let level = [1];
            while (level.length) {
                out.push(level.join(" "));
                const next = [];
                for (const v of level) {
                    if (t[2 * v - 1]) next.push(t[2 * v - 1]);
                    if (t[2 * v]) next.push(t[2 * v]);
                }
                level = next;
            }
            return out.join("\n");
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 10);
            return `${n}\n${childLines(binaryTree(r, n, big && r.chance(0.5)), n)}`;
        },
    },
    {
        title: "Validate Binary Search Tree",
        difficulty: "medium",
        tags: ["trees"],
        description: `
Given a binary tree with a value on each node, decide whether it is a valid binary search tree: for every node, all values in its left subtree are strictly smaller than its value and all values in its right subtree are strictly larger.

Checking only a node against its direct children is not enough.

Input
The first line contains n, the number of nodes. The nodes are labelled 1 to n and node 1 is the root.
The second line contains n integers: the values of nodes 1..n.
Each of the next n lines describes one node, in order from node 1 to node n, with two integers: its left child and its right child (0 means no child).

Output
Print YES if the tree is a valid binary search tree, otherwise print NO.`,
        constraints: ["1 <= n <= 10^4", "-10^9 <= value <= 10^9"],
        examples: [
            { input: "3\n2 1 3\n2 3\n0 0\n0 0", explanation: "1 < 2 < 3 with 1 on the left and 3 on the right." },
            { input: "5\n5 1 4 3 6\n2 3\n0 0\n4 5\n0 0\n0 0", explanation: "The root is 5 but its right subtree contains 4 and 3." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const n = t[0];
            const value = (v) => t[v];
            const left = (v) => t[n + 2 * v - 1];
            const right = (v) => t[n + 2 * v];
            // a BST's inorder traversal is strictly increasing
            const stack = [];
            let prev = -Infinity;
            let v = 1;
            while (v || stack.length) {
                while (v) {
                    stack.push(v);
                    v = left(v);
                }
                v = stack.pop();
                if (value(v) <= prev) return "NO";
                prev = value(v);
                v = right(v);
            }
            return "YES";
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 9);
            const tree = binaryTree(r, n, big && r.chance(0.5));
            const order = [];
            const stack = [];
            let v = 1;
            while (v || stack.length) {
                while (v) {
                    stack.push(v);
                    v = tree.left[v];
                }
                v = stack.pop();
                order.push(v);
                v = tree.right[v];
            }
            const sorted = [...new Set(r.ints(n * 2, -1e9, 1e9))].sort((a, b) => a - b).slice(0, n);
            while (sorted.length < n) sorted.push(sorted[sorted.length - 1] + 1);
            const values = new Array(n + 1);
            order.forEach((node, i) => (values[node] = sorted[i]));
            if (n > 1 && r.chance(0.6)) {
                const a = r.int(1, n);
                const b = r.int(1, n);
                if (r.chance(0.5)) [values[a], values[b]] = [values[b], values[a]];
                else values[a] = values[b];
            }
            return `${n}\n${values.slice(1).join(" ")}\n${childLines(tree, n)}`;
        },
    },
    {
        title: "Tree Diameter",
        difficulty: "medium",
        tags: ["trees", "graphs"],
        description: `
The diameter of a tree is the number of edges on the longest path between any two nodes. Given a tree, find its diameter.

A classic trick: run a BFS from any node to find the farthest node, then BFS again from that node.

Input
The first line contains n. Each of the next n - 1 lines contains two integers u and v: an edge of the tree.

Output
Print the diameter.`,
        constraints: ["1 <= n <= 10^4", "The edges form a tree"],
        examples: [
            { input: "5\n1 2\n1 3\n3 4\n3 5", explanation: "The longest path is 2 - 1 - 3 - 4 with 3 edges." },
            { input: "1", explanation: "A single node has diameter 0." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const n = t[0];
            const adj = Array.from({ length: n + 1 }, () => []);
            for (let i = 0; i < n - 1; i++) {
                adj[t[1 + 2 * i]].push(t[2 + 2 * i]);
                adj[t[2 + 2 * i]].push(t[1 + 2 * i]);
            }
            const bfs = (start) => {
                const dist = new Array(n + 1).fill(-1);
                dist[start] = 0;
                const queue = [start];
                for (let head = 0; head < queue.length; head++) {
                    for (const to of adj[queue[head]]) {
                        if (dist[to] === -1) {
                            dist[to] = dist[queue[head]] + 1;
                            queue.push(to);
                        }
                    }
                }
                const far = queue[queue.length - 1];
                return [far, dist[far]];
            };
            return bfs(bfs(1)[0])[1];
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 10);
            const edges = randomTree(r, n, big && r.chance(0.5)).map(([a, b]) => `${a} ${b}`);
            return `${n}${edges.length ? "\n" : ""}${r.shuffle(edges).join("\n")}`;
        },
    },
    {
        title: "Lowest Common Ancestor Queries",
        difficulty: "hard",
        tags: ["trees"],
        description: `
A tree has n nodes and is rooted at node 1. Answer q queries: for nodes u and v, find their lowest common ancestor, the deepest node that is an ancestor of both. A node counts as its own ancestor.

Walking up one parent at a time can take O(n) per query on a deep tree. Binary lifting answers each query in O(log n).

Input
The first line contains n. The second line contains n - 1 integers: the parents of nodes 2, 3, ..., n.
The next line contains q. Each of the next q lines contains two integers u and v.

Output
For each query, print the lowest common ancestor on its own line.`,
        constraints: ["1 <= n, q <= 10^4", "The parents describe a valid tree rooted at node 1"],
        examples: [
            { input: "6\n1 1 2 2 3\n3\n4 5\n4 6\n2 4", explanation: "4 and 5 are both children of 2. 4 and 6 only meet at the root. 2 is an ancestor of 4." },
            { input: "1\n\n1\n1 1", explanation: "A single node is its own ancestor." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const n = t[0];
            const LOG = 15;
            const children = Array.from({ length: n + 1 }, () => []);
            const up = Array.from({ length: LOG }, () => new Int32Array(n + 1));
            up[0][1] = 1;
            for (let v = 2; v <= n; v++) {
                up[0][v] = t[v - 1];
                children[t[v - 1]].push(v);
            }
            const depth = new Int32Array(n + 1);
            const order = [1];
            for (let head = 0; head < order.length; head++) {
                for (const c of children[order[head]]) {
                    depth[c] = depth[order[head]] + 1;
                    order.push(c);
                }
            }
            for (let k = 1; k < LOG; k++) for (let v = 1; v <= n; v++) up[k][v] = up[k - 1][up[k - 1][v]];
            const lca = (u, v) => {
                if (depth[u] < depth[v]) [u, v] = [v, u];
                for (let k = LOG - 1; k >= 0; k--) if (depth[u] - (1 << k) >= depth[v]) u = up[k][u];
                if (u === v) return u;
                for (let k = LOG - 1; k >= 0; k--) {
                    if (up[k][u] !== up[k][v]) {
                        u = up[k][u];
                        v = up[k][v];
                    }
                }
                return up[0][u];
            };
            const q = t[n];
            const out = [];
            for (let i = 0; i < q; i++) out.push(lca(t[n + 1 + 2 * i], t[n + 2 + 2 * i]));
            return out.join("\n");
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 10);
            const q = big ? 10000 : r.int(1, 6);
            const parent = new Array(n + 1).fill(0);
            for (const [p, c] of randomTree(r, n, big && r.chance(0.5))) parent[c] = p;
            const queries = Array.from({ length: q }, () => `${r.int(1, n)} ${r.int(1, n)}`);
            return `${n}\n${parent.slice(2).join(" ")}\n${q}\n${queries.join("\n")}`;
        },
    },
    {
        title: "Binary Tree Maximum Path Sum",
        difficulty: "hard",
        tags: ["trees", "recursion"],
        description: `
A path in a binary tree is a sequence of nodes where each pair of consecutive nodes is connected by an edge; each node appears at most once and the path does not need to pass through the root. The path sum is the sum of the node values on it.

Given a binary tree with a value on each node, find the maximum path sum of any non-empty path.

Input
The first line contains n, the number of nodes. The nodes are labelled 1 to n and node 1 is the root.
The second line contains n integers: the values of nodes 1..n.
Each of the next n lines describes one node, in order from node 1 to node n, with two integers: its left child and its right child (0 means no child).

Output
Print the maximum path sum.`,
        constraints: ["1 <= n <= 10^4", "-1000 <= value <= 1000"],
        examples: [
            { input: "3\n1 2 3\n2 3\n0 0\n0 0", explanation: "The path 2 -> 1 -> 3 has sum 6." },
            { input: "5\n-10 9 20 15 7\n2 3\n0 0\n4 5\n0 0\n0 0", explanation: "The path 15 -> 20 -> 7 has sum 42." },
        ],
        edge: ["1\n-3\n0 0", "3\n-1 -2 -3\n2 3\n0 0\n0 0"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const n = t[0];
            const left = (v) => t[n + 2 * v - 1];
            const right = (v) => t[n + 2 * v];
            const order = [1];
            for (let head = 0; head < order.length; head++) {
                const v = order[head];
                if (left(v)) order.push(left(v));
                if (right(v)) order.push(right(v));
            }
            const gain = new Array(n + 1).fill(0); // best downward path starting at the node
            let best = -Infinity;
            for (let i = order.length - 1; i >= 0; i--) {
                const v = order[i];
                const l = Math.max(0, left(v) ? gain[left(v)] : 0);
                const r = Math.max(0, right(v) ? gain[right(v)] : 0);
                best = Math.max(best, t[v] + l + r);
                gain[v] = t[v] + Math.max(l, r);
            }
            return best;
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 9);
            const tree = binaryTree(r, n, big && r.chance(0.5));
            const lo = r.pick([-1000, -300, -10]);
            return `${n}\n${r.ints(n, lo, 1000).join(" ")}\n${childLines(tree, n)}`;
        },
    },
    {
        title: "Word Ladder",
        difficulty: "hard",
        tags: ["graphs", "queue", "strings"],
        description: `
You are given a begin word, an end word and a word list. In one step you can change exactly one letter of the current word, and the new word must be in the word list. Find the number of words in the shortest sequence from begin to end, counting both begin and end. The begin word does not need to be in the list. If end cannot be reached, print 0.

Input
The first line contains the begin word and the end word. The second line contains n. The third line contains the n words of the list separated by spaces.

Output
Print the length of the shortest transformation sequence, or 0.`,
        constraints: [
            "1 <= word length <= 10",
            "1 <= n <= 5000",
            "All words have the same length and consist of lowercase English letters",
            "The begin word differs from the end word, and the list has no duplicates",
        ],
        examples: [
            { input: "hit cog\n6\nhot dot dog lot log cog", explanation: "hit -> hot -> dot -> dog -> cog has 5 words." },
            { input: "hit cog\n5\nhot dot dog lot log", explanation: "cog is not in the list." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/);
            const [begin, end] = t;
            const words = t.slice(3, 3 + Number(t[2]));
            const buckets = new Map(); // pattern with one '*' -> words matching it
            for (const w of words) {
                for (let i = 0; i < w.length; i++) {
                    const key = w.slice(0, i) + "*" + w.slice(i + 1);
                    if (!buckets.has(key)) buckets.set(key, []);
                    buckets.get(key).push(w);
                }
            }
            const dist = new Map([[begin, 1]]);
            const queue = [begin];
            for (let head = 0; head < queue.length; head++) {
                const w = queue[head];
                if (w === end) return dist.get(w);
                for (let i = 0; i < w.length; i++) {
                    const key = w.slice(0, i) + "*" + w.slice(i + 1);
                    for (const next of buckets.get(key) || []) {
                        if (!dist.has(next)) {
                            dist.set(next, dist.get(w) + 1);
                            queue.push(next);
                        }
                    }
                    buckets.delete(key);
                }
            }
            return 0;
        },
        generate: (r, big) => {
            const length = big ? r.int(5, 7) : r.int(2, 3);
            const alphabet = big ? "abcd" : "abc";
            const list = new Set();
            const target = big ? 5000 : r.int(1, 8);
            for (let tries = 0; list.size < target && tries < target * 20; tries++) list.add(r.str(length, alphabet));
            const words = [...list];
            const begin = r.str(length, alphabet);
            let end = r.chance(0.8) ? r.pick(words) : r.str(length, alphabet);
            if (end === begin) end = begin.slice(0, -1) + (begin.slice(-1) === "a" ? "b" : "a");
            return `${begin} ${end}\n${words.length}\n${r.shuffle(words).join(" ")}`;
        },
    },
];
