// Arrays, math, sorting and searching problems. Format of each entry: see scripts/seedProblems.js.
// solve(input) must be self-contained (its source becomes the stored reference solution).

const arr = (r, n, lo, hi) => `${n}\n${r.ints(n, lo, hi).join(" ")}`;

module.exports = [
    {
        title: "Running Sum of an Array",
        difficulty: "easy",
        tags: ["arrays"],
        description: `
Given an array of n integers, print its running sum. The i-th value of the running sum is a1 + a2 + ... + ai.

Input
The first line contains n. The second line contains n integers a1, a2, ..., an.

Output
Print n integers separated by spaces: the running sum of the array.`,
        constraints: ["1 <= n <= 10^4", "-10^4 <= ai <= 10^4"],
        examples: [
            { input: "5\n1 2 3 4 5", explanation: "1, 1+2, 1+2+3, 1+2+3+4 and 1+2+3+4+5." },
            { input: "4\n3 -1 0 2", explanation: "3, 3-1, 3-1+0 and 3-1+0+2." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const out = [];
            let sum = 0;
            for (let i = 1; i <= t[0]; i++) out.push((sum += t[i]));
            return out.join(" ");
        },
        generate: (r, big) => arr(r, big ? 10000 : r.int(1, 15), -10000, 10000),
    },
    {
        title: "Second Largest Distinct Element",
        difficulty: "easy",
        tags: ["arrays", "sorting"],
        description: `
Given an array of n non-negative integers, print the second largest distinct value in it. If all elements are equal, print -1.

Input
The first line contains n. The second line contains n integers a1, a2, ..., an.

Output
Print the second largest distinct value, or -1 if it does not exist.`,
        constraints: ["1 <= n <= 10^4", "0 <= ai <= 10^9"],
        examples: [
            { input: "5\n4 9 2 9 7", explanation: "The distinct values are 2, 4, 7 and 9. The second largest is 7." },
            { input: "3\n5 5 5", explanation: "All elements are equal, so there is no second largest value." },
        ],
        edge: ["1\n0", "2\n1000000000 0"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            let first = -1;
            let second = -1;
            for (let i = 1; i <= t[0]; i++) {
                if (t[i] > first) {
                    second = first;
                    first = t[i];
                } else if (t[i] < first && t[i] > second) {
                    second = t[i];
                }
            }
            return second;
        },
        generate: (r, big) => (big ? arr(r, 10000, 0, 1e9) : arr(r, r.int(1, 10), 0, r.pick([1, 5, 100]))),
    },
    {
        title: "Missing Number",
        difficulty: "easy",
        tags: ["arrays", "math"],
        description: `
You are given n distinct integers, each between 0 and n inclusive. Exactly one number from that range is missing. Find it.

Input
The first line contains n. The second line contains n distinct integers.

Output
Print the missing number.`,
        constraints: ["1 <= n <= 10^4", "0 <= ai <= n", "All ai are distinct"],
        examples: [
            { input: "3\n3 0 1", explanation: "The range is 0..3 and 2 does not appear." },
            { input: "9\n9 6 4 2 3 5 7 0 1", explanation: "The range is 0..9 and 8 does not appear." },
        ],
        edge: ["1\n0", "1\n1"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const n = t[0];
            let sum = 0;
            for (let i = 1; i <= n; i++) sum += t[i];
            return (n * (n + 1)) / 2 - sum;
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 15);
            const values = r.shuffle(Array.from({ length: n + 1 }, (_, i) => i));
            values.pop();
            return `${n}\n${values.join(" ")}`;
        },
    },
    {
        title: "Move Zeroes",
        difficulty: "easy",
        tags: ["arrays", "two pointers"],
        description: `
Given an array of n integers, move all zeroes to the end of the array while keeping the relative order of the non-zero elements.

Try to do it in place with a single pass.

Input
The first line contains n. The second line contains n integers.

Output
Print the n integers of the resulting array separated by spaces.`,
        constraints: ["1 <= n <= 10^4", "-10^5 <= ai <= 10^5"],
        examples: [
            { input: "5\n0 1 0 3 12", explanation: "The non-zero elements 1, 3, 12 keep their order and the two zeroes go to the end." },
            { input: "1\n0", explanation: "A single zero stays where it is." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const a = t.slice(1, t[0] + 1);
            const nonZero = a.filter((x) => x !== 0);
            return nonZero.concat(Array(a.length - nonZero.length).fill(0)).join(" ");
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 12);
            return `${n}\n${Array.from({ length: n }, () => (r.chance(0.35) ? 0 : r.int(-100000, 100000))).join(" ")}`;
        },
    },
    {
        title: "Majority Element",
        difficulty: "easy",
        tags: ["arrays", "hash table"],
        description: `
Given an array of n integers, find the majority element: the value that appears more than n / 2 times (integer division). The majority element always exists.

Can you solve it in O(n) time and O(1) extra space?

Input
The first line contains n. The second line contains n integers.

Output
Print the majority element.`,
        constraints: ["1 <= n <= 10^4", "-10^9 <= ai <= 10^9", "The majority element always exists"],
        examples: [
            { input: "3\n3 2 3", explanation: "3 appears 2 times, which is more than 3 / 2 = 1." },
            { input: "7\n2 2 1 1 1 2 2", explanation: "2 appears 4 times, which is more than 7 / 2 = 3." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            let candidate = 0;
            let votes = 0;
            for (let i = 1; i <= t[0]; i++) {
                if (votes === 0) candidate = t[i];
                votes += t[i] === candidate ? 1 : -1;
            }
            return candidate;
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 15);
            const x = r.int(-1e9, 1e9);
            const copies = Math.min(n, Math.floor(n / 2) + 1 + r.int(0, 2));
            const values = Array(copies).fill(x).concat(r.ints(n - copies, -1e9, 1e9));
            return `${n}\n${r.shuffle(values).join(" ")}`;
        },
    },
    {
        title: "Count Primes",
        difficulty: "easy",
        tags: ["math"],
        description: `
Given an integer n, count how many prime numbers are less than or equal to n.

Input
A single integer n.

Output
Print the number of primes p with p <= n.`,
        constraints: ["0 <= n <= 10^6"],
        examples: [
            { input: "10", explanation: "The primes up to 10 are 2, 3, 5 and 7." },
            { input: "1", explanation: "There are no primes up to 1." },
        ],
        edge: ["0", "2", "1000000"],
        solve: (input) => {
            const n = Number(input.trim());
            if (n < 2) return 0;
            const composite = new Uint8Array(n + 1);
            let count = 0;
            for (let i = 2; i <= n; i++) {
                if (composite[i]) continue;
                count++;
                for (let j = i * i; j <= n; j += i) composite[j] = 1;
            }
            return count;
        },
        generate: (r, big) => String(big ? r.int(500000, 1000000) : r.int(0, 1000)),
    },
    {
        title: "GCD and LCM of an Array",
        difficulty: "easy",
        tags: ["math"],
        description: `
Given n positive integers, print their greatest common divisor (GCD) and their least common multiple (LCM).

Input
The first line contains n. The second line contains n integers.

Output
Print two integers separated by a space: the GCD and the LCM of all the numbers.`,
        constraints: ["1 <= n <= 1000", "1 <= ai <= 20", "The LCM fits in a 64-bit signed integer"],
        examples: [
            { input: "3\n4 6 8", explanation: "The GCD of 4, 6 and 8 is 2 and their LCM is 24." },
            { input: "2\n7 7", explanation: "Both the GCD and the LCM of 7 and 7 are 7." },
        ],
        edge: ["1\n1"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
            let g = t[1];
            let l = t[1];
            for (let i = 2; i <= t[0]; i++) {
                g = gcd(g, t[i]);
                l = (l / gcd(l, t[i])) * t[i];
            }
            return `${g} ${l}`;
        },
        generate: (r, big) => {
            const n = big ? 1000 : r.int(1, 6);
            const factor = r.pick([1, 2, 3, 4]);
            return `${n}\n${Array.from({ length: n }, () => factor * r.int(1, Math.floor(20 / factor))).join(" ")}`;
        },
    },
    {
        title: "Rotate Array",
        difficulty: "easy",
        tags: ["arrays"],
        description: `
Given an array of n integers and a non-negative integer k, rotate the array to the right by k steps.

One step moves the last element to the front.

Input
The first line contains n and k. The second line contains n integers.

Output
Print the rotated array, separated by spaces.`,
        constraints: ["1 <= n <= 10^4", "0 <= k <= 10^9", "-10^5 <= ai <= 10^5"],
        examples: [
            { input: "7 3\n1 2 3 4 5 6 7", explanation: "After 3 steps: [7,1,2,3,4,5,6] -> [6,7,1,2,3,4,5] -> [5,6,7,1,2,3,4]." },
            { input: "4 6\n-1 -100 3 99", explanation: "6 steps on an array of length 4 is the same as 2 steps." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const n = t[0];
            const k = t[1] % n;
            const a = t.slice(2, 2 + n);
            return a.slice(n - k).concat(a.slice(0, n - k)).join(" ");
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 10);
            const k = r.chance(0.5) ? r.int(0, 2 * n) : r.int(0, 1e9);
            return `${n} ${k}\n${r.ints(n, -100000, 100000).join(" ")}`;
        },
    },
    {
        title: "Pascal's Triangle Row",
        difficulty: "easy",
        tags: ["math", "dynamic programming"],
        description: `
In Pascal's triangle, each number is the sum of the two numbers directly above it. Row 0 is "1", row 1 is "1 1", row 2 is "1 2 1", and so on.

Given r, print row r of Pascal's triangle.

Input
A single integer r.

Output
Print the r + 1 numbers of row r separated by spaces.`,
        constraints: ["0 <= r <= 30"],
        examples: [
            { input: "3", explanation: "Row 3 is 1 3 3 1." },
            { input: "0", explanation: "Row 0 is just 1." },
        ],
        edge: ["30", "1"],
        solve: (input) => {
            const r = Number(input.trim());
            let row = [1];
            for (let i = 1; i <= r; i++) {
                const next = [1];
                for (let j = 1; j < i; j++) next.push(row[j - 1] + row[j]);
                next.push(1);
                row = next;
            }
            return row.join(" ");
        },
        generate: (r) => String(r.int(2, 29)),
    },
    {
        title: "Modular Exponentiation",
        difficulty: "medium",
        tags: ["math", "recursion"],
        description: `
Given three integers a, b and m, compute a^b mod m. Treat 0^0 as 1.

The exponent can be as large as 10^18, so multiplying a by itself b times is too slow. Use fast exponentiation (exponentiation by squaring).

Input
A single line with three integers a, b and m.

Output
Print a^b mod m.`,
        constraints: ["0 <= a <= 10^18", "0 <= b <= 10^18", "1 <= m <= 10^9"],
        examples: [
            { input: "2 10 1000", explanation: "2^10 = 1024 and 1024 mod 1000 = 24." },
            { input: "3 0 7", explanation: "Any number to the power 0 is 1." },
        ],
        edge: ["0 0 7", "5 3 1", "0 5 13", "1000000000000000000 1000000000000000000 1000000000"],
        solve: (input) => {
            let [a, b, m] = input.trim().split(/\s+/).map(BigInt);
            let result = 1n % m;
            a %= m;
            while (b > 0n) {
                if (b & 1n) result = (result * a) % m;
                a = (a * a) % m;
                b >>= 1n;
            }
            return result.toString();
        },
        generate: (r) => {
            const big = () => `${r.int(1, 9)}${r.str(r.int(0, 17), "0123456789")}`;
            return `${big()} ${big()} ${r.int(1, 1e9)}`;
        },
    },
    {
        title: "Subarray Sum Equals K",
        difficulty: "medium",
        tags: ["arrays", "hash table"],
        description: `
Given an array of n integers and an integer k, count the number of non-empty contiguous subarrays whose sum equals k.

Input
The first line contains n and k. The second line contains n integers.

Output
Print the number of subarrays whose sum is k. The answer may not fit in a 32-bit integer.`,
        constraints: ["1 <= n <= 2 * 10^4", "-1000 <= ai <= 1000", "-10^6 <= k <= 10^6"],
        examples: [
            { input: "3 2\n1 1 1", explanation: "The subarrays [1,1] starting at index 0 and at index 1 both sum to 2." },
            { input: "3 3\n1 2 3", explanation: "[1,2] and [3] both sum to 3." },
        ],
        edge: ["5 0\n0 0 0 0 0"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const [n, k] = t;
            const seen = new Map([[0, 1]]);
            let prefix = 0;
            let count = 0;
            for (let i = 0; i < n; i++) {
                prefix += t[2 + i];
                count += seen.get(prefix - k) || 0;
                seen.set(prefix, (seen.get(prefix) || 0) + 1);
            }
            return count;
        },
        generate: (r, big) => {
            const n = big ? 20000 : r.int(1, 15);
            const range = r.pick([1, 3, 1000]);
            return `${n} ${r.int(-5, 5)}\n${r.ints(n, -range, range).join(" ")}`;
        },
    },
    {
        title: "Longest Consecutive Sequence",
        difficulty: "medium",
        tags: ["arrays", "hash table"],
        description: `
Given an unsorted array of n integers, find the length of the longest sequence of consecutive integers (x, x+1, x+2, ...) whose values all appear in the array. Values may repeat; each value counts once.

Aim for O(n) time.

Input
The first line contains n. The second line contains n integers.

Output
Print the length of the longest consecutive sequence.`,
        constraints: ["1 <= n <= 10^4", "-10^9 <= ai <= 10^9"],
        examples: [
            { input: "6\n100 4 200 1 3 2", explanation: "The longest consecutive sequence is 1, 2, 3, 4." },
            { input: "5\n1 2 0 1 5", explanation: "0, 1, 2 is the longest; the repeated 1 counts once." },
        ],
        edge: ["1\n-1000000000"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const set = new Set(t.slice(1, t[0] + 1));
            let best = 0;
            for (const x of set) {
                if (set.has(x - 1)) continue;
                let y = x;
                while (set.has(y + 1)) y++;
                best = Math.max(best, y - x + 1);
            }
            return best;
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 15);
            const spread = big ? r.pick([15000, 1e9]) : 20;
            return arr(r, n, -spread, spread);
        },
    },
    {
        title: "Merge Intervals",
        difficulty: "medium",
        tags: ["arrays", "sorting"],
        description: `
Given n closed intervals [l, r], merge all overlapping intervals. Intervals that share an endpoint also overlap, so [1, 3] and [3, 5] merge into [1, 5], but [1, 2] and [3, 4] stay separate.

Input
The first line contains n. Each of the next n lines contains two integers l and r.

Output
On the first line print m, the number of merged intervals. Then print the m merged intervals, one per line as "l r", sorted by l.`,
        constraints: ["1 <= n <= 10^4", "0 <= l <= r <= 10^6"],
        examples: [
            { input: "4\n1 3\n2 6\n8 10\n15 18", explanation: "[1,3] and [2,6] overlap and merge into [1,6]." },
            { input: "2\n1 4\n4 5", explanation: "[1,4] and [4,5] share the endpoint 4, so they merge." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const intervals = [];
            for (let i = 0; i < t[0]; i++) intervals.push([t[1 + 2 * i], t[2 + 2 * i]]);
            intervals.sort((a, b) => a[0] - b[0]);
            const merged = [];
            for (const [l, r] of intervals) {
                const last = merged[merged.length - 1];
                if (last && l <= last[1]) last[1] = Math.max(last[1], r);
                else merged.push([l, r]);
            }
            return [merged.length, ...merged.map((x) => x.join(" "))].join("\n");
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 10);
            const lines = [];
            for (let i = 0; i < n; i++) {
                const l = r.int(0, big ? 1e6 - 500 : 40);
                lines.push(`${l} ${l + r.int(0, big ? 500 : 6)}`);
            }
            return `${n}\n${lines.join("\n")}`;
        },
    },
    {
        title: "Kth Largest Element",
        difficulty: "medium",
        tags: ["arrays", "sorting", "heaps"],
        description: `
Given an array of n integers and an integer k, print the k-th largest element. It is the k-th largest in sorted order, not the k-th distinct value.

Input
The first line contains n and k. The second line contains n integers.

Output
Print the k-th largest element.`,
        constraints: ["1 <= k <= n <= 10^4", "-10^4 <= ai <= 10^4"],
        examples: [
            { input: "6 2\n3 2 1 5 6 4", explanation: "Sorted descending: 6 5 4 3 2 1. The 2nd largest is 5." },
            { input: "9 4\n3 2 3 1 2 4 5 5 6", explanation: "Sorted descending: 6 5 5 4 3 3 2 2 1. The 4th largest is 4." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const [n, k] = t;
            return t.slice(2, 2 + n).sort((a, b) => b - a)[k - 1];
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 12);
            return `${n} ${r.int(1, n)}\n${r.ints(n, -10000, 10000).join(" ")}`;
        },
    },
    {
        title: "Sort Colors",
        difficulty: "easy",
        tags: ["arrays", "two pointers", "sorting"],
        description: `
An array contains n values, each 0 (red), 1 (white) or 2 (blue). Sort it so that all 0s come first, then all 1s, then all 2s.

Try to do it in one pass without a library sort (the Dutch national flag algorithm).

Input
The first line contains n. The second line contains n integers, each 0, 1 or 2.

Output
Print the sorted array, separated by spaces.`,
        constraints: ["1 <= n <= 10^4", "ai is 0, 1 or 2"],
        examples: [
            { input: "6\n2 0 2 1 1 0", explanation: "Two 0s, two 1s and two 2s." },
            { input: "3\n2 0 1", explanation: "One of each color." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const count = [0, 0, 0];
            for (let i = 1; i <= t[0]; i++) count[t[i]]++;
            return [0, 1, 2].flatMap((c) => Array(count[c]).fill(c)).join(" ");
        },
        generate: (r, big) => arr(r, big ? 10000 : r.int(1, 12), 0, 2),
    },
    {
        title: "Spiral Matrix",
        difficulty: "medium",
        tags: ["arrays"],
        description: `
Given an r x c matrix, print its elements in spiral order: start at the top-left corner and go clockwise (right, down, left, up), moving inward layer by layer.

Input
The first line contains r and c. Each of the next r lines contains c integers.

Output
Print all r * c elements in spiral order, separated by spaces.`,
        constraints: ["1 <= r, c <= 100", "-1000 <= matrix[i][j] <= 1000"],
        examples: [
            { input: "3 3\n1 2 3\n4 5 6\n7 8 9", explanation: "Right along the top, down the right side, left along the bottom, up, then the center." },
            { input: "3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12", explanation: "The outer layer is 1 2 3 4 8 12 11 10 9 5, then the inner row 6 7." },
        ],
        edge: ["1 4\n1 2 3 4", "4 1\n1\n2\n3\n4"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const [R, C] = t;
            const m = (i, j) => t[2 + i * C + j];
            const out = [];
            let top = 0, bottom = R - 1, left = 0, right = C - 1;
            while (top <= bottom && left <= right) {
                for (let j = left; j <= right; j++) out.push(m(top, j));
                top++;
                for (let i = top; i <= bottom; i++) out.push(m(i, right));
                right--;
                if (top <= bottom) {
                    for (let j = right; j >= left; j--) out.push(m(bottom, j));
                    bottom--;
                }
                if (left <= right) {
                    for (let i = bottom; i >= top; i--) out.push(m(i, left));
                    left++;
                }
            }
            return out.join(" ");
        },
        generate: (r, big) => {
            const rows = big ? 100 : r.int(1, 6);
            const cols = big ? r.int(90, 100) : r.int(1, 6);
            const lines = Array.from({ length: rows }, () => r.ints(cols, -1000, 1000).join(" "));
            return `${rows} ${cols}\n${lines.join("\n")}`;
        },
    },
    {
        title: "Rotate Image",
        difficulty: "medium",
        tags: ["arrays"],
        description: `
Given an n x n matrix, rotate it 90 degrees clockwise.

Try to do it in place, without allocating a second matrix.

Input
The first line contains n. Each of the next n lines contains n integers.

Output
Print the rotated matrix: n lines with n integers each, separated by spaces.`,
        constraints: ["1 <= n <= 100", "-1000 <= matrix[i][j] <= 1000"],
        examples: [
            { input: "3\n1 2 3\n4 5 6\n7 8 9", explanation: "The first column read bottom to top (7 4 1) becomes the first row." },
            { input: "2\n1 2\n3 4", explanation: "The first column read bottom to top (3 1) becomes the first row." },
        ],
        edge: ["1\n5"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const n = t[0];
            const lines = [];
            for (let i = 0; i < n; i++) {
                const row = [];
                for (let j = 0; j < n; j++) row.push(t[1 + (n - 1 - j) * n + i]);
                lines.push(row.join(" "));
            }
            return lines.join("\n");
        },
        generate: (r, big) => {
            const n = big ? 100 : r.int(1, 6);
            return `${n}\n${Array.from({ length: n }, () => r.ints(n, -1000, 1000).join(" ")).join("\n")}`;
        },
    },
    {
        title: "First Missing Positive",
        difficulty: "hard",
        tags: ["arrays", "hash table"],
        description: `
Given an unsorted array of n integers, find the smallest positive integer that does not appear in it.

Challenge: solve it in O(n) time using only O(1) extra space.

Input
The first line contains n. The second line contains n integers.

Output
Print the smallest missing positive integer.`,
        constraints: ["1 <= n <= 10^4", "-10^9 <= ai <= 10^9"],
        examples: [
            { input: "3\n1 2 0", explanation: "1 and 2 are present, so 3 is the smallest missing positive." },
            { input: "4\n3 4 -1 1", explanation: "1 is present but 2 is missing." },
        ],
        edge: ["5\n7 8 9 11 12", "1\n1", "4\n1 1 1 1"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const set = new Set(t.slice(1, t[0] + 1));
            let x = 1;
            while (set.has(x)) x++;
            return x;
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 12);
            if (big && r.chance(0.5)) {
                // a permutation of 1..n with one value replaced, so the answer is deep inside the range
                const values = r.shuffle(Array.from({ length: n }, (_, i) => i + 1));
                values[0] = r.int(-1e9, 0);
                return `${n}\n${values.join(" ")}`;
            }
            const values = Array.from({ length: n }, () => (r.chance(0.1) ? r.int(-1e9, 1e9) : r.int(-3, n + 2)));
            return `${n}\n${values.join(" ")}`;
        },
    },
    {
        title: "Count Inversions",
        difficulty: "hard",
        tags: ["arrays", "sorting", "recursion"],
        description: `
An inversion is a pair of indices (i, j) with i < j and a[i] > a[j]. Given an array of n integers, count its inversions.

A brute-force O(n^2) check over all pairs is too slow for the largest inputs. Think about how merge sort could count them.

Input
The first line contains n. The second line contains n integers.

Output
Print the number of inversions. The answer may not fit in a 32-bit integer.`,
        constraints: ["1 <= n <= 3 * 10^4", "1 <= ai <= 10^5"],
        examples: [
            { input: "5\n2 4 1 3 5", explanation: "The inversions are (2,1), (4,1) and (4,3)." },
            { input: "4\n4 3 2 1", explanation: "Every pair is inverted: 4 * 3 / 2 = 6." },
        ],
        edge: ["3\n7 7 7"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const a = t.slice(1, t[0] + 1);
            const sortCount = (lo, hi) => {
                if (hi - lo <= 1) return 0;
                const mid = (lo + hi) >> 1;
                let count = sortCount(lo, mid) + sortCount(mid, hi);
                const merged = [];
                let i = lo;
                let j = mid;
                while (i < mid || j < hi) {
                    if (j >= hi || (i < mid && a[i] <= a[j])) merged.push(a[i++]);
                    else {
                        count += mid - i;
                        merged.push(a[j++]);
                    }
                }
                for (let k = 0; k < merged.length; k++) a[lo + k] = merged[k];
                return count;
            };
            return sortCount(0, a.length);
        },
        generate: (r, big) => {
            if (big && r.chance(0.5)) {
                const n = 30000;
                return `${n}\n${Array.from({ length: n }, (_, i) => Math.max(1, 100000 - 3 * i)).join(" ")}`;
            }
            return arr(r, big ? 30000 : r.int(1, 10), 1, big ? 100000 : 10);
        },
    },
    {
        title: "Count in Range",
        difficulty: "easy",
        tags: ["searching", "sorting"],
        description: `
Given an array of n integers, answer q queries. Each query gives two integers l and r: count how many array elements x satisfy l <= x <= r.

Sorting once and using binary search answers each query in O(log n).

Input
The first line contains n. The second line contains n integers.
The next line contains q. Each of the next q lines contains two integers l and r.

Output
For each query, print the answer on its own line.`,
        constraints: ["1 <= n, q <= 8000", "0 <= ai <= 10^6", "0 <= l <= r <= 10^6"],
        examples: [
            { input: "5\n1 3 3 7 10\n3\n3 7\n0 2\n8 9", explanation: "3, 3 and 7 are in [3,7]; only 1 is in [0,2]; nothing is in [8,9]." },
            { input: "1\n5\n1\n5 5", explanation: "The only element 5 lies in [5,5]." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const n = t[0];
            const a = t.slice(1, 1 + n).sort((x, y) => x - y);
            const lowerBound = (v) => {
                let lo = 0;
                let hi = n;
                while (lo < hi) {
                    const mid = (lo + hi) >> 1;
                    if (a[mid] < v) lo = mid + 1;
                    else hi = mid;
                }
                return lo;
            };
            const q = t[1 + n];
            const out = [];
            for (let i = 0; i < q; i++) {
                const l = t[2 + n + 2 * i];
                const r = t[3 + n + 2 * i];
                out.push(lowerBound(r + 1) - lowerBound(l));
            }
            return out.join("\n");
        },
        generate: (r, big) => {
            const n = big ? 8000 : r.int(1, 10);
            const q = big ? 8000 : r.int(1, 6);
            const max = big ? 1e6 : 20;
            const queries = Array.from({ length: q }, () => {
                const l = r.int(0, max);
                return `${l} ${r.int(l, Math.min(max, l + r.int(0, max)))}`;
            });
            return `${arr(r, n, 0, max)}\n${q}\n${queries.join("\n")}`;
        },
    },
];
