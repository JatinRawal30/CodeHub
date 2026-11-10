// Linked list, stack, queue, heap and geometry problems. Format of each entry: see scripts/seedProblems.js.
// solve(input) must be self-contained (its source becomes the stored reference solution).
// Linked lists are given as their values in order; build the list yourself.

const list = (r, n, lo, hi) => `${n}\n${r.ints(n, lo, hi).join(" ")}`;
const sortedValues = (r, n, lo, hi) => r.ints(n, lo, hi).sort((a, b) => a - b);

module.exports = [
    {
        title: "Reverse Linked List",
        difficulty: "easy",
        tags: ["linked list"],
        description: `
Given a singly linked list, reverse it and print the values of the reversed list.

Try reversing the next pointers in place rather than copying the values into an array.

Input
The first line contains n, the number of nodes. The second line contains the n values from head to tail.

Output
Print the values of the reversed list, separated by spaces.`,
        constraints: ["1 <= n <= 10^4", "-10^5 <= value <= 10^5"],
        examples: [
            { input: "5\n1 2 3 4 5", explanation: "5 -> 4 -> 3 -> 2 -> 1." },
            { input: "1\n7", explanation: "A single node stays the same." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            return t.slice(1, t[0] + 1).reverse().join(" ");
        },
        generate: (r, big) => list(r, big ? 10000 : r.int(1, 10), -100000, 100000),
    },
    {
        title: "Remove Nth Node From End of List",
        difficulty: "easy",
        tags: ["linked list", "two pointers"],
        description: `
Given a linked list and an integer k, remove the k-th node from the end of the list and print the remaining values.

Can you do it in one pass? Move one pointer k steps ahead, then move both pointers together.

Input
The first line contains n and k. The second line contains the n values from head to tail.

Output
Print the remaining n - 1 values, separated by spaces.`,
        constraints: ["2 <= n <= 10^4", "1 <= k <= n", "-10^5 <= value <= 10^5"],
        examples: [
            { input: "5 2\n1 2 3 4 5", explanation: "The 2nd node from the end is 4." },
            { input: "2 2\n1 2", explanation: "The 2nd node from the end is the head." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const [n, k] = t;
            const values = t.slice(2, 2 + n);
            values.splice(n - k, 1);
            return values.join(" ");
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(2, 10);
            return `${n} ${r.int(1, n)}\n${r.ints(n, -100000, 100000).join(" ")}`;
        },
    },
    {
        title: "Min Stack",
        difficulty: "easy",
        tags: ["stack"],
        description: `
Design a stack that supports these operations, each in O(1) time:
push x: put x on top of the stack.
pop: remove the top element.
top: print the top element.
getMin: print the smallest element in the stack.

Input
The first line contains q, the number of operations. Each of the next q lines contains one operation. pop, top and getMin are only called when the stack is not empty.

Output
For every top and getMin operation, print the result on its own line.`,
        constraints: ["1 <= q <= 2 * 10^4", "-10^9 <= x <= 10^9", "There is at least one top or getMin operation"],
        examples: [
            { input: "6\npush -2\npush 0\npush -3\ngetMin\npop\ntop", explanation: "The minimum of [-2, 0, -3] is -3. After popping -3 the top is 0." },
            { input: "4\npush 5\npush 5\npop\ngetMin", explanation: "One 5 is still on the stack." },
        ],
        solve: (input) => {
            const lines = input.trim().split("\n");
            const stack = [];
            const mins = [];
            const out = [];
            for (let i = 1; i <= Number(lines[0]); i++) {
                const [op, arg] = lines[i].trim().split(/\s+/);
                if (op === "push") {
                    const x = Number(arg);
                    stack.push(x);
                    mins.push(mins.length ? Math.min(x, mins[mins.length - 1]) : x);
                } else if (op === "pop") {
                    stack.pop();
                    mins.pop();
                } else if (op === "top") out.push(stack[stack.length - 1]);
                else out.push(mins[mins.length - 1]);
            }
            return out.join("\n");
        },
        generate: (r, big) => {
            const q = big ? 19999 : r.int(2, 12);
            const ops = [];
            let size = 0;
            for (let i = 0; i < q - 1; i++) {
                if (size === 0 || r.chance(0.45)) {
                    ops.push(`push ${r.int(-1e9, 1e9)}`);
                    size++;
                } else {
                    const op = r.pick(["pop", "top", "getMin"]);
                    ops.push(op);
                    if (op === "pop") size--;
                }
            }
            ops.push(size ? "getMin" : "push 1");
            if (!size) ops.push("top");
            return `${ops.length}\n${ops.join("\n")}`;
        },
    },
    {
        title: "Queue Using Two Stacks",
        difficulty: "easy",
        tags: ["queue", "stack"],
        description: `
Implement a first-in-first-out queue using only two stacks. It supports these operations:
push x: add x to the back of the queue.
pop: remove the front element and print it.
peek: print the front element without removing it.
empty: print YES if the queue is empty, otherwise NO.

Each operation should take O(1) amortized time.

Input
The first line contains q, the number of operations. Each of the next q lines contains one operation. pop and peek are only called when the queue is not empty.

Output
For every pop, peek and empty operation, print the result on its own line.`,
        constraints: ["1 <= q <= 2 * 10^4", "-10^9 <= x <= 10^9", "There is at least one pop, peek or empty operation"],
        examples: [
            { input: "5\npush 1\npush 2\npeek\npop\nempty", explanation: "The front is 1. Popping it leaves 2, so the queue is not empty." },
            { input: "3\npush 4\npop\nempty", explanation: "After removing 4 the queue is empty." },
        ],
        solve: (input) => {
            const lines = input.trim().split("\n");
            const inbox = [];
            const outbox = [];
            const out = [];
            const front = () => {
                if (!outbox.length) while (inbox.length) outbox.push(inbox.pop());
                return outbox[outbox.length - 1];
            };
            for (let i = 1; i <= Number(lines[0]); i++) {
                const [op, arg] = lines[i].trim().split(/\s+/);
                if (op === "push") inbox.push(Number(arg));
                else if (op === "pop") {
                    out.push(front());
                    outbox.pop();
                } else if (op === "peek") out.push(front());
                else out.push(inbox.length + outbox.length ? "NO" : "YES");
            }
            return out.join("\n");
        },
        generate: (r, big) => {
            const q = big ? 20000 : r.int(2, 12);
            const ops = [];
            let size = 0;
            for (let i = 0; i < q - 1; i++) {
                if (size === 0 ? r.chance(0.8) : r.chance(0.45)) {
                    ops.push(`push ${r.int(-1e9, 1e9)}`);
                    size++;
                } else if (size === 0) ops.push("empty");
                else {
                    const op = r.pick(["pop", "peek", "empty"]);
                    ops.push(op);
                    if (op === "pop") size--;
                }
            }
            ops.push("empty");
            return `${ops.length}\n${ops.join("\n")}`;
        },
    },
    {
        title: "Last Stone Weight",
        difficulty: "easy",
        tags: ["heaps"],
        description: `
You have n stones with positive weights. Each turn, take the two heaviest stones x and y with x <= y and smash them together. If x == y both are destroyed; otherwise the stone of weight x is destroyed and the other becomes y - x. Repeat until at most one stone is left.

Input
The first line contains n. The second line contains the n weights.

Output
Print the weight of the last stone, or 0 if none is left.`,
        constraints: ["1 <= n <= 10^4", "1 <= weight <= 1000"],
        examples: [
            { input: "6\n2 7 4 1 8 1", explanation: "8,7 -> 1; 4,2 -> 2; 2,1 -> 1; 1,1 -> 0; one stone of weight 1 is left." },
            { input: "2\n3 3", explanation: "Both stones are destroyed." },
        ],
        edge: ["1\n5"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            // weights are at most 1000, so count stones by weight instead of using a heap
            const count = new Array(1001).fill(0);
            for (let i = 1; i <= t[0]; i++) count[t[i]]++;
            let w = 1000;
            for (;;) {
                while (w > 0 && count[w] === 0) w--;
                if (w === 0) return 0;
                count[w]--;
                let x = w;
                while (x > 0 && count[x] === 0) x--;
                if (x === 0) return w;
                count[x]--;
                count[w - x]++;
                w = Math.max(x, w - x);
            }
        },
        generate: (r, big) => list(r, big ? 10000 : r.int(1, 8), 1, big ? 1000 : 10),
    },
    {
        title: "Rectangle Overlap Area",
        difficulty: "easy",
        tags: ["geometry", "math"],
        description: `
Two axis-aligned rectangles are each given by their bottom-left corner (x1, y1) and top-right corner (x2, y2). Find the area of their intersection. Rectangles that only touch at an edge or corner overlap with area 0.

Input
Two lines, one per rectangle, each with four integers x1 y1 x2 y2.

Output
Print the area of the intersection.`,
        constraints: ["-10^4 <= x1 < x2 <= 10^4", "-10^4 <= y1 < y2 <= 10^4"],
        examples: [
            { input: "0 0 2 2\n1 1 3 3", explanation: "They overlap in the square from (1, 1) to (2, 2)." },
            { input: "0 0 1 1\n1 0 2 1", explanation: "They only share an edge." },
        ],
        edge: ["-10000 -10000 10000 10000\n-10000 -10000 10000 10000"],
        solve: (input) => {
            const [ax1, ay1, ax2, ay2, bx1, by1, bx2, by2] = input.trim().split(/\s+/).map(Number);
            const w = Math.min(ax2, bx2) - Math.max(ax1, bx1);
            const h = Math.min(ay2, by2) - Math.max(ay1, by1);
            return w > 0 && h > 0 ? w * h : 0;
        },
        generate: (r, big) => {
            const range = big ? 10000 : 6;
            const rect = () => {
                const x1 = r.int(-range, range - 1);
                const y1 = r.int(-range, range - 1);
                return `${x1} ${y1} ${r.int(x1 + 1, range)} ${r.int(y1 + 1, range)}`;
            };
            return `${rect()}\n${rect()}`;
        },
    },
    {
        title: "Evaluate Reverse Polish Notation",
        difficulty: "easy",
        tags: ["stack"],
        description: `
Evaluate an arithmetic expression written in Reverse Polish Notation, where every operator comes after its two operands. For example, "2 1 + 3 *" means (2 + 1) * 3.

The operators are +, -, * and /. Division between integers truncates toward zero, so 7 / -2 = -3.

Input
The first line contains n, the number of tokens. The second line contains the n tokens separated by spaces.

Output
Print the value of the expression.`,
        constraints: ["1 <= n <= 10^4", "The expression is valid and never divides by zero", "Every intermediate value is between -10^9 and 10^9"],
        examples: [
            { input: "5\n2 1 + 3 *", explanation: "(2 + 1) * 3 = 9." },
            { input: "5\n4 13 5 / +", explanation: "13 / 5 = 2 (truncated), then 4 + 2 = 6." },
        ],
        edge: ["1\n-7", "3\n7 -2 /"],
        solve: (input) => {
            const tokens = input.trim().split(/\s+/).slice(1);
            const stack = [];
            for (const tok of tokens) {
                if (["+", "-", "*", "/"].includes(tok)) {
                    const b = stack.pop();
                    const a = stack.pop();
                    if (tok === "+") stack.push(a + b);
                    else if (tok === "-") stack.push(a - b);
                    else if (tok === "*") stack.push(a * b);
                    else stack.push(Math.trunc(a / b));
                } else stack.push(Number(tok));
            }
            return stack[0] + 0; // + 0 turns -0 into 0
        },
        generate: (r, big) => {
            // returns [tokens, value]; picks an operator that keeps the value within 10^9
            const build = (leaves) => {
                if (leaves === 1) {
                    const x = r.int(-100, 100);
                    return [[String(x)], x];
                }
                const split = r.int(1, leaves - 1);
                const [lt, a] = build(split);
                const [rt, b] = build(leaves - split);
                const apply = { "+": a + b, "-": a - b, "*": a * b, "/": b === 0 ? NaN : Math.trunc(a / b) };
                const op = r.shuffle(["+", "-", "*", "/"]).find((o) => Math.abs(apply[o]) <= 1e9) || (b === 0 ? "+" : "/");
                return [[...lt, ...rt, op], apply[op] + 0];
            };
            const [tokens] = build(big ? 5000 : r.int(1, 5));
            return `${tokens.length}\n${tokens.join(" ")}`;
        },
    },
    {
        title: "Add Two Numbers",
        difficulty: "medium",
        tags: ["linked list", "math"],
        description: `
Two non-negative integers are stored as linked lists of digits in reverse order: the head holds the least significant digit. Add the two numbers and print the sum in the same reversed-digit form.

The numbers can have up to 10^4 digits, so they do not fit in any built-in integer type.

Input
The first line contains n1. The second line contains the n1 digits of the first number, least significant first.
The third line contains n2. The fourth line contains the n2 digits of the second number, least significant first.

Output
Print the digits of the sum, least significant first, separated by spaces.`,
        constraints: ["1 <= n1, n2 <= 10^4", "Each digit is between 0 and 9", "Numbers have no leading zeros, except the number 0 itself"],
        examples: [
            { input: "3\n2 4 3\n3\n5 6 4", explanation: "342 + 465 = 807, printed as 7 0 8." },
            { input: "2\n9 9\n1\n1", explanation: "99 + 1 = 100, printed as 0 0 1." },
        ],
        edge: ["1\n0\n1\n0"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const n1 = t[0];
            const a = t.slice(1, 1 + n1);
            const b = t.slice(2 + n1, 2 + n1 + t[1 + n1]);
            const out = [];
            for (let i = 0, carry = 0; i < a.length || i < b.length || carry; i++) {
                const sum = (a[i] || 0) + (b[i] || 0) + carry;
                out.push(sum % 10);
                carry = sum >= 10 ? 1 : 0;
            }
            return out.join(" ");
        },
        generate: (r, big) => {
            const number = (n) => {
                const digits = r.ints(n, 0, 9);
                if (r.chance(0.2)) digits.fill(9);
                digits[n - 1] = n === 1 ? digits[0] : r.int(1, 9);
                return `${n}\n${digits.join(" ")}`;
            };
            return `${number(big ? 10000 : r.int(1, 6))}\n${number(big ? r.int(1, 10000) : r.int(1, 6))}`;
        },
    },
    {
        title: "Reorder List",
        difficulty: "medium",
        tags: ["linked list", "two pointers"],
        description: `
Given a linked list L0 -> L1 -> ... -> Ln-1, reorder it to L0 -> Ln-1 -> L1 -> Ln-2 -> L2 -> ... by taking nodes alternately from the front and the back.

Try to do it in place: find the middle, reverse the second half and merge the two halves.

Input
The first line contains n. The second line contains the n values from head to tail.

Output
Print the values of the reordered list, separated by spaces.`,
        constraints: ["1 <= n <= 10^4", "1 <= value <= 1000"],
        examples: [
            { input: "4\n1 2 3 4", explanation: "Front, back, front, back: 1 4 2 3." },
            { input: "5\n1 2 3 4 5", explanation: "1 5 2 4 3." },
        ],
        edge: ["1\n9"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const values = t.slice(1, t[0] + 1);
            const out = [];
            for (let i = 0, j = values.length - 1; i <= j; i++, j--) {
                out.push(values[i]);
                if (i !== j) out.push(values[j]);
            }
            return out.join(" ");
        },
        generate: (r, big) => list(r, big ? 10000 : r.int(1, 10), 1, 1000),
    },
    {
        title: "Next Greater Element",
        difficulty: "medium",
        tags: ["stack", "arrays"],
        description: `
For each element of an array, find the first element to its right that is strictly greater. If there is none, use -1.

A monotonic stack solves this in O(n).

Input
The first line contains n. The second line contains n integers.

Output
Print n integers separated by spaces: the next greater element for each position.`,
        constraints: ["1 <= n <= 10^4", "0 <= ai <= 10^9"],
        examples: [
            { input: "4\n4 5 2 25", explanation: "4 -> 5, 5 -> 25, 2 -> 25, and nothing is greater than 25 to its right." },
            { input: "4\n13 7 6 12", explanation: "7 and 6 are followed by 12; 13 and 12 have nothing greater after them." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const n = t[0];
            const a = t.slice(1, n + 1);
            const answer = new Array(n).fill(-1);
            const stack = [];
            for (let i = 0; i < n; i++) {
                while (stack.length && a[stack[stack.length - 1]] < a[i]) answer[stack.pop()] = a[i];
                stack.push(i);
            }
            return answer.join(" ");
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 10);
            if (big && r.chance(0.5)) return `${n}\n${Array.from({ length: n }, (_, i) => 1e9 - i).join(" ")}`;
            return list(r, n, 0, big ? 1e9 : 20);
        },
    },
    {
        title: "Daily Temperatures",
        difficulty: "medium",
        tags: ["stack", "arrays"],
        description: `
Given the daily temperatures, for each day find how many days you have to wait until a warmer temperature. If no warmer day comes, the answer for that day is 0.

Input
The first line contains n. The second line contains n temperatures.

Output
Print n integers separated by spaces.`,
        constraints: ["1 <= n <= 10^4", "30 <= temperature <= 100"],
        examples: [
            { input: "8\n73 74 75 71 69 72 76 73", explanation: "For 75 the next warmer day is 76, four days later." },
            { input: "3\n30 60 90", explanation: "Each day is followed by a warmer one." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const n = t[0];
            const answer = new Array(n).fill(0);
            const stack = [];
            for (let i = 0; i < n; i++) {
                while (stack.length && t[1 + stack[stack.length - 1]] < t[1 + i]) {
                    const j = stack.pop();
                    answer[j] = i - j;
                }
                stack.push(i);
            }
            return answer.join(" ");
        },
        generate: (r, big) => list(r, big ? 10000 : r.int(1, 10), 30, 100),
    },
    {
        title: "Top K Frequent Elements",
        difficulty: "medium",
        tags: ["heaps", "hash table"],
        description: `
Given an array of n integers and an integer k, print the k values that occur most often. Order them by frequency, highest first; break ties by printing the smaller value first.

Input
The first line contains n and k. The second line contains n integers.

Output
Print k integers separated by spaces.`,
        constraints: ["1 <= n <= 10^4", "-10^4 <= ai <= 10^4", "1 <= k <= number of distinct values"],
        examples: [
            { input: "6 2\n1 1 1 2 2 3", explanation: "1 appears 3 times and 2 appears twice." },
            { input: "5 2\n4 4 6 6 5", explanation: "4 and 6 both appear twice; 4 is smaller so it comes first." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const [n, k] = t;
            const count = new Map();
            for (let i = 0; i < n; i++) count.set(t[2 + i], (count.get(t[2 + i]) || 0) + 1);
            return [...count.entries()]
                .sort((a, b) => b[1] - a[1] || a[0] - b[0])
                .slice(0, k)
                .map((e) => e[0])
                .join(" ");
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 12);
            const values = r.ints(n, -(big ? 10000 : 4), big ? r.pick([100, 10000]) : 4);
            const distinct = new Set(values).size;
            return `${n} ${r.int(1, Math.min(distinct, big ? 50 : distinct))}\n${values.join(" ")}`;
        },
    },
    {
        title: "Meeting Rooms II",
        difficulty: "medium",
        tags: ["heaps", "sorting"],
        description: `
Given n meetings, each with a start time s and an end time e, find the minimum number of rooms needed to hold all of them. A meeting occupies its room from s up to e; a meeting ending at time t and another starting at time t can share a room.

Input
The first line contains n. Each of the next n lines contains s and e.

Output
Print the minimum number of rooms.`,
        constraints: ["1 <= n <= 10^4", "0 <= s < e <= 10^6"],
        examples: [
            { input: "3\n0 30\n5 10\n15 20", explanation: "The meeting 0-30 overlaps both others, but 5-10 and 15-20 can share a room." },
            { input: "2\n7 10\n2 4", explanation: "The meetings do not overlap." },
        ],
        edge: ["2\n1 5\n5 10"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const n = t[0];
            const events = [];
            for (let i = 0; i < n; i++) {
                events.push([t[1 + 2 * i], 1]);
                events.push([t[2 + 2 * i], -1]);
            }
            events.sort((a, b) => a[0] - b[0] || a[1] - b[1]); // ends before starts at the same time
            let rooms = 0;
            let best = 0;
            for (const [, delta] of events) best = Math.max(best, (rooms += delta));
            return best;
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 8);
            const max = big ? 1e6 : 20;
            const lines = Array.from({ length: n }, () => {
                const s = r.int(0, max - 1);
                return `${s} ${r.int(s + 1, Math.min(max, s + (big ? 5000 : 8)))}`;
            });
            return `${n}\n${lines.join("\n")}`;
        },
    },
    {
        title: "Polygon Area",
        difficulty: "medium",
        tags: ["geometry", "math"],
        description: `
Given the n vertices of a simple polygon in order (clockwise or counterclockwise), find its area. To keep the answer an integer, print twice the area.

The shoelace formula gives twice the signed area as the sum of x[i] * y[i+1] - x[i+1] * y[i] over all edges.

Input
The first line contains n. Each of the next n lines contains the coordinates x and y of a vertex.

Output
Print twice the area of the polygon.`,
        constraints: ["3 <= n <= 10^4", "-10^4 <= x, y <= 10^4", "The polygon is simple (its edges do not cross) and has positive area"],
        examples: [
            { input: "4\n0 0\n4 0\n4 3\n0 3", explanation: "A 4 x 3 rectangle has area 12, so print 24." },
            { input: "3\n0 0\n0 1\n1 0", explanation: "The triangle has area 0.5, so print 1." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const n = t[0];
            let twice = 0;
            for (let i = 0; i < n; i++) {
                const j = (i + 1) % n;
                twice += t[1 + 2 * i] * t[2 + 2 * j] - t[1 + 2 * j] * t[2 + 2 * i];
            }
            return Math.abs(twice);
        },
        generate: (r, big) => {
            // x-monotone polygon: points above the line between the extreme points form the upper chain
            const n = big ? 10000 : r.int(3, 8);
            const range = big ? 10000 : 10;
            const xs = r.shuffle(Array.from({ length: 2 * range + 1 }, (_, i) => i - range)).slice(0, n).sort((a, b) => a - b);
            const points = xs.map((x) => [x, r.int(-range, range)]);
            const [first, last] = [points[0], points[n - 1]];
            const cross = ([x, y]) => (last[0] - first[0]) * (y - first[1]) - (last[1] - first[1]) * (x - first[0]);
            const middle = points.slice(1, -1);
            // nudge points off the base line so the chains never touch and the area is positive
            for (const p of middle) if (cross(p) === 0) p[1] += p[1] < range ? 1 : -1;
            const upper = middle.filter((p) => cross(p) > 0);
            const lower = middle.filter((p) => cross(p) < 0).reverse();
            let polygon = [first, ...upper, last, ...lower];
            if (r.chance(0.5)) polygon = polygon.reverse();
            return `${n}\n${polygon.map((q) => q.join(" ")).join("\n")}`;
        },
    },
    {
        title: "Merge K Sorted Lists",
        difficulty: "hard",
        tags: ["linked list", "heaps"],
        description: `
You are given k sorted linked lists. Merge them into one sorted list and print its values.

Merging the lists one by one is slow when k is large. A min-heap holding the current head of each list merges everything in O(N log k).

Input
The first line contains k. Each of the next k lines describes one list: first its length, then its values in non-decreasing order. A list may be empty (length 0).

Output
Print the merged list's values separated by spaces.`,
        constraints: ["1 <= k <= 10^4", "The total number of values N is between 1 and 10^4", "-10^4 <= value <= 10^4"],
        examples: [
            { input: "3\n3 1 4 5\n3 1 3 4\n2 2 6", explanation: "Merging 1 4 5, 1 3 4 and 2 6." },
            { input: "2\n0\n1 7", explanation: "The first list is empty." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const values = [];
            for (let i = 0, pos = 1; i < t[0]; i++) {
                const len = t[pos];
                for (let j = 1; j <= len; j++) values.push(t[pos + j]);
                pos += len + 1;
            }
            return values.sort((a, b) => a - b).join(" ");
        },
        generate: (r, big) => {
            const k = big ? r.pick([100, 5000]) : r.int(1, 5);
            const total = big ? 10000 : r.int(1, 12);
            const lengths = new Array(k).fill(0);
            for (let i = 0; i < total; i++) lengths[r.int(0, k - 1)]++;
            const lines = lengths.map((len) => [len, ...sortedValues(r, len, -10000, big ? 10000 : -9990)].join(" "));
            return `${k}\n${lines.join("\n")}`;
        },
    },
    {
        title: "Largest Rectangle in Histogram",
        difficulty: "hard",
        tags: ["stack", "arrays"],
        description: `
A histogram has n bars of width 1 with the given heights. Find the area of the largest rectangle that fits entirely inside the histogram.

Input
The first line contains n. The second line contains the n heights.

Output
Print the largest area.`,
        constraints: ["1 <= n <= 3 * 10^4", "0 <= height <= 10^4"],
        examples: [
            { input: "6\n2 1 5 6 2 3", explanation: "The bars of height 5 and 6 form a rectangle of height 5 and width 2, area 10." },
            { input: "2\n2 4", explanation: "The single bar of height 4 gives area 4." },
        ],
        edge: ["1\n0"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const n = t[0];
            const h = (i) => (i < n ? t[1 + i] : 0);
            const stack = [];
            let best = 0;
            for (let i = 0; i <= n; i++) {
                while (stack.length && h(stack[stack.length - 1]) >= h(i)) {
                    const height = h(stack.pop());
                    const left = stack.length ? stack[stack.length - 1] + 1 : 0;
                    best = Math.max(best, height * (i - left));
                }
                stack.push(i);
            }
            return best;
        },
        generate: (r, big) => {
            const n = big ? 30000 : r.int(1, 10);
            if (big && r.chance(0.5)) return `${n}\n${Array.from({ length: n }, (_, i) => Math.min(10000, i + 1)).join(" ")}`;
            return list(r, n, 0, big ? 10000 : 8);
        },
    },
    {
        title: "Sliding Window Maximum",
        difficulty: "hard",
        tags: ["queue", "sliding window"],
        description: `
Given an array of n integers and a window size k, slide the window from the left end of the array to the right end one position at a time. Print the maximum inside the window at every position.

A double-ended queue that keeps candidate indices in decreasing order of value gives O(n) overall.

Input
The first line contains n and k. The second line contains n integers.

Output
Print n - k + 1 integers separated by spaces.`,
        constraints: ["1 <= k <= n <= 10^4", "-10^4 <= ai <= 10^4"],
        examples: [
            { input: "8 3\n1 3 -1 -3 5 3 6 7", explanation: "Windows: [1 3 -1], [3 -1 -3], [-1 -3 5], [-3 5 3], [5 3 6], [3 6 7]." },
            { input: "1 1\n1", explanation: "One window containing 1." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const [n, k] = t;
            const a = t.slice(2, 2 + n);
            const deque = new Array(n);
            let head = 0;
            let tail = 0;
            const out = [];
            for (let i = 0; i < n; i++) {
                while (tail > head && a[deque[tail - 1]] <= a[i]) tail--;
                deque[tail++] = i;
                if (deque[head] <= i - k) head++;
                if (i >= k - 1) out.push(a[deque[head]]);
            }
            return out.join(" ");
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 10);
            const k = big ? r.pick([2, 1000, 5000]) : r.int(1, n);
            return `${n} ${k}\n${r.ints(n, -10000, 10000).join(" ")}`;
        },
    },
    {
        title: "Running Median",
        difficulty: "hard",
        tags: ["heaps"],
        description: `
Numbers arrive one at a time. After each new number, print the median of all numbers seen so far. When there is an even count of numbers, print the lower of the two middle values (the (i/2)-th smallest of i numbers).

Keep a max-heap for the lower half and a min-heap for the upper half.

Input
The first line contains n. The second line contains the n numbers in arrival order.

Output
Print n integers separated by spaces: the median after each arrival.`,
        constraints: ["1 <= n <= 10^4", "-10^5 <= value <= 10^5"],
        examples: [
            { input: "5\n5 15 1 3 8", explanation: "Sorted prefixes: [5], [5 15], [1 5 15], [1 3 5 15], [1 3 5 8 15]." },
            { input: "2\n2 2", explanation: "Both medians are 2." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const sorted = [];
            const out = [];
            for (let i = 1; i <= t[0]; i++) {
                let lo = 0;
                let hi = sorted.length;
                while (lo < hi) {
                    const mid = (lo + hi) >> 1;
                    if (sorted[mid] < t[i]) lo = mid + 1;
                    else hi = mid;
                }
                sorted.splice(lo, 0, t[i]);
                out.push(sorted[(sorted.length - 1) >> 1]);
            }
            return out.join(" ");
        },
        generate: (r, big) => list(r, big ? 10000 : r.int(1, 10), -100000, big ? 100000 : -99990),
    },
    {
        title: "Max Points on a Line",
        difficulty: "hard",
        tags: ["geometry", "hash table", "math"],
        description: `
Given n distinct points on a plane, find the maximum number of them that lie on one straight line.

Compare slopes as reduced fractions (dy / dx divided by their gcd) rather than floating-point numbers to avoid precision errors.

Input
The first line contains n. Each of the next n lines contains the coordinates x and y of a point.

Output
Print the maximum number of points on one line.`,
        constraints: ["1 <= n <= 300", "-10^4 <= x, y <= 10^4", "All points are distinct"],
        examples: [
            { input: "3\n1 1\n2 2\n3 3", explanation: "All three points lie on y = x." },
            { input: "6\n1 1\n3 2\n5 3\n4 1\n2 3\n1 4", explanation: "(3,2), (4,1), (2,3) and (1,4) lie on x + y = 5." },
        ],
        edge: ["1\n0 0"],
        solve: (input) => {
            const t = input.trim().split(/\s+/).map(Number);
            const n = t[0];
            const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
            let best = 1;
            for (let i = 0; i < n; i++) {
                const slopes = new Map();
                for (let j = i + 1; j < n; j++) {
                    let dx = t[1 + 2 * j] - t[1 + 2 * i];
                    let dy = t[2 + 2 * j] - t[2 + 2 * i];
                    const g = gcd(dx, dy);
                    dx /= g;
                    dy /= g;
                    if (dx < 0 || (dx === 0 && dy < 0)) {
                        dx = -dx;
                        dy = -dy;
                    }
                    const key = `${dx}/${dy}`;
                    const count = (slopes.get(key) || 1) + 1;
                    slopes.set(key, count);
                    best = Math.max(best, count);
                }
            }
            return best;
        },
        generate: (r, big) => {
            const n = big ? 300 : r.int(1, 8);
            const range = big ? 10000 : 5;
            const points = new Map();
            const add = (x, y) => {
                if (points.size < n && Math.abs(x) <= range && Math.abs(y) <= range) points.set(`${x} ${y}`, true);
            };
            if (n > 2) {
                // plant some collinear points so the answer is not always 2
                const [x0, y0] = [r.int(-range, range), r.int(-range, range)];
                const [dx, dy] = [r.int(-3, 3), r.int(-3, 3)];
                if (dx || dy) for (let s = -range; s <= range && points.size < n / 2; s++) add(x0 + s * dx, y0 + s * dy);
            }
            while (points.size < n) add(r.int(-range, range), r.int(-range, range));
            const lines = r.shuffle([...points.keys()]);
            return `${n}\n${lines.join("\n")}`;
        },
    },
    {
        title: "Basic Calculator",
        difficulty: "hard",
        tags: ["stack", "strings"],
        description: `
Evaluate an expression containing non-negative integers, '+', '-', parentheses and spaces. A '-' can also be a unary minus, as in "-(2 + 3)" or "1 - (-2)". Do not use a built-in eval function.

Input
A single line containing a valid expression.

Output
Print the value of the expression.`,
        constraints: ["1 <= length of the expression <= 10^4", "Every number in the expression is between 0 and 1000", "The result and every intermediate value fit in a 32-bit signed integer"],
        examples: [
            { input: "1 + 1", explanation: "1 + 1 = 2." },
            { input: "(1+(4+5+2)-3)-(6+8)", explanation: "(1 + 11 - 3) - 14 = -5." },
        ],
        edge: ["-(2 + 3)", "1 - (-2)", "42"],
        solve: (input) => {
            const s = input.trim();
            const stack = [];
            let result = 0;
            let sign = 1;
            let num = 0;
            for (const ch of s) {
                if (ch >= "0" && ch <= "9") num = num * 10 + Number(ch);
                else if (ch === "+" || ch === "-") {
                    result += sign * num;
                    num = 0;
                    sign = ch === "+" ? 1 : -1;
                } else if (ch === "(") {
                    stack.push(result, sign);
                    result = 0;
                    sign = 1;
                } else if (ch === ")") {
                    result += sign * num;
                    num = 0;
                    result = result * stack.pop() + stack.pop();
                }
            }
            return result + sign * num + 0;
        },
        generate: (r, big) => {
            const sp = () => (r.chance(0.3) ? " " : "");
            const expr = (depth, budget) => {
                let out = r.chance(0.15) ? "-" : "";
                const terms = r.int(1, budget);
                for (let i = 0; i < terms; i++) {
                    if (i) out += sp() + r.pick(["+", "-"]) + sp();
                    out += depth > 0 && r.chance(0.4) ? `(${expr(depth - 1, budget)})` : String(r.int(0, 1000));
                }
                return out;
            };
            for (;;) {
                const e = expr(big ? 6 : 2, big ? 10 : 3);
                if (e.length <= 10000 && (!big || e.length > 2000)) return e;
            }
        },
    },
];
