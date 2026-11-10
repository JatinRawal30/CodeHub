// Dynamic programming, recursion and backtracking problems. Format of each entry: see scripts/seedProblems.js.
// solve(input) must be self-contained (its source becomes the stored reference solution).

module.exports = [
    {
        title: "Fibonacci Number",
        difficulty: "easy",
        tags: ["recursion", "dynamic programming"],
        description: `
The Fibonacci numbers are defined as F(0) = 0, F(1) = 1 and F(n) = F(n - 1) + F(n - 2) for n >= 2. Given n, print F(n).

Plain recursion recomputes the same values over and over; remember the results instead.

Input
A single integer n.

Output
Print F(n). It may not fit in a 32-bit integer.`,
        constraints: ["0 <= n <= 90"],
        examples: [
            { input: "4", explanation: "0, 1, 1, 2, 3: F(4) = 3." },
            { input: "10", explanation: "F(10) = 55." },
        ],
        edge: ["0", "1", "90"],
        solve: (input) => {
            const n = Number(input.trim());
            let a = 0n;
            let b = 1n;
            for (let i = 0; i < n; i++) [a, b] = [b, a + b];
            return a.toString();
        },
        generate: (r) => String(r.int(2, 89)),
    },
    {
        title: "Min Cost Climbing Stairs",
        difficulty: "easy",
        tags: ["dynamic programming", "arrays"],
        description: `
A staircase has n steps and cost[i] is the cost of stepping on step i. You can start on step 0 or step 1. After paying for a step you can climb one or two steps. Find the minimum total cost to reach the top, which is just past the last step.

Input
The first line contains n. The second line contains n integers cost[0..n-1].

Output
Print the minimum cost to reach the top.`,
        constraints: ["2 <= n <= 10^4", "0 <= cost[i] <= 999"],
        examples: [
            { input: "3\n10 15 20", explanation: "Start on step 1, pay 15 and climb two steps to the top." },
            { input: "10\n1 100 1 1 1 100 1 1 100 1", explanation: "Step only on the 1s: steps 0, 2, 4, 6, 7, 9 cost 6 in total." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            let prev2 = 0;
            let prev1 = 0;
            for (let i = 2; i <= t[0]; i++) {
                const cur = Math.min(prev1 + t[i], prev2 + t[i - 1]);
                prev2 = prev1;
                prev1 = cur;
            }
            return prev1;
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(2, 10);
            return `${n}\n${r.ints(n, 0, 999).join(" ")}`;
        },
    },
    {
        title: "Unique Paths",
        difficulty: "easy",
        tags: ["dynamic programming", "math"],
        description: `
A robot stands in the top-left cell of an m x n grid. It can only move right or down. How many different paths lead it to the bottom-right cell?

Input
A single line with two integers m and n.

Output
Print the number of unique paths.`,
        constraints: ["1 <= m, n <= 17"],
        examples: [
            { input: "3 7", explanation: "There are 28 ways to arrange 2 downs and 6 rights." },
            { input: "3 2", explanation: "Right-Down-Down, Down-Right-Down and Down-Down-Right." },
        ],
        edge: ["1 1", "17 17"],
        solve: (input) => {
            const [m, n] = input.trim().split(/\s+/).map(Number);
            const row = new Array(n).fill(1);
            for (let i = 1; i < m; i++) for (let j = 1; j < n; j++) row[j] += row[j - 1];
            return row[n - 1];
        },
        generate: (r) => `${r.int(1, 17)} ${r.int(1, 17)}`,
    },
    {
        title: "Unique Paths With Obstacles",
        difficulty: "medium",
        tags: ["dynamic programming"],
        description: `
A robot stands in the top-left cell of an r x c grid and wants to reach the bottom-right cell, moving only right or down. Some cells are blocked: '.' is free and '#' is an obstacle. Count the paths that avoid every obstacle, modulo 1000000007.

If the start or the end cell is blocked, the answer is 0.

Input
The first line contains r and c. Each of the next r lines contains c characters.

Output
Print the number of paths modulo 1000000007.`,
        constraints: ["1 <= r, c <= 100", "Each cell is '.' or '#'"],
        examples: [
            { input: "3 3\n...\n.#.\n...", explanation: "The obstacle in the middle leaves two paths: around the top-right and around the bottom-left." },
            { input: "2 2\n.#\n..", explanation: "Only Down-Right works." },
        ],
        edge: ["1 1\n.", "1 1\n#", "2 2\n..\n.#"],
        solve: (input) => {
            const t = input.trim().split(/\s+/);
            const [R, C] = [Number(t[0]), Number(t[1])];
            const MOD = 1000000007;
            const dp = new Array(C).fill(0);
            dp[0] = 1;
            for (let i = 0; i < R; i++) {
                for (let j = 0; j < C; j++) {
                    if (t[2 + i][j] === "#") dp[j] = 0;
                    else if (j > 0) dp[j] = (dp[j] + dp[j - 1]) % MOD;
                }
            }
            return dp[C - 1];
        },
        generate: (r, big) => {
            const rows = big ? 100 : r.int(1, 6);
            const cols = big ? 100 : r.int(1, 6);
            const density = r.pick([0.05, 0.15, 0.3]);
            const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => (r.chance(density) ? "#" : ".")));
            if (r.chance(0.8)) {
                grid[0][0] = ".";
                grid[rows - 1][cols - 1] = ".";
            }
            return `${rows} ${cols}\n${grid.map((row) => row.join("")).join("\n")}`;
        },
    },
    {
        title: "Longest Increasing Subsequence",
        difficulty: "medium",
        tags: ["dynamic programming", "searching", "arrays"],
        description: `
Given an array of n integers, find the length of its longest strictly increasing subsequence. A subsequence keeps the original order but may skip elements.

An O(n^2) dynamic programming solution works here. Can you do O(n log n) with binary search?

Input
The first line contains n. The second line contains n integers.

Output
Print the length of the longest strictly increasing subsequence.`,
        constraints: ["1 <= n <= 2500", "-10^4 <= ai <= 10^4"],
        examples: [
            { input: "8\n10 9 2 5 3 7 101 18", explanation: "One longest subsequence is 2, 3, 7, 101." },
            { input: "4\n7 7 7 7", explanation: "Equal values are not strictly increasing, so the answer is 1." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const tails = [];
            for (let i = 1; i <= t[0]; i++) {
                let lo = 0;
                let hi = tails.length;
                while (lo < hi) {
                    const mid = (lo + hi) >> 1;
                    if (tails[mid] < t[i]) lo = mid + 1;
                    else hi = mid;
                }
                tails[lo] = t[i];
            }
            return tails.length;
        },
        generate: (r, big) => {
            const n = big ? 2500 : r.int(1, 12);
            if (big && r.chance(0.5)) return `${n}\n${Array.from({ length: n }, (_, i) => i * 8 - 10000 + r.int(-20, 0)).join(" ")}`;
            return `${n}\n${r.ints(n, -10000, big ? 10000 : 10).join(" ")}`;
        },
    },
    {
        title: "Longest Common Subsequence",
        difficulty: "medium",
        tags: ["dynamic programming", "strings"],
        description: `
Given two strings a and b, find the length of their longest common subsequence: the longest sequence of characters that appears in both strings in the same order, not necessarily contiguous.

Input
The first line contains a. The second line contains b.

Output
Print the length of the longest common subsequence.`,
        constraints: ["1 <= |a|, |b| <= 1000", "Both strings consist of lowercase English letters"],
        examples: [
            { input: "abcde\nace", explanation: "\"ace\" appears in both strings." },
            { input: "abc\ndef", explanation: "No character is shared." },
        ],
        solve: (input) => {
            const [a, b] = input.trim().split(/\s+/);
            let prev = new Array(b.length + 1).fill(0);
            for (let i = 1; i <= a.length; i++) {
                const cur = new Array(b.length + 1).fill(0);
                for (let j = 1; j <= b.length; j++) {
                    cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
                }
                prev = cur;
            }
            return prev[b.length];
        },
        generate: (r, big) => {
            const alphabet = r.pick(["ab", "abcd", "abcdefghij"]);
            return `${r.str(big ? 1000 : r.int(1, 10), alphabet)}\n${r.str(big ? 1000 : r.int(1, 10), alphabet)}`;
        },
    },
    {
        title: "Edit Distance",
        difficulty: "hard",
        tags: ["dynamic programming", "strings"],
        description: `
Given two strings a and b, find the minimum number of operations needed to turn a into b. The allowed operations are inserting a character, deleting a character and replacing a character.

Input
The first line contains a. The second line contains b.

Output
Print the minimum number of operations.`,
        constraints: ["1 <= |a|, |b| <= 1000", "Both strings consist of lowercase English letters"],
        examples: [
            { input: "horse\nros", explanation: "horse -> rorse (replace h with r) -> rose (delete r) -> ros (delete e)." },
            { input: "intention\nexecution", explanation: "Five operations are needed, for example 1 delete, 3 replaces and 1 insert." },
        ],
        edge: ["abc\nabc", "a\nzzzz"],
        solve: (input) => {
            const [a, b] = input.trim().split(/\s+/);
            let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
            for (let i = 1; i <= a.length; i++) {
                const cur = [i];
                for (let j = 1; j <= b.length; j++) {
                    cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] : 1 + Math.min(prev[j - 1], prev[j], cur[j - 1]);
                }
                prev = cur;
            }
            return prev[b.length];
        },
        generate: (r, big) => {
            const alphabet = r.pick(["ab", "abc", "abcdefghijklmnopqrstuvwxyz"]);
            return `${r.str(big ? 1000 : r.int(1, 8), alphabet)}\n${r.str(big ? r.int(900, 1000) : r.int(1, 8), alphabet)}`;
        },
    },
    {
        title: "0/1 Knapsack",
        difficulty: "medium",
        tags: ["dynamic programming"],
        description: `
You have n items; item i has weight wi and value vi. Choose a set of items with total weight at most W so that the total value is as large as possible. Each item can be taken at most once.

Input
The first line contains n and W. Each of the next n lines contains wi and vi.

Output
Print the maximum total value.`,
        constraints: ["1 <= n <= 100", "1 <= W <= 10^4", "1 <= wi <= 10^4", "0 <= vi <= 10^6"],
        examples: [
            { input: "3 50\n10 60\n20 100\n30 120", explanation: "Take the items with weights 20 and 30 for a value of 220." },
            { input: "2 5\n6 100\n5 1", explanation: "The first item is too heavy, so take only the second." },
        ],
        edge: ["1 1\n2 10"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const [n, W] = t;
            const best = new Array(W + 1).fill(0);
            for (let i = 0; i < n; i++) {
                const w = t[2 + 2 * i];
                const v = t[3 + 2 * i];
                for (let cap = W; cap >= w; cap--) best[cap] = Math.max(best[cap], best[cap - w] + v);
            }
            return best[W];
        },
        generate: (r, big) => {
            const n = big ? 100 : r.int(1, 6);
            const W = big ? 10000 : r.int(1, 30);
            const items = Array.from({ length: n }, () => `${r.int(1, big ? 1000 : 15)} ${r.int(0, big ? 1e6 : 50)}`);
            return `${n} ${W}\n${items.join("\n")}`;
        },
    },
    {
        title: "Partition Equal Subset Sum",
        difficulty: "medium",
        tags: ["dynamic programming"],
        description: `
Given n positive integers, decide whether they can be split into two groups with equal sums. Every number must go into exactly one group.

Input
The first line contains n. The second line contains n integers.

Output
Print YES if such a split exists, otherwise print NO.`,
        constraints: ["1 <= n <= 200", "1 <= ai <= 100"],
        examples: [
            { input: "4\n1 5 11 5", explanation: "{1, 5, 5} and {11} both sum to 11." },
            { input: "4\n1 2 3 5", explanation: "The total is 11, which is odd, so it cannot be split evenly." },
        ],
        edge: ["1\n2", "2\n7 7"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const a = t.slice(1, t[0] + 1);
            const total = a.reduce((s, x) => s + x, 0);
            if (total % 2) return "NO";
            const half = total / 2;
            const reachable = new Uint8Array(half + 1);
            reachable[0] = 1;
            for (const x of a) for (let s = half; s >= x; s--) if (reachable[s - x]) reachable[s] = 1;
            return reachable[half] ? "YES" : "NO";
        },
        generate: (r, big) => {
            const n = big ? 200 : r.int(1, 8);
            const values = r.ints(n, 1, big ? 100 : 12);
            if (big && r.chance(0.5)) values.forEach((_, i) => (values[i] = 2 * r.int(1, 50) - 1)); // all odd: parity matters
            return `${n}\n${values.join(" ")}`;
        },
    },
    {
        title: "Word Break",
        difficulty: "medium",
        tags: ["dynamic programming", "strings", "hash table"],
        description: `
Given a string s and a dictionary of words, decide whether s can be split into a sequence of one or more dictionary words. A dictionary word can be used any number of times.

Input
The first line contains s. The second line contains n. The third line contains the n dictionary words separated by spaces.

Output
Print YES if s can be split, otherwise print NO.`,
        constraints: ["1 <= |s| <= 300", "1 <= n <= 1000", "1 <= length of each word <= 20", "All strings consist of lowercase English letters"],
        examples: [
            { input: "leetcode\n2\nleet code", explanation: "\"leetcode\" = \"leet\" + \"code\"." },
            { input: "catsandog\n5\ncats dog sand and cat", explanation: "Every split leaves \"og\" or another piece that is not a word." },
        ],
        edge: ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab\n4\na aa aaa aaaa"],
        solve: (input) => {
            const t = input.trim().split(/\s+/);
            const s = t[0];
            const words = new Set(t.slice(2, 2 + Number(t[1])));
            const ok = new Uint8Array(s.length + 1);
            ok[0] = 1;
            for (let end = 1; end <= s.length; end++) {
                for (let start = Math.max(0, end - 20); start < end && !ok[end]; start++) {
                    if (ok[start] && words.has(s.slice(start, end))) ok[end] = 1;
                }
            }
            return ok[s.length] ? "YES" : "NO";
        },
        generate: (r, big) => {
            const words = Array.from({ length: big ? 1000 : r.int(1, 5) }, () => r.str(r.int(1, big ? 6 : 3), "ab"));
            let s = "";
            const target = big ? 300 : r.int(1, 12);
            while (s.length < target) s += r.pick(words);
            s = s.slice(0, target);
            if (r.chance(0.4)) s = s.slice(0, -1) + "c";
            const unique = [...new Set(words)];
            return `${s}\n${unique.length}\n${unique.join(" ")}`;
        },
    },
    {
        title: "Decode Ways",
        difficulty: "medium",
        tags: ["dynamic programming", "strings"],
        description: `
A message of letters A-Z is encoded as digits using A = 1, B = 2, ..., Z = 26. Given a string of digits, count how many different messages it could decode to, modulo 1000000007.

A code cannot have a leading zero, so "06" is not a valid code for F. If the string cannot be decoded at all, the answer is 0.

Input
A single line containing a string of digits.

Output
Print the number of ways to decode it, modulo 1000000007.`,
        constraints: ["1 <= |s| <= 10^4", "s consists of digits"],
        examples: [
            { input: "12", explanation: "\"AB\" (1 2) or \"L\" (12)." },
            { input: "226", explanation: "\"BZ\" (2 26), \"VF\" (22 6) or \"BBF\" (2 2 6)." },
        ],
        edge: ["0", "06", "10", "100", "2101"],
        solve: (input) => {
            const s = input.trim();
            const MOD = 1000000007;
            let prev2 = 1;
            let prev1 = s[0] === "0" ? 0 : 1;
            for (let i = 1; i < s.length; i++) {
                let cur = s[i] !== "0" ? prev1 : 0;
                const two = Number(s.slice(i - 1, i + 1));
                if (s[i - 1] !== "0" && two <= 26) cur = (cur + prev2) % MOD;
                prev2 = prev1;
                prev1 = cur;
            }
            return prev1;
        },
        generate: (r, big) => {
            const digits = big ? "1112" : r.pick(["0123456789", "1206", "12"]);
            const s = r.str(big ? 10000 : r.int(1, 10), digits);
            return s[0] === "0" && r.chance(0.7) ? "1" + s.slice(1) : s;
        },
    },
    {
        title: "Maximum Product Subarray",
        difficulty: "medium",
        tags: ["dynamic programming", "arrays"],
        description: `
Given an array of n integers, find the non-empty contiguous subarray with the largest product and print that product.

A negative number can turn the smallest product into the largest one, so keep track of both.

Input
The first line contains n. The second line contains n integers.

Output
Print the maximum product.`,
        constraints: ["1 <= n <= 2 * 10^4", "-10 <= ai <= 10", "The absolute product of any subarray is at most 10^15"],
        examples: [
            { input: "4\n2 3 -2 4", explanation: "[2, 3] has product 6." },
            { input: "3\n-2 0 -1", explanation: "Any subarray containing both negatives also contains 0, so the best is 0." },
        ],
        edge: ["1\n-5", "2\n-3 -4"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            let best = t[1];
            let hi = t[1];
            let lo = t[1];
            for (let i = 2; i <= t[0]; i++) {
                const x = t[i];
                const candidates = [x, hi * x, lo * x];
                hi = Math.max(...candidates);
                lo = Math.min(...candidates);
                best = Math.max(best, hi);
            }
            return best === 0 ? 0 : best; // avoid printing -0
        },
        generate: (r, big) => {
            const n = big ? 20000 : r.int(1, 10);
            const values = [];
            let segment = 1;
            for (let i = 0; i < n; i++) {
                let x = r.chance(0.1) ? r.int(-10, 10) : r.int(-1, 1);
                if (segment * Math.abs(x) > 1e15) x = 0; // keep every zero-free run's product within 10^15
                segment = x === 0 ? 1 : segment * Math.abs(x);
                values.push(x);
            }
            return `${n}\n${values.join(" ")}`;
        },
    },
    {
        title: "Count Subsets With Target Sum",
        difficulty: "easy",
        tags: ["backtracking", "recursion"],
        description: `
Given n positive integers and a target, count the subsets whose elements sum to the target. Elements at different positions are different even if their values are equal.

With n up to 20 you can try every subset: for each element, either take it or skip it.

Input
The first line contains n and target. The second line contains n integers.

Output
Print the number of subsets with sum equal to target.`,
        constraints: ["1 <= n <= 20", "1 <= ai <= 1000", "1 <= target <= 20000"],
        examples: [
            { input: "4 5\n1 2 3 4", explanation: "{1, 4} and {2, 3}." },
            { input: "3 2\n1 1 1", explanation: "Any two of the three 1s: 3 subsets." },
        ],
        edge: ["1 5\n4"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const [n, target] = t;
            const ways = new Array(target + 1).fill(0);
            ways[0] = 1;
            for (let i = 0; i < n; i++) {
                const x = t[2 + i];
                for (let s = target; s >= x; s--) ways[s] += ways[s - x];
            }
            return ways[target];
        },
        generate: (r, big) => {
            const n = big ? 20 : r.int(1, 8);
            const values = r.ints(n, 1, big ? r.pick([3, 1000]) : 6);
            const sum = values.reduce((s, x) => s + x, 0);
            return `${n} ${r.int(1, Math.max(1, Math.min(20000, Math.floor(sum / (r.chance(0.5) ? 2 : 1)))))}\n${values.join(" ")}`;
        },
    },
    {
        title: "All Permutations",
        difficulty: "easy",
        tags: ["backtracking", "recursion"],
        description: `
Given n distinct integers, print all of their permutations in lexicographic order (compare permutations element by element as numbers).

Input
The first line contains n. The second line contains n distinct integers.

Output
Print n! lines, each containing one permutation with its elements separated by spaces.`,
        constraints: ["1 <= n <= 7", "-10 <= ai <= 10", "All ai are distinct"],
        examples: [
            { input: "3\n1 2 3", explanation: "The 6 orderings of 1, 2, 3 from smallest to largest." },
            { input: "2\n5 -1", explanation: "-1 comes before 5." },
        ],
        edge: ["1\n0"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const a = t.slice(1, t[0] + 1).sort((x, y) => x - y);
            const out = [];
            const used = new Array(a.length).fill(false);
            const current = [];
            const go = () => {
                if (current.length === a.length) {
                    out.push(current.join(" "));
                    return;
                }
                for (let i = 0; i < a.length; i++) {
                    if (used[i]) continue;
                    used[i] = true;
                    current.push(a[i]);
                    go();
                    current.pop();
                    used[i] = false;
                }
            };
            go();
            return out.join("\n");
        },
        generate: (r, big) => {
            const n = big ? 7 : r.int(1, 4);
            const values = r.shuffle(Array.from({ length: 21 }, (_, i) => i - 10)).slice(0, n);
            return `${n}\n${values.join(" ")}`;
        },
    },
    {
        title: "N-Queens Count",
        difficulty: "hard",
        tags: ["backtracking", "recursion"],
        description: `
Place n queens on an n x n chessboard so that no two queens attack each other: no two share a row, a column or a diagonal. Count the number of distinct arrangements.

Input
A single integer n.

Output
Print the number of valid arrangements.`,
        constraints: ["1 <= n <= 11"],
        examples: [
            { input: "4", explanation: "There are two ways to place 4 non-attacking queens." },
            { input: "1", explanation: "One queen on a 1 x 1 board." },
        ],
        edge: ["2", "3", "11"],
        solve: (input) => {
            const n = Number(input.trim());
            const full = (1 << n) - 1;
            const go = (cols, diag1, diag2) => {
                if (cols === full) return 1;
                let count = 0;
                let free = full & ~(cols | diag1 | diag2);
                while (free) {
                    const bit = free & -free;
                    free ^= bit;
                    count += go(cols | bit, ((diag1 | bit) << 1) & full, (diag2 | bit) >> 1);
                }
                return count;
            };
            return go(0, 0, 0);
        },
        generate: (r) => String(r.int(5, 10)),
    },
    {
        title: "Coin Change Ways",
        difficulty: "medium",
        tags: ["dynamic programming"],
        description: `
You have coins of n different denominations and an unlimited supply of each. Count the number of combinations of coins that add up to amount, modulo 1000000007. The order of coins does not matter, so 1 + 2 and 2 + 1 are the same combination.

Input
The first line contains n and amount. The second line contains the n distinct coin values.

Output
Print the number of combinations modulo 1000000007. Making amount 0 has exactly one combination: no coins.`,
        constraints: ["1 <= n <= 100", "1 <= coin <= 10^4", "0 <= amount <= 10^4"],
        examples: [
            { input: "3 5\n1 2 5", explanation: "5, 2+2+1, 2+1+1+1 and 1+1+1+1+1." },
            { input: "1 3\n2", explanation: "3 cannot be made from 2s." },
        ],
        edge: ["1 0\n7"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const [n, amount] = t;
            const MOD = 1000000007;
            const ways = new Array(amount + 1).fill(0);
            ways[0] = 1;
            for (let i = 0; i < n; i++) {
                const c = t[2 + i];
                for (let s = c; s <= amount; s++) ways[s] = (ways[s] + ways[s - c]) % MOD;
            }
            return ways[amount];
        },
        generate: (r, big) => {
            const n = big ? 100 : r.int(1, 4);
            const coins = r.shuffle(Array.from({ length: big ? 500 : 12 }, (_, i) => i + 1)).slice(0, n);
            return `${n} ${big ? 10000 : r.int(0, 20)}\n${coins.join(" ")}`;
        },
    },
    {
        title: "Generate Parentheses",
        difficulty: "medium",
        tags: ["backtracking", "recursion"],
        description: `
Given n, print every string of n pairs of parentheses that is balanced. Print them in lexicographic order, where '(' comes before ')'.

Input
A single integer n.

Output
Print each balanced string on its own line.`,
        constraints: ["1 <= n <= 8"],
        examples: [
            { input: "3", explanation: "The five balanced strings with 3 pairs." },
            { input: "1", explanation: "Only \"()\"." },
        ],
        edge: ["8"],
        solve: (input) => {
            const n = Number(input.trim());
            const out = [];
            const go = (s, open, close) => {
                if (s.length === 2 * n) {
                    out.push(s);
                    return;
                }
                if (open < n) go(s + "(", open + 1, close);
                if (close < open) go(s + ")", open, close + 1);
            };
            go("", 0, 0);
            return out.join("\n");
        },
        generate: (r) => String(r.int(2, 7)),
    },
    {
        title: "Burst Balloons",
        difficulty: "hard",
        tags: ["dynamic programming"],
        description: `
There are n balloons in a row with numbers a1..an on them. When you burst balloon i you earn left * ai * right coins, where left and right are the numbers on the nearest balloons that are still unburst on each side. If there is no balloon on a side, treat its number as 1.

Burst all the balloons in the best order and print the maximum number of coins.

Hint: think about which balloon is burst last in a range.

Input
The first line contains n. The second line contains n integers.

Output
Print the maximum number of coins.`,
        constraints: ["1 <= n <= 300", "0 <= ai <= 100"],
        examples: [
            { input: "4\n3 1 5 8", explanation: "Burst 1, 5, 3, 8: 3*1*5 + 3*5*8 + 1*3*8 + 1*8*1 = 167." },
            { input: "2\n1 5", explanation: "Burst 1 first (1*1*5 = 5), then 5 (1*5*1 = 5)." },
        ],
        edge: ["1\n7"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const n = t[0];
            const a = [1, ...t.slice(1, n + 1), 1];
            const dp = Array.from({ length: n + 2 }, () => new Array(n + 2).fill(0));
            for (let len = 2; len <= n + 1; len++) {
                for (let left = 0; left + len <= n + 1; left++) {
                    const right = left + len;
                    let best = 0;
                    for (let k = left + 1; k < right; k++) {
                        best = Math.max(best, dp[left][k] + dp[k][right] + a[left] * a[k] * a[right]);
                    }
                    dp[left][right] = best;
                }
            }
            return dp[0][n + 1];
        },
        generate: (r, big) => {
            const n = big ? 300 : r.int(1, 7);
            return `${n}\n${r.ints(n, 0, big ? 100 : 9).join(" ")}`;
        },
    },
    {
        title: "Regular Expression Matching",
        difficulty: "hard",
        tags: ["dynamic programming", "strings", "recursion"],
        description: `
Implement pattern matching with two special characters:
'.' matches any single character.
'*' matches zero or more copies of the character just before it.

The pattern must match the entire string, not just part of it.

Input
The first line contains the string s. The second line contains the pattern p.

Output
Print YES if p matches all of s, otherwise print NO.`,
        constraints: [
            "1 <= |s|, |p| <= 1000",
            "s consists of lowercase English letters",
            "p consists of lowercase English letters, '.' and '*'",
            "Every '*' follows a letter or '.'",
        ],
        examples: [
            { input: "aa\na*", explanation: "'a*' repeats 'a' twice." },
            { input: "ab\n.*c", explanation: "'.*' can match \"ab\", but then 'c' has nothing to match." },
        ],
        edge: ["aab\nc*a*b", "mississippi\nmis*is*p*.", "a\nab*"],
        solve: (input) => {
            const [s, p] = input.trim().split(/\s+/);
            // dp[j]: does s[i..] match p[j..]; filled from the end
            let next = new Uint8Array(p.length + 2);
            next[p.length] = 1;
            for (let j = p.length - 1; j >= 0; j--) next[j] = p[j + 1] === "*" && next[j + 2] ? 1 : 0;
            for (let i = s.length - 1; i >= 0; i--) {
                const cur = new Uint8Array(p.length + 2);
                for (let j = p.length - 1; j >= 0; j--) {
                    if (p[j] === "*") continue;
                    const first = p[j] === "." || p[j] === s[i];
                    cur[j] = p[j + 1] === "*" ? (cur[j + 2] || (first && next[j]) ? 1 : 0) : first && next[j + 1] ? 1 : 0;
                }
                next = cur;
            }
            return next[0] ? "YES" : "NO";
        },
        generate: (r, big) => {
            if (big) {
                // many a* pieces make naive backtracking blow up
                const p = "a*".repeat(r.int(300, 450)) + (r.chance(0.5) ? "b" : "c");
                return `${"a".repeat(r.int(500, 999))}b\n${p}`;
            }
            const s = r.str(r.int(1, 8), "ab");
            let p = "";
            while (p.length < r.int(1, 8)) {
                p += r.pick(["a", "b", "."]);
                if (r.chance(0.4)) p += "*";
            }
            return `${s}\n${p}`;
        },
    },
    {
        title: "Tower of Hanoi",
        difficulty: "easy",
        tags: ["recursion"],
        description: `
There are three pegs numbered 1, 2 and 3. Peg 1 holds n disks of different sizes, largest at the bottom. Move the whole stack to peg 3 using the fewest moves. You can move one top disk at a time and may never place a larger disk on a smaller one.

The minimum number of moves is 2^n - 1 and the optimal sequence is unique.

Input
A single integer n.

Output
Print each move on its own line as two integers: the peg the disk is taken from and the peg it is placed on.`,
        constraints: ["1 <= n <= 12"],
        examples: [
            { input: "1", explanation: "Move the single disk from peg 1 to peg 3." },
            { input: "2", explanation: "Small disk to peg 2, large disk to peg 3, small disk to peg 3." },
        ],
        edge: ["12"],
        solve: (input) => {
            const n = Number(input.trim());
            const out = [];
            const move = (k, from, to, via) => {
                if (k === 0) return;
                move(k - 1, from, via, to);
                out.push(`${from} ${to}`);
                move(k - 1, via, to, from);
            };
            move(n, 1, 3, 2);
            return out.join("\n");
        },
        generate: (r) => String(r.int(3, 11)),
    },
];
