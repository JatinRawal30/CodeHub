require("dotenv").config();
const mongoose = require("mongoose");
const Problem = require("../models/Problem");

const cppSolutions = {
  1: `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, target;
    if (!(cin >> n >> target)) return 0;

    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    unordered_map<int, int> lookup;
    for (int i = 0; i < n; i++) {
        int diff = target - nums[i];
        if (lookup.find(diff) != lookup.end()) {
            cout << lookup[diff] << " " << i << "\\n";
            return 0;
        }
        lookup[nums[i]] = i;
    }
    return 0;
}`,

  2: `#include <iostream>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    if (!(cin >> s)) return 0;

    string rev = s;
    reverse(rev.begin(), rev.end());
    cout << (s == rev ? "true" : "false") << "\\n";
    return 0;
}`,

  3: `#include <iostream>
#include <string>
#include <stack>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    if (!(cin >> s)) return 0;

    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') {
            st.push(c);
        } else {
            if (st.empty()) {
                cout << "false\\n";
                return 0;
            }
            char top = st.top();
            st.pop();
            if ((c == ')' && top != '(') ||
                (c == '}' && top != '{') ||
                (c == ']' && top != '[')) {
                cout << "false\\n";
                return 0;
            }
        }
    }
    cout << (st.empty() ? "true" : "false") << "\\n";
    return 0;
}`,

  4: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, m;
    vector<int> res;
    if (cin >> n) {
        for (int i = 0; i < n; i++) {
            int x; cin >> x; res.push_back(x);
        }
    }
    if (cin >> m) {
        for (int i = 0; i < m; i++) {
            int x; cin >> x; res.push_back(x);
        }
    }
    sort(res.begin(), res.end());
    for (size_t i = 0; i < res.size(); i++) {
        cout << res[i] << (i + 1 == res.size() ? "" : " ");
    }
    cout << "\\n";
    return 0;
}`,

  5: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) {
        cout << 0 << "\\n";
        return 0;
    }

    int min_price = 1e9, max_profit = 0;
    for (int i = 0; i < n; i++) {
        int price; cin >> price;
        min_price = min(min_price, price);
        max_profit = max(max_profit, price - min_price);
    }
    cout << max_profit << "\\n";
    return 0;
}`,

  6: `#include <iostream>
#include <string>
#include <cctype>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    if (!getline(cin, s)) {
        cout << "true\\n";
        return 0;
    }

    string cleaned = "";
    for (char c : s) {
        if (isalnum(c)) {
            cleaned += tolower(c);
        }
    }
    string rev = cleaned;
    reverse(rev.begin(), rev.end());
    cout << (cleaned == rev ? "true" : "false") << "\\n";
    return 0;
}`,

  7: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, target;
    if (!(cin >> n >> target)) {
        cout << -1 << "\\n";
        return 0;
    }

    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    int left = 0, right = n - 1, ans = -1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) {
            ans = mid;
            break;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    cout << ans << "\\n";
    return 0;
}`,

  8: `#include <iostream>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    if (n <= 2) {
        cout << n << "\\n";
        return 0;
    }
    long long a = 1, b = 2;
    for (int i = 3; i <= n; i++) {
        long long c = a + b;
        a = b;
        b = c;
    }
    cout << b << "\\n";
    return 0;
}`,

  9: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    long long max_so_far = -1e18, curr_max = 0;
    for (int i = 0; i < n; i++) {
        long long x; cin >> x;
        if (i == 0) {
            max_so_far = curr_max = x;
        } else {
            curr_max = max(x, curr_max + x);
            max_so_far = max(max_so_far, curr_max);
        }
    }
    cout << max_so_far << "\\n";
    return 0;
}`,

  10: `#include <iostream>
#include <vector>
#include <unordered_set>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) {
        cout << "false\\n";
        return 0;
    }

    unordered_set<long long> seen;
    bool hasDuplicate = false;
    for (int i = 0; i < n; i++) {
        long long x; cin >> x;
        if (seen.find(x) != seen.end()) {
            hasDuplicate = true;
        }
        seen.insert(x);
    }
    cout << (hasDuplicate ? "true" : "false") << "\\n";
    return 0;
}`,

  11: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) {
        cout << 0 << "\\n";
        return 0;
    }

    vector<long long> height(n);
    for (int i = 0; i < n; i++) cin >> height[i];

    int left = 0, right = n - 1;
    long long max_water = 0;
    while (left < right) {
        long long h = min(height[left], height[right]);
        long long w = right - left;
        max_water = max(max_water, w * h);
        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }
    }
    cout << max_water << "\\n";
    return 0;
}`,

  12: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n) || n < 3) {
        cout << 0 << "\\n";
        return 0;
    }

    vector<long long> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    sort(nums.begin(), nums.end());

    int count = 0;
    for (int i = 0; i < n - 2; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        int left = i + 1, right = n - 1;
        while (left < right) {
            long long sum = nums[i] + nums[left] + nums[right];
            if (sum == 0) {
                count++;
                while (left < right && nums[left] == nums[left + 1]) left++;
                while (left < right && nums[right] == nums[right - 1]) right--;
                left++;
                right--;
            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }
    cout << count << "\\n";
    return 0;
}`,

  13: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s;
    if (!getline(cin, s)) {
        cout << 0 << "\\n";
        return 0;
    }

    vector<int> last(256, -1);
    int max_len = 0, left = 0;
    for (int right = 0; right < (int)s.size(); right++) {
        unsigned char c = s[right];
        if (last[c] >= left) {
            left = last[c] + 1;
        }
        last[c] = right;
        max_len = max(max_len, right - left + 1);
    }
    cout << max_len << "\\n";
    return 0;
}`,

  14: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, target;
    if (!(cin >> n >> target)) {
        cout << -1 << "\\n";
        return 0;
    }

    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    int left = 0, right = n - 1, ans = -1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) {
            ans = mid;
            break;
        }
        if (nums[left] <= nums[mid]) {
            if (nums[left] <= target && target < nums[mid]) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        } else {
            if (nums[mid] < target && target <= nums[right]) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }
    cout << ans << "\\n";
    return 0;
}`,

  15: `#include <iostream>
#include <vector>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) return 0;

    vector<long long> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];

    vector<long long> res(n, 1);
    long long prefix = 1;
    for (int i = 0; i < n; i++) {
        res[i] = prefix;
        prefix *= nums[i];
    }
    long long postfix = 1;
    for (int i = n - 1; i >= 0; i--) {
        res[i] *= postfix;
        postfix *= nums[i];
    }
    for (int i = 0; i < n; i++) {
        cout << res[i] << (i + 1 == n ? "" : " ");
    }
    cout << "\\n";
    return 0;
}`,

  16: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n)) {
        cout << 0 << "\\n";
        return 0;
    }

    long long rob1 = 0, rob2 = 0;
    for (int i = 0; i < n; i++) {
        long long val; cin >> val;
        long long new_rob = max(rob1 + val, rob2);
        rob1 = rob2;
        rob2 = new_rob;
    }
    cout << rob2 << "\\n";
    return 0;
}`,

  17: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n, amount;
    if (!(cin >> n >> amount)) {
        cout << -1 << "\\n";
        return 0;
    }

    vector<int> coins(n);
    for (int i = 0; i < n; i++) cin >> coins[i];

    vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;
    for (int coin : coins) {
        for (int a = coin; a <= amount; a++) {
            dp[a] = min(dp[a], dp[a - coin] + 1);
        }
    }
    cout << (dp[amount] > amount ? -1 : dp[amount]) << "\\n";
    return 0;
}`,

  18: `#include <iostream>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string s, t;
    if (!(cin >> s >> t)) {
        cout << "false\\n";
        return 0;
    }

    if (s.size() != t.size()) {
        cout << "false\\n";
        return 0;
    }
    sort(s.begin(), s.end());
    sort(t.begin(), t.end());
    cout << (s == t ? "true" : "false") << "\\n";
    return 0;
}`,

  19: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    if (!(cin >> n) || n < 3) {
        cout << 0 << "\\n";
        return 0;
    }

    vector<long long> height(n);
    for (int i = 0; i < n; i++) cin >> height[i];

    int left = 0, right = n - 1;
    long long left_max = height[left], right_max = height[right];
    long long water = 0;

    while (left < right) {
        if (left_max < right_max) {
            left++;
            left_max = max(left_max, height[left]);
            water += left_max - height[left];
        } else {
            right--;
            right_max = max(right_max, height[right]);
            water += right_max - height[right];
        }
    }
    cout << water << "\\n";
    return 0;
}`,

  20: `#include <iostream>
#include <vector>
#include <iomanip>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int m, n;
    vector<long long> merged;
    if (cin >> m) {
        for (int i = 0; i < m; i++) {
            long long x; cin >> x; merged.push_back(x);
        }
    }
    if (cin >> n) {
        for (int i = 0; i < n; i++) {
            long long x; cin >> x; merged.push_back(x);
        }
    }
    sort(merged.begin(), merged.end());
    int total = merged.size();
    cout << fixed << setprecision(1);
    if (total % 2 == 1) {
        cout << (double)merged[total / 2] << "\\n";
    } else {
        cout << (double)(merged[total / 2 - 1] + merged[total / 2]) / 2.0 << "\\n";
    }
    return 0;
}`,
};

async function updateReferenceSolutions() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.DB_URI);
    console.log("Connected successfully!");

    const problems = await Problem.find().sort({ problemID: 1 });
    console.log(`Found ${problems.length} problems to update with C++ reference solutions.`);

    for (const p of problems) {
      const cppCode = cppSolutions[p.problemID];
      if (cppCode) {
        const pyCode = p.referenceSolution?.completeCode || "";

        const refSolutions = [
          { language: "cpp", completeCode: cppCode },
        ];

        if (pyCode) {
          refSolutions.push({ language: "python", completeCode: pyCode });
        }

        // Set C++ as primary reference solution, and keep both in referenceSolutions array
        p.referenceSolution = {
          language: "cpp",
          completeCode: cppCode,
        };
        p.referenceSolutions = refSolutions;

        await p.save();
        console.log(`Updated problem #${p.problemID} (${p.title}) with C++ and Python reference solutions.`);
      }
    }

    console.log("\nAll 20 problems now include both C++ and Python reference solutions!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Failed to update reference solutions:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

updateReferenceSolutions();
