require("dotenv").config();
const mongoose = require("mongoose");
const Problem = require("../models/Problem");

const cppBoilerplates = {
  1: {
    // Two Sum
    code: `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, target;
    if (!(cin >> n >> target)) return 0;

    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    // Write your solution here
    // Print the two 0-based indices separated by a space in ascending order

    return 0;
}`,
  },
  2: {
    // Palindrome Number
    code: `#include <iostream>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    if (!(cin >> s)) return 0;

    // Write your solution here
    // Print "true" or "false"

    return 0;
}`,
  },
  3: {
    // Valid Parentheses
    code: `#include <iostream>
#include <string>
#include <stack>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    if (!(cin >> s)) return 0;

    // Write your solution here
    // Print "true" or "false"

    return 0;
}`,
  },
  4: {
    // Merge Two Sorted Lists
    code: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, m;
    if (cin >> n) {
        vector<int> a(n);
        for (int i = 0; i < n; i++) cin >> a[i];
        if (cin >> m) {
            vector<int> b(m);
            for (int i = 0; i < m; i++) cin >> b[i];

            // Write your solution here
            // Print the merged sorted sequence space-separated
        }
    }
    return 0;
}`,
  },
  5: {
    // Best Time to Buy and Sell Stock
    code: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<int> prices(n);
    for (int i = 0; i < n; i++) {
        cin >> prices[i];
    }

    // Write your solution here
    // Print maximum profit (or 0)

    return 0;
}`,
  },
  6: {
    // Valid Palindrome
    code: `#include <iostream>
#include <string>
#include <cctype>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    if (!getline(cin, s)) return 0;

    // Write your solution here
    // Print "true" or "false"

    return 0;
}`,
  },
  7: {
    // Binary Search
    code: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, target;
    if (!(cin >> n >> target)) return 0;

    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    // Write your solution here
    // Print the 0-based index of target if found, else -1

    return 0;
}`,
  },
  8: {
    // Climbing Stairs
    code: `#include <iostream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    // Write your solution here
    // Print the number of distinct ways to climb to the top

    return 0;
}`,
  },
  9: {
    // Maximum Subarray
    code: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    // Write your solution here
    // Print the maximum subarray sum (Kadane's Algorithm)

    return 0;
}`,
  },
  10: {
    // Contains Duplicate
    code: `#include <iostream>
#include <vector>
#include <unordered_set>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    // Write your solution here
    // Print "true" if any value appears at least twice, else "false"

    return 0;
}`,
  },
  11: {
    // Container With Most Water
    code: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<int> height(n);
    for (int i = 0; i < n; i++) {
        cin >> height[i];
    }

    // Write your solution here
    // Print the maximum amount of water a container can store

    return 0;
}`,
  },
  12: {
    // 3Sum
    code: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    // Write your solution here
    // Print the count of unique triplets summing to 0

    return 0;
}`,
  },
  13: {
    // Longest Substring Without Repeating Characters
    code: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    getline(cin, s);

    // Write your solution here
    // Print the length of the longest substring without repeating characters

    return 0;
}`,
  },
  14: {
    // Search in Rotated Sorted Array
    code: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, target;
    if (!(cin >> n >> target)) return 0;

    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    // Write your solution here
    // Print the 0-based index of target if found, else -1

    return 0;
}`,
  },
  15: {
    // Product of Array Except Self
    code: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    // Write your solution here
    // Print space-separated products without using division

    return 0;
}`,
  },
  16: {
    // House Robber
    code: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    // Write your solution here
    // Print maximum amount of money you can rob tonight

    return 0;
}`,
  },
  17: {
    // Coin Change
    code: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, amount;
    if (!(cin >> n >> amount)) return 0;

    vector<int> coins(n);
    for (int i = 0; i < n; i++) {
        cin >> coins[i];
    }

    // Write your solution here
    // Print the fewest number of coins needed, or -1

    return 0;
}`,
  },
  18: {
    // Valid Anagram
    code: `#include <iostream>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s, t;
    if (!(cin >> s >> t)) return 0;

    // Write your solution here
    // Print "true" or "false"

    return 0;
}`,
  },
  19: {
    // Trapping Rain Water
    code: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<int> height(n);
    for (int i = 0; i < n; i++) {
        cin >> height[i];
    }

    // Write your solution here
    // Print total units of trapped rain water

    return 0;
}`,
  },
  20: {
    // Median of Two Sorted Arrays
    code: `#include <iostream>
#include <vector>
#include <iomanip>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int m, n;
    vector<int> nums1, nums2;
    if (cin >> m) {
        nums1.resize(m);
        for (int i = 0; i < m; i++) cin >> nums1[i];
    }
    if (cin >> n) {
        nums2.resize(n);
        for (int i = 0; i < n; i++) cin >> nums2[i];
    }

    // Write your solution here
    // Print median formatted with 1 decimal place (e.g. 2.0 or 2.5)

    return 0;
}`,
  },
};

async function updateBoilerplates() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.DB_URI);
    console.log("Connected successfully!");

    const problems = await Problem.find().sort({ problemID: 1 });
    console.log(`Found ${problems.length} problems to update.`);

    for (const p of problems) {
      const cpp = cppBoilerplates[p.problemID];
      if (cpp) {
        // Keep existing python starter code if present
        const currentPy = p.starterCode?.language === "python" ? p.starterCode.code : null;

        const starterCodes = [
          { language: "cpp", code: cpp.code },
        ];

        if (currentPy) {
          starterCodes.push({ language: "python", code: currentPy });
        }

        p.starterCode = {
          language: "cpp",
          code: cpp.code,
        };
        p.starterCodes = starterCodes;

        await p.save();
        console.log(`Updated problem #${p.problemID} (${p.title}) with C++ boilerplate.`);
      }
    }

    console.log("\nAll 20 problems updated with C++ boilerplate successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Failed to update boilerplates:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

updateBoilerplates();
