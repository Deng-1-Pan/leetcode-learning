## 原题

### 80. Remove Duplicates from Sorted Array II

Given an integer array `nums` sorted in non-decreasing order, remove some duplicates in-place such that each unique element appears at most twice. The relative order of the elements should be kept the same.

Since it is impossible to change the length of the array in some languages, you must instead have the result be placed in the first part of the array `nums`. More formally, if there are `k` elements after removing the duplicates, then the first `k` elements of `nums` should hold the final result. It does not matter what you leave beyond the first `k` elements.

Return `k` after placing the final result in the first `k` slots of `nums`.

Do not allocate extra space for another array. You must do this by modifying the input array in-place with `O(1)` extra memory.

### Custom Judge:

The judge will test your solution with the following code:

```cpp
int[] nums = [...]; // Input array
int[] expectedNums = [...]; // The expected answer with correct length

int k = removeDuplicates(nums); // Calls your implementation

assert k == expectedNums.length;
for (int i = 0; i < k; i++) {
    assert nums[i] == expectedNums[i];
}
```

If all assertions pass, then your solution will be accepted.

### Example 1:

Input: `nums = [1,1,1,2,2,3]`

Output: `5, nums = [1,1,2,2,3,_]`

Explanation: Your function should return `k = 5`, with the first five elements of `nums` being `1`, `1`, `2`, `2` and `3` respectively. It does not matter what you leave beyond the returned `k` (hence they are underscores).

### Example 2:

Input: `nums = [0,0,1,1,1,1,2,3,3]`

Output: `7, nums = [0,0,1,1,2,3,3,_,_]`

Explanation: Your function should return `k = 7`, with the first seven elements of `nums` being `0`, `0`, `1`, `1`, `2`, `3` and `3` respectively. It does not matter what you leave beyond the returned `k` (hence they are underscores).

### Constraints:

- `1 <= nums.length <= 3 * 10^4`
- `-10^4 <= nums[i] <= 10^4`
- `nums` is sorted in non-decreasing order.

## 题目拆解与通用切入点

先把判题方式拆开看：它只检查返回的 `k`，以及 `nums[0:k]` 是否是正确结果；`k` 之后的内容完全不重要。再结合 `O(1)` 额外空间，这告诉我们目标不是“造一个新数组”，而是把**该保留的元素压紧到原数组前缀**。

这题的三个关键概念是：**有序数组**、**原地修改**和**有效前缀**。有序意味着相同值一定连在一起，判断当前元素是否超额只需看它所在的连续段，不必用哈希表做全局统计。原地修改意味着要把“扫描输入”和“维护结果前缀”当作两项不同职责；有效前缀则是任何时刻都已经满足“每个值至多两次”的那一段结果。

这类题常见于“有序数组 + 原地保留 / 删除”的考点。通用切入法是：先问清楚**哪些位置最终必须正确、哪些位置可以忽略**；再把排序带来的“相同值连续”转成一个局部判断；最后为已经处理的结果建立一个不变量，例如“前缀始终合法”。接下来不同方案的差别，只在于如何处理发现的多余元素：立即删除，还是把后续可保留的值覆盖写进前缀。

你说“**完全想不出从哪里下手**”时，可以先不用强迫自己想到双指针。先在 `[1,1,1,2,2,3]` 上圈出必须保留的前缀 `[1,1,2,2,3]`，再问：“第三个 `1` 不保留后，后面的元素怎样回到前缀？”这个问题会自然引出下面的三种正式做法。

## 官方解法

### 方案一：删除多余重复项

题目拆解里的“第三个 `1` 不保留后，后面的元素怎样回到前缀？”可以先用最直接的办法回答：`i` 从左到右扫描，`count` 记录当前值已经连续出现几次。读到第三次出现的值，就从数组中删除 `nums[i]`；删除后右边元素自动左移，因此 `i` 不前进，继续检查刚移到这个位置的新元素。

:::insight
有序数组让重复值挨在一起，所以只需比较 `nums[i]` 和 `nums[i - 1]` 就能更新 `count`。当 `count` 变成 3，删掉当前位置并保持 `i` 不动，正好不会漏掉左移过来的下一个候选值。
:::

播放器里数组会在删除帧真实缩短；`i` 停在删除位置，能直接看见右侧元素向左补位。这种“边扫描边删除”能正确完成题目，但每次删除都可能搬动很多元素。

:::viz approach="official-pop-delete"
:::

### 方案二：覆盖多余重复项

方案一慢在每次发现多余元素后，都把“已经看过或还没看过”的一大段内容重新搬一遍。还是看 `[1,1,1,2,2,3]`：第三个 `1` 不能要，但它右边的 `2,2,3` 其实不用立刻移动；只要以后遇到可保留的 `2` 时，直接把它写进最早的空位即可。

因此让 `read` 继续逐个检查原数组，让 `write` 只指向下一个有效位置。读到第三个 `1` 时，`count` 变为 `3`，`read` 前进但 `write` 不动；读到 `2` 时，`count` 重置为 `1`，把 `2` 覆盖写进 `nums[write]`。被跳过的位置会自然被后续保留值填上，不需要任何删除或整段左移。

:::insight
在 `[1,1,1,2,2,3]` 中跳过第三个 `1` 后，不必马上把 `2,2,3` 左移：下一次保留 `2` 时，把它直接写到最早的空位就行。先由这次“空位会被后续值覆盖”的具体观察，才得到 read 负责检查、write 负责压紧有效前缀的双指针分工。
:::

播放器中 `read` 是当前候选值，`write` 是这次保留值的目标位置；蓝色窗口是已确认有效的前缀。每一帧会显示当前次数，以及值被覆盖写入还是被跳过。

:::viz approach="official-overwrite"
:::

## 社区高赞解法

### 方案一：把有效前缀当作栈

这份社区解答从“栈”角度理解同一问题：把已经确认保留的前缀看成一个栈，`stackSize` 就是栈大小。数组有序，所以如果当前 `nums[i]` 等于“栈顶下方”的元素 `nums[stackSize - 2]`，那么栈顶和栈顶下方已经是同一个值；再把当前值压栈，就会有三个相同值。

先看 `[1,1,1,2,2,3]`。前两个 `1` 先入栈，栈是 `[1,1]`、`stackSize = 2`。读第三个 `1` 时，比较 `nums[stackSize - 2] = nums[0] = 1`，相等，所以不入栈；读到 `2` 时，同样位置仍是 `1`，不同，`2` 可以写入栈顶。这样不需要显式计数：是否会出现第三次，完全由“倒数第二个值是否相同”决定。

:::insight
当有效前缀已经有两个 `1`，其倒数第二个位置也是 `1`；第三个 `1` 再写入必然违规。把“最多两个”翻译成“不能等于栈顶下方”，就可以用 `nums[stackSize - 2]` 一次比较代替 `count`。
:::

播放器中 `i` 指向正在考虑的原数组元素，`stackSize` 标记当前栈顶；蓝色窗口是栈，也就是已保留的有效前缀。每一帧明确显示当前值入栈或被拒绝，以及用来比较的倒数第二个位置。

:::viz approach="community-stack-write-two-back"
:::

:::pitfall
有效结果只保证在 `nums[0:k]`。`k` 之后留下什么不影响判题，不能把整个被修改后的数组都当成答案。
:::

## 复杂度对比总结

- **官方方案一：删除多余重复项**：时间 `O(n^2)`，额外空间 `O(1)`。
- **官方方案二：覆盖多余重复项**：时间 `O(n)`，额外空间 `O(1)`。
- **社区方案：有效前缀作栈**：时间 `O(n)`，额外空间 `O(1)`；和官方方案二等价，但以“栈顶下方”解释判断。
