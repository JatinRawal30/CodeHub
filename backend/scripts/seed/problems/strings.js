// String, sliding window and trie problems. Format of each entry: see scripts/seedProblems.js.
// solve(input) must be self-contained (its source becomes the stored reference solution).

module.exports = [
    {
        title: "Reverse Words in a String",
        difficulty: "easy",
        tags: ["strings"],
        description: `
Given a line of text, reverse the order of its words. A word is a sequence of non-space characters. The line may have leading or trailing spaces, or several spaces between words.

Input
A single line of text containing at least one word.

Output
Print the words in reverse order, separated by single spaces, with no leading or trailing spaces.`,
        constraints: ["1 <= length of the line <= 10^4", "The line contains letters, digits and spaces"],
        examples: [
            { input: "the sky is blue", explanation: "The four words in reverse order." },
            { input: "  hello   world  ", explanation: "Extra spaces are dropped from the output." },
        ],
        solve: (input) => input.trim().split(/\s+/).reverse().join(" "),
        generate: (r, big) => {
            const count = big ? 1500 : r.int(1, 6);
            const words = Array.from({ length: count }, () => r.str(r.int(1, 5), "abcdefghijklmnopqrstuvwxyzABC0123456789"));
            const gap = () => " ".repeat(r.chance(0.3) ? r.int(2, 3) : 1);
            return (r.chance(0.3) ? "  " : "") + words.map((w, i) => (i ? gap() : "") + w).join("") + (r.chance(0.3) ? "  " : "");
        },
    },
    {
        title: "First Unique Character",
        difficulty: "easy",
        tags: ["strings", "hash table"],
        description: `
Given a string s of lowercase English letters, find the first character that appears exactly once and print its 0-based index. If no such character exists, print -1.

Input
A single line containing s.

Output
Print the index of the first non-repeating character, or -1.`,
        constraints: ["1 <= |s| <= 10^5", "s consists of lowercase English letters"],
        examples: [
            { input: "leetcode", explanation: "'l' at index 0 appears only once." },
            { input: "aabb", explanation: "Every character repeats." },
        ],
        edge: ["z"],
        solve: (input) => {
            const s = input.trim();
            const count = {};
            for (const ch of s) count[ch] = (count[ch] || 0) + 1;
            for (let i = 0; i < s.length; i++) if (count[s[i]] === 1) return i;
            return -1;
        },
        generate: (r, big) => {
            if (big) {
                const body = r.str(100000 - 1, "abcdefghijklmnopqrstuvwxy");
                return r.chance(0.5) ? body + body.slice(-1) : body.slice(0, 50000) + "z" + body.slice(50000);
            }
            return r.str(r.int(1, 12), r.pick(["ab", "abc", "abcdef"]));
        },
    },
    {
        title: "Longest Common Prefix",
        difficulty: "easy",
        tags: ["strings"],
        description: `
Given n strings, find the longest string that is a prefix of all of them.

Input
The first line contains n. Each of the next n lines contains one string of lowercase English letters.

Output
Print the longest common prefix. If it is empty, print -1.`,
        constraints: ["1 <= n <= 200", "1 <= length of each string <= 200"],
        examples: [
            { input: "3\nflower\nflow\nflight", explanation: "All three strings start with \"fl\"." },
            { input: "3\ndog\nracecar\ncar", explanation: "The strings share no common prefix." },
        ],
        edge: ["1\nalone"],
        solve: (input) => {
            const t = input.trim().split(/\s+/);
            let prefix = t[1];
            for (let i = 2; i <= Number(t[0]); i++) {
                while (!t[i].startsWith(prefix)) prefix = prefix.slice(0, -1);
            }
            return prefix || -1;
        },
        generate: (r, big) => {
            const n = big ? 200 : r.int(1, 6);
            const base = r.str(big ? 150 : r.int(0, 5), "ab");
            const words = Array.from({ length: n }, () => base + r.str(r.int(base ? 0 : 1, big ? 50 : 4), "abc"));
            return `${n}\n${words.join("\n")}`;
        },
    },
    {
        title: "Is Subsequence",
        difficulty: "easy",
        tags: ["strings", "two pointers"],
        description: `
Given two strings s and t, decide whether s is a subsequence of t. A subsequence is formed by deleting zero or more characters from t without changing the order of the rest.

Input
The first line contains s. The second line contains t.

Output
Print YES if s is a subsequence of t, otherwise print NO.`,
        constraints: ["1 <= |s| <= 100", "1 <= |t| <= 10^5", "Both strings consist of lowercase English letters"],
        examples: [
            { input: "abc\nahbgdc", explanation: "a, b and c appear in t in this order." },
            { input: "axc\nahbgdc", explanation: "There is no x in t." },
        ],
        edge: ["aaa\naa"],
        solve: (input) => {
            const [s, t] = input.trim().split(/\s+/);
            let i = 0;
            for (let j = 0; j < t.length && i < s.length; j++) if (s[i] === t[j]) i++;
            return i === s.length ? "YES" : "NO";
        },
        generate: (r, big) => {
            const t = r.str(big ? 100000 : r.int(1, 15), "abcd");
            let s = "";
            for (const ch of t) if (s.length < 100 && r.chance(big ? 0.001 : 0.4)) s += ch;
            if (!s || r.chance(0.4)) s = r.str(r.int(1, big ? 100 : 4), "abcde");
            return `${s}\n${t}`;
        },
    },
    {
        title: "Run-Length Encoding",
        difficulty: "easy",
        tags: ["strings"],
        description: `
Compress a string with run-length encoding: replace every maximal run of the same character with the character followed by the length of the run.

For example, "aaabccddd" becomes "a3b1c2d3".

Input
A single line containing a string of lowercase English letters.

Output
Print the encoded string.`,
        constraints: ["1 <= |s| <= 10^4", "s consists of lowercase English letters"],
        examples: [
            { input: "aaabccddd", explanation: "Runs: aaa, b, cc, ddd." },
            { input: "abc", explanation: "Every run has length 1." },
        ],
        edge: ["zzzzzzzzzzzz"],
        solve: (input) => {
            const s = input.trim();
            let out = "";
            for (let i = 0; i < s.length; ) {
                let j = i;
                while (j < s.length && s[j] === s[i]) j++;
                out += s[i] + (j - i);
                i = j;
            }
            return out;
        },
        generate: (r, big) => {
            let s = "";
            const target = big ? 10000 : r.int(1, 15);
            while (s.length < target) s += r.str(1, "abc").repeat(r.int(1, big ? 30 : 4));
            return s.slice(0, target);
        },
    },
    {
        title: "Isomorphic Strings",
        difficulty: "easy",
        tags: ["strings", "hash table"],
        description: `
Two strings s and t of the same length are isomorphic if the characters of s can be replaced to get t: every occurrence of a character is replaced by the same character, and no two different characters map to the same character.

Input
The first line contains s. The second line contains t.

Output
Print YES if s and t are isomorphic, otherwise print NO.`,
        constraints: ["1 <= |s| = |t| <= 10^4", "Both strings consist of lowercase English letters"],
        examples: [
            { input: "egg\nadd", explanation: "e -> a and g -> d." },
            { input: "badc\nbaba", explanation: "b and d would both have to map to b." },
        ],
        edge: ["foo\nbar", "paper\ntitle"],
        solve: (input) => {
            const [s, t] = input.trim().split(/\s+/);
            const forward = {};
            const backward = {};
            for (let i = 0; i < s.length; i++) {
                if ((forward[s[i]] ?? t[i]) !== t[i] || (backward[t[i]] ?? s[i]) !== s[i]) return "NO";
                forward[s[i]] = t[i];
                backward[t[i]] = s[i];
            }
            return "YES";
        },
        generate: (r, big) => {
            const s = r.str(big ? 10000 : r.int(1, 10), "abcdefgh");
            const letters = r.shuffle([..."abcdefghijklmnopqrstuvwxyz"]);
            let t = [...s].map((ch) => letters[ch.charCodeAt(0) - 97]);
            if (r.chance(0.5)) t[r.int(0, t.length - 1)] = r.pick("abcdefgh");
            return `${s}\n${t.join("")}`;
        },
    },
    {
        title: "Ransom Note",
        difficulty: "easy",
        tags: ["strings", "hash table"],
        description: `
Given two strings note and magazine, decide whether note can be built from the letters of magazine. Each letter in magazine can be used only once.

Input
The first line contains note. The second line contains magazine.

Output
Print YES if note can be built, otherwise print NO.`,
        constraints: ["1 <= |note|, |magazine| <= 10^5", "Both strings consist of lowercase English letters"],
        examples: [
            { input: "aa\naab", explanation: "magazine has two a's." },
            { input: "aa\nab", explanation: "magazine has only one a." },
        ],
        solve: (input) => {
            const [note, magazine] = input.trim().split(/\s+/);
            const count = {};
            for (const ch of magazine) count[ch] = (count[ch] || 0) + 1;
            for (const ch of note) {
                if (!count[ch]) return "NO";
                count[ch]--;
            }
            return "YES";
        },
        generate: (r, big) => {
            const magazine = r.str(big ? 60000 : r.int(1, 12), "abcde");
            let note = r.shuffle([...magazine]).slice(0, big ? 40000 : r.int(1, magazine.length)).join("");
            if (r.chance(0.5)) note += r.str(1, "abcdef");
            return `${note}\n${magazine}`;
        },
    },
    {
        title: "Group Anagrams",
        difficulty: "medium",
        tags: ["strings", "hash table", "sorting"],
        description: `
Two words are anagrams if one can be rearranged into the other. Given n words, group them so that each group contains words that are all anagrams of each other.

Input
The first line contains n. The second line contains n words of lowercase English letters, separated by spaces.

Output
Print two integers: the number of groups and the size of the largest group.`,
        constraints: ["1 <= n <= 10^4", "1 <= length of each word <= 10"],
        examples: [
            { input: "6\neat tea tan ate nat bat", explanation: "Groups: {eat, tea, ate}, {tan, nat}, {bat}. Three groups; the largest has 3 words." },
            { input: "1\na", explanation: "One group with one word." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/);
            const groups = new Map();
            for (let i = 1; i <= Number(t[0]); i++) {
                const key = [...t[i]].sort().join("");
                groups.set(key, (groups.get(key) || 0) + 1);
            }
            return `${groups.size} ${Math.max(...groups.values())}`;
        },
        generate: (r, big) => {
            const n = big ? 10000 : r.int(1, 10);
            const bases = Array.from({ length: big ? 800 : r.int(1, 4) }, () => r.str(r.int(1, big ? 10 : 4), "abcde"));
            const words = Array.from({ length: n }, () => r.shuffle([...r.pick(bases)]).join(""));
            return `${n}\n${words.join(" ")}`;
        },
    },
    {
        title: "Longest Palindromic Substring",
        difficulty: "medium",
        tags: ["strings", "dynamic programming"],
        description: `
Given a string s, find its longest substring that reads the same forwards and backwards. If there are several of the same maximum length, print the one that starts earliest.

Input
A single line containing s.

Output
Print the longest palindromic substring.`,
        constraints: ["1 <= |s| <= 1000", "s consists of lowercase English letters"],
        examples: [
            { input: "babad", explanation: "\"bab\" and \"aba\" both have length 3; \"bab\" starts earlier." },
            { input: "cbbd", explanation: "\"bb\" is the longest palindrome." },
        ],
        edge: ["a", "abcde"],
        solve: (input) => {
            const s = input.trim();
            let bestStart = 0;
            let bestLen = 1;
            for (let center = 0; center < s.length; center++) {
                for (const [l0, r0] of [[center, center], [center, center + 1]]) {
                    let l = l0;
                    let r = r0;
                    while (l >= 0 && r < s.length && s[l] === s[r]) {
                        l--;
                        r++;
                    }
                    const len = r - l - 1;
                    const start = l + 1;
                    if (len > bestLen || (len === bestLen && start < bestStart)) {
                        bestLen = len;
                        bestStart = start;
                    }
                }
            }
            return s.slice(bestStart, bestStart + bestLen);
        },
        generate: (r, big) => {
            if (big && r.chance(0.5)) return r.str(1000, "a");
            const s = r.str(big ? 1000 : r.int(1, 12), r.pick(["ab", "abc"]));
            const half = r.str(big ? 200 : r.int(1, 3), "abc");
            const at = r.int(0, s.length);
            return (s.slice(0, at) + half + [...half].reverse().join("") + s.slice(at)).slice(0, 1000);
        },
    },
    {
        title: "Minimum Window Substring",
        difficulty: "hard",
        tags: ["strings", "sliding window", "hash table"],
        description: `
Given two strings s and t, find the shortest substring of s that contains every character of t, including duplicates. If there are several shortest windows, print the one that starts earliest. If there is none, print -1.

Input
The first line contains s. The second line contains t.

Output
Print the minimum window, or -1 if it does not exist.`,
        constraints: ["1 <= |s|, |t| <= 10^5", "s and t consist of English letters (case-sensitive)"],
        examples: [
            { input: "ADOBECODEBANC\nABC", explanation: "\"BANC\" contains A, B and C and no shorter window does." },
            { input: "a\naa", explanation: "t needs two a's but s has only one." },
        ],
        edge: ["a\na", "aaflslflsldkalskaaa\naaa"],
        solve: (input) => {
            const [s, t] = input.trim().split(/\s+/);
            const need = new Map();
            for (const ch of t) need.set(ch, (need.get(ch) || 0) + 1);
            let missing = t.length;
            let bestStart = -1;
            let bestLen = Infinity;
            for (let left = 0, right = 0; right < s.length; right++) {
                const ch = s[right];
                if (need.has(ch)) {
                    if (need.get(ch) > 0) missing--;
                    need.set(ch, need.get(ch) - 1);
                }
                while (missing === 0) {
                    if (right - left + 1 < bestLen) {
                        bestLen = right - left + 1;
                        bestStart = left;
                    }
                    const out = s[left++];
                    if (need.has(out)) {
                        need.set(out, need.get(out) + 1);
                        if (need.get(out) > 0) missing++;
                    }
                }
            }
            return bestStart === -1 ? -1 : s.slice(bestStart, bestStart + bestLen);
        },
        generate: (r, big) => {
            const alphabet = r.pick(["abc", "abcdef", "aAbBcC"]);
            const s = r.str(big ? 100000 : r.int(1, 15), alphabet);
            const t = r.str(big ? r.int(3, 30) : r.int(1, 4), alphabet + (r.chance(0.2) ? "z" : ""));
            return `${s}\n${t}`;
        },
    },
    {
        title: "Longest Repeating Character Replacement",
        difficulty: "medium",
        tags: ["strings", "sliding window"],
        description: `
Given a string s of uppercase English letters and an integer k, you may change at most k characters of s to any other uppercase letter. Find the length of the longest substring that contains only one repeated letter after the changes.

Input
The first line contains s. The second line contains k.

Output
Print the maximum possible length.`,
        constraints: ["1 <= |s| <= 10^5", "0 <= k <= |s|", "s consists of uppercase English letters"],
        examples: [
            { input: "ABAB\n2", explanation: "Change both A's to B (or both B's to A) to get a run of length 4." },
            { input: "AABABBA\n1", explanation: "Change the middle A to get \"BBBB\" of length 4." },
        ],
        edge: ["A\n0"],
        solve: (input) => {
            const [s, kText] = input.trim().split(/\s+/);
            const k = Number(kText);
            let best = 0;
            for (let c = 65; c <= 90; c++) {
                const letter = String.fromCharCode(c);
                let others = 0;
                for (let left = 0, right = 0; right < s.length; right++) {
                    if (s[right] !== letter) others++;
                    while (others > k) if (s[left++] !== letter) others--;
                    best = Math.max(best, right - left + 1);
                }
            }
            return best;
        },
        generate: (r, big) => {
            const s = r.str(big ? 100000 : r.int(1, 12), r.pick(["AB", "ABC", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"]));
            return `${s}\n${r.int(0, big ? 500 : s.length)}`;
        },
    },
    {
        title: "Permutation in String",
        difficulty: "medium",
        tags: ["strings", "sliding window", "hash table"],
        description: `
Given two strings s1 and s2, decide whether s2 contains a permutation of s1 as a substring. In other words, is some contiguous block of s2 an anagram of s1?

Input
The first line contains s1. The second line contains s2.

Output
Print YES if such a substring exists, otherwise print NO.`,
        constraints: ["1 <= |s1|, |s2| <= 10^5", "Both strings consist of lowercase English letters"],
        examples: [
            { input: "ab\neidbaooo", explanation: "s2 contains \"ba\", which is a permutation of \"ab\"." },
            { input: "ab\neidboaoo", explanation: "No two adjacent characters of s2 are {a, b}." },
        ],
        edge: ["abc\nab"],
        solve: (input) => {
            const [a, b] = input.trim().split(/\s+/);
            if (a.length > b.length) return "NO";
            const diff = new Array(26).fill(0);
            for (const ch of a) diff[ch.charCodeAt(0) - 97]++;
            let nonZero = diff.filter((x) => x !== 0).length;
            const change = (ch, delta) => {
                const i = ch.charCodeAt(0) - 97;
                if (diff[i] === 0) nonZero++;
                diff[i] += delta;
                if (diff[i] === 0) nonZero--;
            };
            for (let i = 0; i < b.length; i++) {
                change(b[i], -1);
                if (i >= a.length) change(b[i - a.length], 1);
                if (i >= a.length - 1 && nonZero === 0) return "YES";
            }
            return "NO";
        },
        generate: (r, big) => {
            const alphabet = r.pick(["abc", "abcd"]);
            const s1 = r.str(big ? r.int(5, 50) : r.int(1, 4), alphabet);
            let s2 = r.str(big ? 99000 : r.int(1, 12), alphabet);
            if (r.chance(0.5)) {
                const at = r.int(0, s2.length);
                s2 = s2.slice(0, at) + r.shuffle([...s1]).join("") + s2.slice(at);
            }
            return `${s1}\n${s2}`;
        },
    },
    {
        title: "Decode String",
        difficulty: "medium",
        tags: ["strings", "stack", "recursion"],
        description: `
An encoded string uses the rule k[text]: the text inside the square brackets is repeated exactly k times. Encodings can be nested. Decode the string.

For example, "3[a]2[bc]" decodes to "aaabcbc" and "3[a2[c]]" decodes to "accaccacc".

Input
A single line containing a valid encoded string. It contains lowercase letters, digits and square brackets, and digits only appear as repeat counts.

Output
Print the decoded string.`,
        constraints: ["1 <= length of the encoded string <= 1000", "1 <= k <= 300", "The decoded string has at most 10^4 characters"],
        examples: [
            { input: "3[a]2[bc]", explanation: "aaa followed by bcbc." },
            { input: "2[abc]3[cd]ef", explanation: "abcabc, then cdcdcd, then ef." },
        ],
        edge: ["abc", "10[a]", "3[a2[c]]"],
        solve: (input) => {
            const s = input.trim();
            const stack = [];
            let current = "";
            let k = 0;
            for (const ch of s) {
                if (ch >= "0" && ch <= "9") k = k * 10 + Number(ch);
                else if (ch === "[") {
                    stack.push([current, k]);
                    current = "";
                    k = 0;
                } else if (ch === "]") {
                    const [before, times] = stack.pop();
                    current = before + current.repeat(times);
                } else current += ch;
            }
            return current;
        },
        generate: (r, big) => {
            // returns [encoded, decodedLength]
            const build = (depth) => {
                let encoded = "";
                let length = 0;
                for (let parts = r.int(1, 3); parts > 0; parts--) {
                    if (depth > 0 && r.chance(0.6)) {
                        const k = r.chance(0.2) ? r.int(10, 30) : r.int(1, 9);
                        const [inner, innerLength] = build(depth - 1);
                        encoded += `${k}[${inner}]`;
                        length += k * innerLength;
                    } else {
                        const letters = r.str(r.int(1, 3), "abcxyz");
                        encoded += letters;
                        length += letters.length;
                    }
                }
                return [encoded, length];
            };
            for (;;) {
                const [encoded, length] = build(big ? 4 : 2);
                if (length <= 10000 && encoded.length <= 1000 && (!big || length > 500)) return encoded;
            }
        },
    },
    {
        title: "Count Words With Prefix",
        difficulty: "medium",
        tags: ["tries", "strings"],
        description: `
You are given a dictionary of n words and q query strings. For each query, count how many dictionary words start with that query as a prefix. Duplicate words in the dictionary count separately.

A trie (prefix tree) answers each query in time proportional to the query length.

Input
The first line contains n. The second line contains the n words separated by spaces.
The third line contains q. The fourth line contains the q queries separated by spaces.

Output
Print q integers, one per line: the answer to each query in order.`,
        constraints: ["1 <= n, q <= 5000", "1 <= length of each word and query <= 20", "All strings consist of lowercase English letters"],
        examples: [
            { input: "4\napple app apply ape\n3\nap app b", explanation: "All four start with \"ap\"; apple, app and apply start with \"app\"; none start with \"b\"." },
            { input: "2\ncat cat\n1\ncat", explanation: "Both copies of \"cat\" count." },
        ],
        solve: (input) => {
            const t = input.trim().split(/\s+/);
            const n = Number(t[0]);
            const root = { count: 0, next: {} };
            for (let i = 1; i <= n; i++) {
                let node = root;
                for (const ch of t[i]) {
                    node = node.next[ch] || (node.next[ch] = { count: 0, next: {} });
                    node.count++;
                }
            }
            const q = Number(t[n + 1]);
            const out = [];
            for (let i = 0; i < q; i++) {
                let node = root;
                for (const ch of t[n + 2 + i]) {
                    node = node && node.next[ch];
                }
                out.push(node ? node.count : 0);
            }
            return out.join("\n");
        },
        generate: (r, big) => {
            const n = big ? 5000 : r.int(1, 8);
            const q = big ? 5000 : r.int(1, 6);
            const alphabet = big ? "abcd" : "ab";
            const words = Array.from({ length: n }, () => r.str(r.int(1, big ? 20 : 4), alphabet));
            const queries = Array.from({ length: q }, () => {
                if (r.chance(0.7)) {
                    const w = r.pick(words);
                    return w.slice(0, r.int(1, w.length));
                }
                return r.str(r.int(1, 5), alphabet + "e");
            });
            return `${n}\n${words.join(" ")}\n${q}\n${queries.join(" ")}`;
        },
    },
    {
        title: "Longest Word Built Letter by Letter",
        difficulty: "medium",
        tags: ["tries", "strings", "hash table"],
        description: `
Given a dictionary of n words, find the longest word that can be built one letter at a time: every prefix of the word (of length 1, 2, ..., up to the full word) must also be in the dictionary.

If several words have the maximum length, print the lexicographically smallest one. If no word can be built, print -1.

Input
The first line contains n. The second line contains n words separated by spaces.

Output
Print the answer word, or -1.`,
        constraints: ["1 <= n <= 10^4", "1 <= length of each word <= 30", "Words consist of lowercase English letters"],
        examples: [
            { input: "5\nw wo wor worl world", explanation: "\"world\" is built as w, wo, wor, worl, world." },
            { input: "7\na banana app appl ap apply apple", explanation: "\"apple\" and \"apply\" can both be built; \"apple\" is lexicographically smaller." },
        ],
        edge: ["2\nbc cd"],
        solve: (input) => {
            const t = input.trim().split(/\s+/);
            const words = t.slice(1, Number(t[0]) + 1);
            const set = new Set(words);
            let best = "";
            for (const w of set) {
                let ok = true;
                for (let len = 1; len < w.length && ok; len++) ok = set.has(w.slice(0, len));
                if (ok && (w.length > best.length || (w.length === best.length && w < best))) best = w;
            }
            return best || -1;
        },
        generate: (r, big) => {
            const words = [];
            const target = big ? 10000 : r.int(1, 10);
            while (words.length < target) {
                const w = r.str(r.int(1, big ? 30 : 5), "abc");
                const keep = r.int(0, w.length);
                for (let len = 1; len <= keep && words.length < target; len++) words.push(w.slice(0, len));
                if (words.length < target) words.push(w);
            }
            return `${words.length}\n${r.shuffle(words).join(" ")}`;
        },
    },
    {
        title: "Count Pattern Occurrences",
        difficulty: "hard",
        tags: ["strings"],
        description: `
Given a text and a pattern, count how many times the pattern occurs in the text. Occurrences may overlap.

Checking every position character by character can take |text| * |pattern| steps, which is too slow for the largest tests. Use a linear-time algorithm such as KMP or the Z-function.

Input
The first line contains the text. The second line contains the pattern.

Output
Print the number of occurrences.`,
        constraints: ["1 <= |text|, |pattern| <= 10^5", "Both strings consist of lowercase English letters"],
        examples: [
            { input: "abababa\naba", explanation: "\"aba\" occurs at positions 0, 2 and 4." },
            { input: "hello\nworld", explanation: "The pattern never occurs." },
        ],
        edge: ["a\naa"],
        solve: (input) => {
            const [text, pattern] = input.trim().split(/\s+/);
            const fail = new Array(pattern.length).fill(0);
            for (let i = 1, k = 0; i < pattern.length; i++) {
                while (k > 0 && pattern[i] !== pattern[k]) k = fail[k - 1];
                if (pattern[i] === pattern[k]) k++;
                fail[i] = k;
            }
            let count = 0;
            for (let i = 0, k = 0; i < text.length; i++) {
                while (k > 0 && text[i] !== pattern[k]) k = fail[k - 1];
                if (text[i] === pattern[k]) k++;
                if (k === pattern.length) {
                    count++;
                    k = fail[k - 1];
                }
            }
            return count;
        },
        generate: (r, big) => {
            if (big) {
                // long runs of 'a' make the naive approach quadratic
                return r.chance(0.5)
                    ? `${"a".repeat(100000)}\n${"a".repeat(50000)}`
                    : `${"a".repeat(100000)}\n${"a".repeat(49999)}b`;
            }
            const alphabet = r.pick(["ab", "abc"]);
            return `${r.str(r.int(1, 20), alphabet)}\n${r.str(r.int(1, 3), alphabet)}`;
        },
    },
    {
        title: "Valid Palindrome After One Deletion",
        difficulty: "easy",
        tags: ["strings", "two pointers"],
        description: `
Given a string s, decide whether it can become a palindrome after deleting at most one character.

Input
A single line containing s.

Output
Print YES if it is possible, otherwise print NO.`,
        constraints: ["1 <= |s| <= 10^5", "s consists of lowercase English letters"],
        examples: [
            { input: "abca", explanation: "Delete 'c' (or 'b') to get a palindrome." },
            { input: "abc", explanation: "No single deletion makes it a palindrome." },
        ],
        edge: ["a", "aba", "deeee"],
        solve: (input) => {
            const s = input.trim();
            const isPal = (i, j) => {
                while (i < j) if (s[i++] !== s[j--]) return false;
                return true;
            };
            let i = 0;
            let j = s.length - 1;
            while (i < j && s[i] === s[j]) {
                i++;
                j--;
            }
            return i >= j || isPal(i + 1, j) || isPal(i, j - 1) ? "YES" : "NO";
        },
        generate: (r, big) => {
            const half = r.str(big ? 49000 : r.int(0, 5), "ab");
            let s = half + (r.chance(0.5) ? r.str(1, "ab") : "") + [...half].reverse().join("");
            for (let extra = r.int(0, 2); extra > 0; extra--) {
                const at = r.int(0, s.length);
                s = s.slice(0, at) + r.str(1, "abc") + s.slice(at);
            }
            return s || "a";
        },
    },
    {
        title: "Zigzag Conversion",
        difficulty: "medium",
        tags: ["strings"],
        description: `
Write the string s in a zigzag pattern on numRows rows: go down the rows one character at a time, then diagonally back up, and repeat. Then read the rows from top to bottom.

For "PAYPALISHIRING" with 3 rows the zigzag is:
P   A   H   N
A P L S I I G
Y   I   R
and reading row by row gives "PAHNAPLSIIGYIR".

Input
The first line contains s. The second line contains numRows.

Output
Print the converted string.`,
        constraints: ["1 <= |s| <= 10^4", "1 <= numRows <= 1000", "s consists of English letters"],
        examples: [
            { input: "PAYPALISHIRING\n3", explanation: "See the zigzag shown above." },
            { input: "PAYPALISHIRING\n4", explanation: "Rows: PIN, ALSIG, YAHR, PI." },
        ],
        edge: ["A\n1", "ABCDE\n1", "AB\n5"],
        solve: (input) => {
            const [s, rowsText] = input.trim().split(/\s+/);
            const rows = Number(rowsText);
            if (rows === 1) return s;
            const out = Array.from({ length: rows }, () => []);
            let row = 0;
            let step = 1;
            for (const ch of s) {
                out[row].push(ch);
                if (row === 0) step = 1;
                else if (row === rows - 1) step = -1;
                row += step;
            }
            return out.map((x) => x.join("")).join("");
        },
        generate: (r, big) => {
            const s = r.str(big ? 10000 : r.int(1, 15), "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij");
            return `${s}\n${r.int(1, big ? 1000 : 6)}`;
        },
    },
    {
        title: "Word Pattern",
        difficulty: "easy",
        tags: ["strings", "hash table"],
        description: `
Given a pattern of letters and a sentence of words, decide whether the sentence follows the pattern. It does if there is a one-to-one match between pattern letters and words: the same letter always maps to the same word, and different letters map to different words.

Input
The first line contains the pattern. The second line contains the words separated by single spaces.

Output
Print YES if the sentence follows the pattern, otherwise print NO.`,
        constraints: ["1 <= length of pattern <= 300", "1 <= number of words <= 3000", "Words consist of lowercase English letters"],
        examples: [
            { input: "abba\ndog cat cat dog", explanation: "a -> dog and b -> cat." },
            { input: "abba\ndog dog dog dog", explanation: "a and b would both map to dog." },
        ],
        edge: ["aaa\naa aa aa aa", "ab\nx y"],
        solve: (input) => {
            const text = input.split("\n");
            const pattern = text[0].trim();
            const words = text[1].trim().split(/\s+/);
            if (pattern.length !== words.length) return "NO";
            const forward = new Map();
            const backward = new Map();
            for (let i = 0; i < words.length; i++) {
                const p = pattern[i];
                const w = words[i];
                if ((forward.get(p) ?? w) !== w || (backward.get(w) ?? p) !== p) return "NO";
                forward.set(p, w);
                backward.set(w, p);
            }
            return "YES";
        },
        generate: (r, big) => {
            const pattern = r.str(big ? 300 : r.int(1, 6), "abcd");
            const dict = {};
            for (const ch of "abcd") dict[ch] = r.str(r.int(1, 3), "xyz");
            const words = [...pattern].map((ch) => dict[ch]);
            if (r.chance(0.4)) words[r.int(0, words.length - 1)] = r.str(2, "xy");
            if (r.chance(0.1)) words.push("extra");
            return `${pattern}\n${words.join(" ")}`;
        },
    },
    {
        title: "Shortest Palindrome",
        difficulty: "hard",
        tags: ["strings"],
        description: `
Given a string s, you can add characters only to the front of it. Find the shortest palindrome you can make this way.

The answer is s with the reverse of its non-palindromic tail added in front, so the task is finding the longest palindromic prefix of s quickly. An O(n^2) check of every prefix is too slow for the largest tests.

Input
A single line containing s.

Output
Print the shortest palindrome.`,
        constraints: ["1 <= |s| <= 5 * 10^4", "s consists of lowercase English letters"],
        examples: [
            { input: "aacecaaa", explanation: "The longest palindromic prefix is \"aacecaa\", so add the reversed remaining \"a\" in front." },
            { input: "abcd", explanation: "Only \"a\" is a palindromic prefix, so add \"dcb\" in front." },
        ],
        edge: ["a", "aba"],
        solve: (input) => {
            const s = input.trim();
            const rev = [...s].reverse().join("");
            const combined = `${s}#${rev}`;
            const fail = new Array(combined.length).fill(0);
            for (let i = 1, k = 0; i < combined.length; i++) {
                while (k > 0 && combined[i] !== combined[k]) k = fail[k - 1];
                if (combined[i] === combined[k]) k++;
                fail[i] = k;
            }
            return rev.slice(0, s.length - fail[combined.length - 1]) + s;
        },
        generate: (r, big) => {
            if (big) {
                const n = 50000;
                return r.chance(0.5) ? "a".repeat(n / 2) + "b" + "a".repeat(n / 2 - 1) : "a".repeat(n - 1) + "b";
            }
            return r.str(r.int(1, 10), r.pick(["ab", "abc"]));
        },
    },
];
