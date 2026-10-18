require("dotenv").config();
const mongoose = require("mongoose");
const Problem = require("../models/Problem");
const { user } = require("../models/user");

const problemsData = [
  {
    problemID: 1,
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nPrint the two 0-based indices separated by a space in ascending order.",
    difficulty: "easy",
    tags: ["arrays", "hash table"],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9", "Only one valid answer exists."],
    timeLimit: 2.0,
    memoryLimit: 256,
    starterCode: {
      language: "python",
      code: "import sys\n\ndef two_sum():\n    # Read input from stdin\n    input_data = sys.stdin.read().split()\n    if not input_data:\n        return\n    n = int(input_data[0])\n    target = int(input_data[1])\n    nums = [int(x) for x in input_data[2:2+n]]\n    \n    # Write your solution here\n    pass\n\nif __name__ == '__main__':\n    two_sum()\n",
    },
    referenceSolution: {
      language: "python",
      completeCode: "import sys\n\ndef two_sum():\n    data = sys.stdin.read().split()\n    if not data: return\n    n, target = int(data[0]), int(data[1])\n    nums = [int(x) for x in data[2:2+n]]\n    lookup = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in lookup:\n            print(f\"{lookup[diff]} {i}\")\n            return\n        lookup[num] = i\n\nif __name__ == '__main__':\n    two_sum()",
    },
    visibleTestCases: [
      {
        input: "4 9\n2 7 11 15",
        output: "0 1",
        explanation: "Because nums[0] + nums[1] == 2 + 7 == 9, we return 0 1.",
      },
      {
        input: "3 6\n3 2 4",
        output: "1 2",
        explanation: "nums[1] + nums[2] == 2 + 4 == 6, we return 1 2.",
      },
    ],
    hiddenTestCases: [
      {
        input: "2 6\n3 3",
        output: "0 1",
      },
      {
        input: "5 0\n-3 4 3 90 2",
        output: "0 2",
      },
      {
        input: "4 -8\n-1 -2 -3 -5",
        output: "2 3",
      },
    ],
  },
  {
    problemID: 2,
    title: "Palindrome Number",
    description: "Given an integer x, return true if x is a palindrome, and false otherwise.\n\nAn integer is a palindrome when it reads the same forward and backward.",
    difficulty: "easy",
    tags: ["math"],
    constraints: ["-2^31 <= x <= 2^31 - 1"],
    timeLimit: 1.0,
    memoryLimit: 256,
    starterCode: {
      language: "python",
      code: "import sys\n\ndef is_palindrome():\n    # Read integer from stdin\n    x = sys.stdin.read().strip()\n    # Print 'true' or 'false'\n    pass\n\nif __name__ == '__main__':\n    is_palindrome()\n",
    },
    referenceSolution: {
      language: "python",
      completeCode: "import sys\nx = sys.stdin.read().strip()\nif not x:\n    sys.exit(0)\nprint('true' if x == x[::-1] else 'false')",
    },
    visibleTestCases: [
      {
        input: "121",
        output: "true",
        explanation: "121 reads as 121 from left to right and from right to left.",
      },
      {
        input: "-121",
        output: "false",
        explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.",
      },
    ],
    hiddenTestCases: [
      {
        input: "10",
        output: "false",
      },
      {
        input: "0",
        output: "true",
      },
      {
        input: "1234321",
        output: "true",
      },
    ],
  },
  {
    problemID: 3,
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    difficulty: "easy",
    tags: ["strings", "stack"],
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
    timeLimit: 1.0,
    memoryLimit: 256,
    starterCode: {
      language: "python",
      code: "import sys\n\ndef is_valid():\n    s = sys.stdin.read().strip()\n    # Print 'true' or 'false'\n    pass\n\nif __name__ == '__main__':\n    is_valid()\n",
    },
    referenceSolution: {
      language: "python",
      completeCode: "import sys\ns = sys.stdin.read().strip()\nstack = []\nmapping = {')': '(', '}': '{', ']': '['}\nfor char in s:\n    if char in mapping:\n        top_element = stack.pop() if stack else '#'\n        if mapping[char] != top_element:\n            print('false')\n            sys.exit(0)\n    else:\n        stack.append(char)\nprint('true' if not stack else 'false')",
    },
    visibleTestCases: [
      {
        input: "()[]{}",
        output: "true",
        explanation: "All brackets open and close in valid order.",
      },
      {
        input: "(]",
        output: "false",
        explanation: "The parentheses do not match.",
      },
    ],
    hiddenTestCases: [
      {
        input: "([{}])",
        output: "true",
      },
      {
        input: "((((",
        output: "false",
      },
      {
        input: "][",
        output: "false",
      },
    ],
  },
  {
    problemID: 4,
    title: "Merge Two Sorted Lists",
    description: "You are given two sorted integer sequences. Merge the two lists into one sorted list.\n\nInput:\nFirst line: integer N followed by N space-separated integers.\nSecond line: integer M followed by M space-separated integers.\n\nOutput: The merged sorted sequence space-separated.",
    difficulty: "easy",
    tags: ["sorting", "two pointers"],
    constraints: ["0 <= N, M <= 10^4", "-10^5 <= values <= 10^5"],
    timeLimit: 2.0,
    memoryLimit: 256,
    starterCode: {
      language: "python",
      code: "import sys\n\ndef merge_sorted():\n    lines = sys.stdin.read().strip().split('\\n')\n    # Implement merge\n    pass\n\nif __name__ == '__main__':\n    merge_sorted()\n",
    },
    referenceSolution: {
      language: "python",
      completeCode: "import sys\nlines = [line.strip() for line in sys.stdin.read().strip().split('\\n') if line.strip()]\nlist1 = []\nlist2 = []\nif len(lines) >= 1:\n    parts = lines[0].split()\n    if parts:\n        n = int(parts[0])\n        list1 = [int(x) for x in parts[1:1+n]]\nif len(lines) >= 2:\n    parts = lines[1].split()\n    if parts:\n        m = int(parts[0])\n        list2 = [int(x) for x in parts[1:1+m]]\nmerged = sorted(list1 + list2)\nprint(' '.join(map(str, merged)))",
    },
    visibleTestCases: [
      {
        input: "3 1 2 4\n3 1 3 4",
        output: "1 1 2 3 4 4",
        explanation: "Merging [1, 2, 4] and [1, 3, 4] gives [1, 1, 2, 3, 4, 4].",
      },
      {
        input: "0\n1 0",
        output: "0",
        explanation: "First list is empty, second is [0].",
      },
    ],
    hiddenTestCases: [
      {
        input: "1 1\n1 2",
        output: "1 2",
      },
      {
        input: "3 5 10 15\n3 2 4 6",
        output: "2 4 5 6 10 15",
      },
      {
        input: "2 -10 -5\n2 -8 0",
        output: "-10 -8 -5 0",
      },
    ],
  },
  {
    problemID: 5,
    title: "Best Time to Buy and Sell Stock",
    description: "You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
    difficulty: "easy",
    tags: ["arrays", "dynamic programming"],
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
    timeLimit: 2.0,
    memoryLimit: 256,
    starterCode: {
      language: "python",
      code: "import sys\n\ndef max_profit():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0])\n    prices = [int(x) for x in data[1:1+n]]\n    # Compute max profit\n    pass\n\nif __name__ == '__main__':\n    max_profit()\n",
    },
    referenceSolution: {
      language: "python",
      completeCode: "import sys\ndata = sys.stdin.read().split()\nif not data:\n    print(0)\n    sys.exit(0)\nn = int(data[0])\nprices = [int(x) for x in data[1:1+n]]\nmin_price = float('inf')\nmax_profit = 0\nfor price in prices:\n    if price < min_price:\n        min_price = price\n    elif price - min_price > max_profit:\n        max_profit = price - min_price\nprint(max_profit)",
    },
    visibleTestCases: [
      {
        input: "6 7 1 5 3 6 4",
        output: "5",
        explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5.",
      },
      {
        input: "5 7 6 4 3 1",
        output: "0",
        explanation: "In this case, no transactions are done and the max profit = 0.",
      },
    ],
    hiddenTestCases: [
      {
        input: "2 2 4",
        output: "2",
      },
      {
        input: "1 5",
        output: "0",
      },
      {
        input: "6 3 2 6 5 0 3",
        output: "4",
      },
    ],
  },
  {
    problemID: 6,
    title: "Valid Palindrome",
    description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string s, return true if it is a palindrome, or false otherwise.",
    difficulty: "easy",
    tags: ["strings", "two pointers"],
    constraints: ["1 <= s.length <= 2 * 10^5", "s consists only of printable ASCII characters."],
    timeLimit: 1.0,
    memoryLimit: 256,
    starterCode: {
      language: "python",
      code: "import sys\n\ndef is_palindrome():\n    s = sys.stdin.read().strip()\n    # Check if palindrome\n    pass\n\nif __name__ == '__main__':\n    is_palindrome()\n",
    },
    referenceSolution: {
      language: "python",
      completeCode: "import sys\ns = sys.stdin.read().strip()\ncleaned = ''.join(c.lower() for c in s if c.isalnum())\nprint('true' if cleaned == cleaned[::-1] else 'false')",
    },
    visibleTestCases: [
      {
        input: "A man, a plan, a canal: Panama",
        output: "true",
        explanation: "'amanaplanacanalpanama' is a palindrome.",
      },
      {
        input: "race a car",
        output: "false",
        explanation: "'raceacar' is not a palindrome.",
      },
    ],
    hiddenTestCases: [
      {
        input: " ",
        output: "true",
      },
      {
        input: "0P",
        output: "false",
      },
      {
        input: "ab_a",
        output: "true",
      },
    ],
  },
  {
    problemID: 7,
    title: "Binary Search",
    description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its 0-based index. Otherwise, return -1.\n\nYou must write an algorithm with O(log n) runtime complexity.",
    difficulty: "easy",
    tags: ["arrays", "searching"],
    constraints: ["1 <= nums.length <= 10^4", "-10^4 < nums[i], target < 10^4", "All integers in nums are unique and sorted."],
    timeLimit: 1.0,
    memoryLimit: 256,
    starterCode: {
      language: "python",
      code: "import sys\n\ndef binary_search():\n    data = sys.stdin.read().split()\n    if not data: return\n    n, target = int(data[0]), int(data[1])\n    nums = [int(x) for x in data[2:2+n]]\n    # Implement binary search\n    pass\n\nif __name__ == '__main__':\n    binary_search()\n",
    },
    referenceSolution: {
      language: "python",
      completeCode: "import sys\ndata = sys.stdin.read().split()\nif not data:\n    print(-1)\n    sys.exit(0)\nn, target = int(data[0]), int(data[1])\nnums = [int(x) for x in data[2:2+n]]\nleft, right = 0, n - 1\nans = -1\nwhile left <= right:\n    mid = (left + right) // 2\n    if nums[mid] == target:\n        ans = mid\n        break\n    elif nums[mid] < target:\n        left = mid + 1\n    else:\n        right = mid - 1\nprint(ans)",
    },
    visibleTestCases: [
      {
        input: "6 9\n-1 0 3 5 9 12",
        output: "4",
        explanation: "9 exists in nums and its index is 4.",
      },
      {
        input: "6 2\n-1 0 3 5 9 12",
        output: "-1",
        explanation: "2 does not exist in nums so return -1.",
      },
    ],
    hiddenTestCases: [
      {
        input: "1 5\n5",
        output: "0",
      },
      {
        input: "2 1\n2 5",
        output: "-1",
      },
      {
        input: "5 100\n10 20 50 100 200",
        output: "3",
      },
    ],
  },
  {
    problemID: 8,
    title: "Climbing Stairs",
    description: "You are climbing a staircase. It takes n steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    difficulty: "easy",
    tags: ["dynamic programming", "math"],
    constraints: ["1 <= n <= 45"],
    timeLimit: 1.0,
    memoryLimit: 256,
    starterCode: {
      language: "python",
      code: "import sys\n\ndef climb_stairs():\n    n = int(sys.stdin.read().strip())\n    # Compute ways\n    pass\n\nif __name__ == '__main__':\n    climb_stairs()\n",
    },
    referenceSolution: {
      language: "python",
      completeCode: "import sys\nn = int(sys.stdin.read().strip())\nif n <= 2:\n    print(n)\n    sys.exit(0)\na, b = 1, 2\nfor _ in range(3, n + 1):\n    a, b = b, a + b\nprint(b)",
    },
    visibleTestCases: [
      {
        input: "2",
        output: "2",
        explanation: "There are two ways to climb to the top: 1. 1 step + 1 step, 2. 2 steps.",
      },
      {
        input: "3",
        output: "3",
        explanation: "There are three ways to climb to the top: 1. 1+1+1, 2. 1+2, 3. 2+1.",
      },
    ],
    hiddenTestCases: [
      {
        input: "1",
        output: "1",
      },
      {
        input: "5",
        output: "8",
      },
      {
        input: "10",
        output: "89",
      },
    ],
  },
  {
    problemID: 9,
    title: "Maximum Subarray",
    description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.\n\nA subarray is a contiguous non-empty sequence of elements within an array.",
    difficulty: "medium",
    tags: ["arrays", "dynamic programming"],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    timeLimit: 2.0,
    memoryLimit: 256,
    starterCode: {
      language: "python",
      code: "import sys\n\ndef max_sub_array():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0])\n    nums = [int(x) for x in data[1:1+n]]\n    # Return max subarray sum\n    pass\n\nif __name__ == '__main__':\n    max_sub_array()\n",
    },
    referenceSolution: {
      language: "python",
      completeCode: "import sys\ndata = sys.stdin.read().split()\nif not data:\n    sys.exit(0)\nn = int(data[0])\nnums = [int(x) for x in data[1:1+n]]\nmax_so_far = nums[0]\ncurr_max = nums[0]\nfor x in nums[1:]:\n    curr_max = max(x, curr_max + x)\n    max_so_far = max(max_so_far, curr_max)\nprint(max_so_far)",
    },
    visibleTestCases: [
      {
        input: "9 -2 1 -3 4 -1 2 1 -5 4",
        output: "6",
        explanation: "The subarray [4, -1, 2, 1] has the largest sum 6.",
      },
      {
        input: "1 1",
        output: "1",
        explanation: "The subarray [1] has the largest sum 1.",
      },
    ],
    hiddenTestCases: [
      {
        input: "5 5 4 -1 7 8",
        output: "23",
      },
      {
        input: "3 -3 -2 -1",
        output: "-1",
      },
      {
        input: "4 -10 -20 -30 -40",
        output: "-10",
      },
    ],
  },
  {
    problemID: 10,
    title: "Contains Duplicate",
    description: "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
    difficulty: "easy",
    tags: ["arrays", "hash table"],
    constraints: ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    timeLimit: 1.5,
    memoryLimit: 256,
    starterCode: {
      language: "python",
      code: "import sys\n\ndef contains_duplicate():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0])\n    nums = [int(x) for x in data[1:1+n]]\n    # Print 'true' or 'false'\n    pass\n\nif __name__ == '__main__':\n    contains_duplicate()\n",
    },
    referenceSolution: {
      language: "python",
      completeCode: "import sys\ndata = sys.stdin.read().split()\nif not data:\n    print('false')\n    sys.exit(0)\nn = int(data[0])\nnums = [int(x) for x in data[1:1+n]]\nprint('true' if len(set(nums)) < len(nums) else 'false')",
    },
    visibleTestCases: [
      {
        input: "4 1 2 3 1",
        output: "true",
        explanation: "1 appears twice in the array.",
      },
      {
        input: "4 1 2 3 4",
        output: "false",
        explanation: "All elements are distinct.",
      },
    ],
    hiddenTestCases: [
      {
        input: "10 1 1 1 3 3 4 3 2 4 2",
        output: "true",
      },
      {
        input: "1 42",
        output: "false",
      },
      {
        input: "5 -1 -2 -3 -4 -1",
        output: "true",
      },
    ],
  },
  {
    problemID: 11,
    title: "Container With Most Water",
    description: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.",
    difficulty: "medium",
    tags: ["arrays", "two pointers"],
    constraints: ["2 <= n <= 10^5", "0 <= height[i] <= 10^4"],
    timeLimit: 2.0,
    memoryLimit: 256,
    starterCode: {
      language: "python",
      code: "import sys\n\ndef max_area():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0])\n    height = [int(x) for x in data[1:1+n]]\n    # Return max area\n    pass\n\nif __name__ == '__main__':\n    max_area()\n",
    },
    referenceSolution: {
      language: "python",
      completeCode: "import sys\ndata = sys.stdin.read().split()\nif not data:\n    print(0)\n    sys.exit(0)\nn = int(data[0])\nheight = [int(x) for x in data[1:1+n]]\nleft, right = 0, n - 1\nmax_water = 0\nwhile left < right:\n    w = right - left\n    h = min(height[left], height[right])\n    max_water = max(max_water, w * h)\n    if height[left] < height[right]:\n        left += 1\n    else:\n        right -= 1\nprint(max_water)",
    },
    visibleTestCases: [
      {
        input: "9 1 8 6 2 5 4 8 3 7",
        output: "49",
        explanation: "The vertical lines are at indices 1 and 8 with heights 8 and 7, width 7 -> 7 * 7 = 49.",
      },
      {
        input: "2 1 1",
        output: "1",
        explanation: "Width is 1, min height is 1, total water = 1.",
      },
    ],
    hiddenTestCases: [
      {
        input: "5 4 3 2 1 4",
        output: "16",
      },
      {
        input: "4 1 2 4 3",
        output: "4",
      },
      {
        input: "6 2 3 4 5 18 17 6",
        output: "17",
      },
    ],
  },
  {
    problemID: 12,
    title: "3Sum",
    description: "Given an integer array nums, return the count of all unique triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
    difficulty: "medium",
    tags: ["arrays", "two pointers", "sorting"],
    constraints: ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
    timeLimit: 2.0,
    memoryLimit: 256,
    starterCode: {
      language: "python",
      code: "import sys\n\ndef three_sum():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0])\n    nums = [int(x) for x in data[1:1+n]]\n    # Print count of unique triplets\n    pass\n\nif __name__ == '__main__':\n    three_sum()\n",
    },
    referenceSolution: {
      language: "python",
      completeCode: "import sys\ndata = sys.stdin.read().split()\nif not data:\n    print(0)\n    sys.exit(0)\nn = int(data[0])\nnums = sorted([int(x) for x in data[1:1+n]])\ncount = 0\nfor i in range(n - 2):\n    if i > 0 and nums[i] == nums[i-1]:\n        continue\n    left, right = i + 1, n - 1\n    while left < right:\n        total = nums[i] + nums[left] + nums[right]\n        if total == 0:\n            count += 1\n            while left < right and nums[left] == nums[left+1]:\n                left += 1\n            while left < right and nums[right] == nums[right-1]:\n                right -= 1\n            left += 1\n            right -= 1\n        elif total < 0:\n            left += 1\n        else:\n            right -= 1\nprint(count)",
    },
    visibleTestCases: [
      {
        input: "6 -1 0 1 2 -1 -4",
        output: "2",
        explanation: "The unique triplets are [-1, -1, 2] and [-1, 0, 1]. Count = 2.",
      },
      {
        input: "3 0 1 1",
        output: "0",
        explanation: "No possible triplet sums to 0.",
      },
    ],
    hiddenTestCases: [
      {
        input: "3 0 0 0",
        output: "1",
      },
      {
        input: "7 -2 0 1 1 2 -1 -4",
        output: "3",
      },
      {
        input: "4 1 2 -2 -1",
        output: "0",
      },
    ],
  },
  {
    problemID: 13,
    title: "Longest Substring Without Repeating Characters",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    difficulty: "medium",
    tags: ["strings", "sliding window", "hash table"],
    constraints: ["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."],
    timeLimit: 1.5,
    memoryLimit: 256,
    starterCode: {
      language: "python",
      code: "import sys\n\ndef length_of_longest_substring():\n    s = sys.stdin.read().rstrip('\\r\\n')\n    # Compute length\n    pass\n\nif __name__ == '__main__':\n    length_of_longest_substring()\n",
    },
    referenceSolution: {
      language: "python",
      completeCode: "import sys\ns = sys.stdin.read().rstrip('\\r\\n')\nchar_map = {}\nmax_len = 0\nleft = 0\nfor right, char in enumerate(s):\n    if char in char_map and char_map[char] >= left:\n        left = char_map[char] + 1\n    char_map[char] = right\n    max_len = max(max_len, right - left + 1)\nprint(max_len)",
    },
    visibleTestCases: [
      {
        input: "abcabcbb",
        output: "3",
        explanation: "The answer is 'abc', with the length of 3.",
      },
      {
        input: "bbbbb",
        output: "1",
        explanation: "The answer is 'b', with the length of 1.",
      },
    ],
    hiddenTestCases: [
      {
        input: "pwwkew",
        output: "3",
      },
      {
        input: "a",
        output: "1",
      },
      {
        input: "dvdf",
        output: "3",
      },
    ],
  },
  {
    problemID: 14,
    title: "Search in Rotated Sorted Array",
    description: "There is an integer array nums sorted in ascending order (with distinct values).\n\nPrior to being passed to your function, nums is possibly rotated at an unknown pivot index k (1 <= k < nums.length).\n\nGiven the array nums after the possible rotation and an integer target, return the 0-based index of target if it is in nums, or -1 if it is not in nums.",
    difficulty: "medium",
    tags: ["arrays", "searching"],
    constraints: ["1 <= nums.length <= 5000", "-10^4 <= nums[i] <= 10^4", "All values of nums are unique."],
    timeLimit: 1.0,
    memoryLimit: 256,
    starterCode: {
      language: "python",
      code: "import sys\n\ndef search_rotated():\n    data = sys.stdin.read().split()\n    if not data: return\n    n, target = int(data[0]), int(data[1])\n    nums = [int(x) for x in data[2:2+n]]\n    # Return index or -1\n    pass\n\nif __name__ == '__main__':\n    search_rotated()\n",
    },
    referenceSolution: {
      language: "python",
      completeCode: "import sys\ndata = sys.stdin.read().split()\nif not data:\n    print(-1)\n    sys.exit(0)\nn, target = int(data[0]), int(data[1])\nnums = [int(x) for x in data[2:2+n]]\nleft, right = 0, n - 1\nans = -1\nwhile left <= right:\n    mid = (left + right) // 2\n    if nums[mid] == target:\n        ans = mid\n        break\n    if nums[left] <= nums[mid]:\n        if nums[left] <= target < nums[mid]:\n            right = mid - 1\n        else:\n            left = mid + 1\n    else:\n        if nums[mid] < target <= nums[right]:\n            left = mid + 1\n        else:\n            right = mid - 1\nprint(ans)",
    },
    visibleTestCases: [
      {
        input: "7 0\n4 5 6 7 0 1 2",
        output: "4",
        explanation: "0 exists at index 4.",
      },
      {
        input: "7 3\n4 5 6 7 0 1 2",
        output: "-1",
        explanation: "3 is not in nums, return -1.",
      },
    ],
    hiddenTestCases: [
      {
        input: "1 0\n0",
        output: "0",
      },
      {
        input: "3 1\n5 1 3",
        output: "1",
      },
      {
        input: "5 5\n4 5 1 2 3",
        output: "1",
      },
    ],
  },
  {
    problemID: 15,
    title: "Product of Array Except Self",
    description: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].\n\nThe product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.\n\nYou must write an algorithm that runs in O(n) time and without using the division operation.\n\nPrint the resulting array elements separated by spaces.",
    difficulty: "medium",
    tags: ["arrays"],
    constraints: ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30"],
    timeLimit: 2.0,
    memoryLimit: 256,
    starterCode: {
      language: "python",
      code: "import sys\n\ndef product_except_self():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0])\n    nums = [int(x) for x in data[1:1+n]]\n    # Output space-separated answers\n    pass\n\nif __name__ == '__main__':\n    product_except_self()\n",
    },
    referenceSolution: {
      language: "python",
      completeCode: "import sys\ndata = sys.stdin.read().split()\nif not data: sys.exit(0)\nn = int(data[0])\nnums = [int(x) for x in data[1:1+n]]\nres = [1] * n\nprefix = 1\nfor i in range(n):\n    res[i] = prefix\n    prefix *= nums[i]\npostfix = 1\nfor i in range(n - 1, -1, -1):\n    res[i] *= postfix\n    postfix *= nums[i]\nprint(' '.join(map(str, res)))",
    },
    visibleTestCases: [
      {
        input: "4 1 2 3 4",
        output: "24 12 8 6",
        explanation: "Products are: [2*3*4, 1*3*4, 1*2*4, 1*2*3] = [24, 12, 8, 6].",
      },
      {
        input: "5 -1 1 0 -3 3",
        output: "0 0 9 0 0",
        explanation: "Element at index 2 has product (-1)*1*(-3)*3 = 9.",
      },
    ],
    hiddenTestCases: [
      {
        input: "2 5 10",
        output: "10 5",
      },
      {
        input: "3 0 0 2",
        output: "0 0 0",
      },
      {
        input: "4 2 3 4 5",
        output: "60 40 30 24",
      },
    ],
  },
  {
    problemID: 16,
    title: "House Robber",
    description: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night.\n\nGiven an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.",
    difficulty: "medium",
    tags: ["arrays", "dynamic programming"],
    constraints: ["1 <= nums.length <= 100", "0 <= nums[i] <= 400"],
    timeLimit: 1.0,
    memoryLimit: 256,
    starterCode: {
      language: "python",
      code: "import sys\n\ndef rob():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0])\n    nums = [int(x) for x in data[1:1+n]]\n    # Return max money\n    pass\n\nif __name__ == '__main__':\n    rob()\n",
    },
    referenceSolution: {
      language: "python",
      completeCode: "import sys\ndata = sys.stdin.read().split()\nif not data:\n    print(0)\n    sys.exit(0)\nn = int(data[0])\nnums = [int(x) for x in data[1:1+n]]\nrob1, rob2 = 0, 0\nfor n_val in nums:\n    new_rob = max(rob1 + n_val, rob2)\n    rob1 = rob2\n    rob2 = new_rob\nprint(rob2)",
    },
    visibleTestCases: [
      {
        input: "4 1 2 3 1",
        output: "4",
        explanation: "Rob house 1 (money = 1) and then rob house 3 (money = 3). Total = 1 + 3 = 4.",
      },
      {
        input: "5 2 7 9 3 1",
        output: "12",
        explanation: "Rob house 1 (money = 2), house 3 (money = 9) and house 5 (money = 1). Total = 2 + 9 + 1 = 12.",
      },
    ],
    hiddenTestCases: [
      {
        input: "1 100",
        output: "100",
      },
      {
        input: "2 50 10",
        output: "50",
      },
      {
        input: "6 2 1 1 2 5 1",
        output: "8",
      },
    ],
  },
  {
    problemID: 17,
    title: "Coin Change",
    description: "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.\n\nYou may assume that you have an infinite number of each kind of coin.",
    difficulty: "medium",
    tags: ["dynamic programming"],
    constraints: ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
    timeLimit: 2.0,
    memoryLimit: 256,
    starterCode: {
      language: "python",
      code: "import sys\n\ndef coin_change():\n    data = sys.stdin.read().split()\n    if not data: return\n    n, amount = int(data[0]), int(data[1])\n    coins = [int(x) for x in data[2:2+n]]\n    # Return min coins or -1\n    pass\n\nif __name__ == '__main__':\n    coin_change()\n",
    },
    referenceSolution: {
      language: "python",
      completeCode: "import sys\ndata = sys.stdin.read().split()\nif not data:\n    print(-1)\n    sys.exit(0)\nn, amount = int(data[0]), int(data[1])\ncoins = [int(x) for x in data[2:2+n]]\ndp = [amount + 1] * (amount + 1)\ndp[0] = 0\nfor c in coins:\n    for a in range(c, amount + 1):\n        dp[a] = min(dp[a], dp[a - c] + 1)\nprint(dp[amount] if dp[amount] != amount + 1 else -1)",
    },
    visibleTestCases: [
      {
        input: "3 11\n1 2 5",
        output: "3",
        explanation: "11 = 5 + 5 + 1 (3 coins).",
      },
      {
        input: "1 3\n2",
        output: "-1",
        explanation: "The amount of 3 cannot be made up with coins of denomination 2.",
      },
    ],
    hiddenTestCases: [
      {
        input: "1 0\n1",
        output: "0",
      },
      {
        input: "3 6249\n186 419 83",
        output: "20",
      },
      {
        input: "2 7\n2 4",
        output: "-1",
      },
    ],
  },
  {
    problemID: 18,
    title: "Valid Anagram",
    description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    difficulty: "easy",
    tags: ["strings", "hash table", "sorting"],
    constraints: ["1 <= s.length, t.length <= 5 * 10^4", "s and t consist of lowercase English letters."],
    timeLimit: 1.0,
    memoryLimit: 256,
    starterCode: {
      language: "python",
      code: "import sys\n\ndef is_anagram():\n    lines = sys.stdin.read().strip().split()\n    # Print 'true' or 'false'\n    pass\n\nif __name__ == '__main__':\n    is_anagram()\n",
    },
    referenceSolution: {
      language: "python",
      completeCode: "import sys\nparts = sys.stdin.read().strip().split()\nif len(parts) < 2:\n    print('false')\n    sys.exit(0)\ns, t = parts[0], parts[1]\nprint('true' if sorted(s) == sorted(t) else 'false')",
    },
    visibleTestCases: [
      {
        input: "anagram nagaram",
        output: "true",
        explanation: "'nagaram' is an anagram of 'anagram'.",
      },
      {
        input: "rat car",
        output: "false",
        explanation: "'car' is not an anagram of 'rat'.",
      },
    ],
    hiddenTestCases: [
      {
        input: "a b",
        output: "false",
      },
      {
        input: "listen silent",
        output: "true",
      },
      {
        input: "ab a",
        output: "false",
      },
    ],
  },
  {
    problemID: 19,
    title: "Trapping Rain Water",
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    difficulty: "hard",
    tags: ["arrays", "two pointers", "dynamic programming", "stack"],
    constraints: ["n == height.length", "1 <= n <= 2 * 10^4", "0 <= height[i] <= 10^5"],
    timeLimit: 2.0,
    memoryLimit: 256,
    starterCode: {
      language: "python",
      code: "import sys\n\ndef trap():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0])\n    height = [int(x) for x in data[1:1+n]]\n    # Return trapped water\n    pass\n\nif __name__ == '__main__':\n    trap()\n",
    },
    referenceSolution: {
      language: "python",
      completeCode: "import sys\ndata = sys.stdin.read().split()\nif not data:\n    print(0)\n    sys.exit(0)\nn = int(data[0])\nheight = [int(x) for x in data[1:1+n]]\nif n < 3:\n    print(0)\n    sys.exit(0)\nleft, right = 0, n - 1\nleft_max, right_max = height[left], height[right]\nwater = 0\nwhile left < right:\n    if left_max < right_max:\n        left += 1\n        left_max = max(left_max, height[left])\n        water += left_max - height[left]\n    else:\n        right -= 1\n        right_max = max(right_max, height[right])\n        water += right_max - height[right]\nprint(water)",
    },
    visibleTestCases: [
      {
        input: "12 0 1 0 2 1 0 1 3 2 1 2 1",
        output: "6",
        explanation: "The elevation map traps 6 units of rain water.",
      },
      {
        input: "6 4 2 0 3 2 5",
        output: "9",
        explanation: "The elevation map traps 9 units of rain water.",
      },
    ],
    hiddenTestCases: [
      {
        input: "1 5",
        output: "0",
      },
      {
        input: "3 2 0 2",
        output: "2",
      },
      {
        input: "5 5 4 3 2 1",
        output: "0",
      },
    ],
  },
  {
    problemID: 20,
    title: "Median of Two Sorted Arrays",
    description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays formatted with 1 decimal place (e.g. 2.0 or 2.5).\n\nThe overall run time complexity should be O(log (m+n)).\n\nInput:\nFirst line: m followed by m sorted space-separated integers.\nSecond line: n followed by n sorted space-separated integers.",
    difficulty: "hard",
    tags: ["arrays", "searching", "sorting"],
    constraints: ["nums1.length == m", "nums2.length == n", "0 <= m <= 1000", "0 <= n <= 1000", "1 <= m + n <= 2000", "-10^6 <= nums1[i], nums2[i] <= 10^6"],
    timeLimit: 2.0,
    memoryLimit: 256,
    starterCode: {
      language: "python",
      code: "import sys\n\ndef find_median_sorted_arrays():\n    lines = [l.strip() for l in sys.stdin.read().strip().split('\\n') if l.strip()]\n    # Output median with 1 decimal place (e.g. 2.0)\n    pass\n\nif __name__ == '__main__':\n    find_median_sorted_arrays()\n",
    },
    referenceSolution: {
      language: "python",
      completeCode: "import sys\nlines = [l.strip() for l in sys.stdin.read().strip().split('\\n') if l.strip()]\nnums1 = []\nnums2 = []\nif len(lines) >= 1:\n    p = lines[0].split()\n    if p:\n        m = int(p[0])\n        nums1 = [int(x) for x in p[1:1+m]]\nif len(lines) >= 2:\n    p = lines[1].split()\n    if p:\n        n = int(p[0])\n        nums2 = [int(x) for x in p[1:1+n]]\nmerged = sorted(nums1 + nums2)\ntotal = len(merged)\nif total % 2 == 1:\n    print(f\"{float(merged[total // 2]):.1f}\")\nelse:\n    med = (merged[total // 2 - 1] + merged[total // 2]) / 2.0\n    print(f\"{med:.1f}\")",
    },
    visibleTestCases: [
      {
        input: "2 1 3\n1 2",
        output: "2.0",
        explanation: "merged array = [1,2,3] and median is 2.0.",
      },
      {
        input: "2 1 2\n2 3 4",
        output: "2.5",
        explanation: "merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.",
      },
    ],
    hiddenTestCases: [
      {
        input: "0\n1 1",
        output: "1.0",
      },
      {
        input: "2 0 0\n2 0 0",
        output: "0.0",
      },
      {
        input: "3 1 5 9\n2 2 8",
        output: "5.0",
      },
    ],
  },
];

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.DB_URI);
    console.log("Connected successfully!");

    // Find admin user or fallback to first user
    const adminUser = (await user.findOne({ role: "admin" })) || (await user.findOne());
    if (!adminUser) {
      throw new Error("No user found in database to assign problemCreator");
    }
    console.log(`Assigning problemCreator to: ${adminUser.username} (${adminUser._id})`);

    let inserted = 0;
    let updated = 0;

    for (const data of problemsData) {
      const problemPayload = {
        ...data,
        problemCreator: adminUser._id,
      };

      const existing = await Problem.findOne({ problemID: data.problemID });
      if (existing) {
        await Problem.updateOne({ problemID: data.problemID }, { $set: problemPayload });
        updated++;
      } else {
        await Problem.create(problemPayload);
        inserted++;
      }
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`   - Newly inserted: ${inserted}`);
    console.log(`   - Updated/Refreshed: ${updated}`);
    console.log(`   - Total problems in collection: ${await Problem.countDocuments()}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
