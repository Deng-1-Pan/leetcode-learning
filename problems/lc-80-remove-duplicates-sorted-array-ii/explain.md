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

**先只看判题器。** 它只检查两件事：返回的 `k`，以及 `nums` 前 `k` 个位置。后面的格子可以乱。

**5 秒想一想：** `[1,1,1,2,2,3]` 里的第三个 `1` 被跳过后，它会出现在最终答案里吗？

**直接看答案：** 不会。答案只看前 `k` 格；本例是 `[1,1,2,2,3]`。

**现在只需要记住：** 这题的答案是有效前缀 `nums[0:k]`，不是整个数组。

**再看三个词。** “有序”就是相同的数会挨在一起。`1,1,1` 不会被别的数插开。“原地修改”就是不能另开一个答案数组，只能借原数组的前面格子写答案。“有效前缀”就是目前已经写好、并且每个值最多两次的那一段。

所以第一步不是想双指针。先问一个很小的问题：读到当前数时，它该留下吗？如果该留，怎样让它进入有效前缀？下面的方案只是在回答这个问题时，动作不同。

:::insight
排序把“这个数出现过几次”变成了局部问题：只需看它旁边的同类数，不必统计整张数组。
:::

## 官方解法

### 方案一：删除多余重复项

**这一小步要解决什么？** 第三个 `1` 不要了，最直接怎样处理？答案是：把它从数组里删掉。

`i` 是“正在看的位置”。`count` 是“当前这个数已经连续看见几次”。读到 `[1,1,1]` 的第三个 `1` 时，`count` 变成 `3`。删掉 `nums[i]` 后，右边的 `2` 会左移到这个位置，所以 `i` 不能前进。

**5 秒想一想：** 删掉第三个 `1` 后，原来的第一个 `2` 会移动到哪里？

**直接看答案：** 它移动到刚被删除的位置。因此 `i` 留在原地，才能继续检查这个新来的 `2`。

:::insight
删除会让右边元素左移。`i` 不动，才能不漏看移过来的元素。
:::

:::viz approach="official-pop-delete"
:::

这能做对，但每次删除都要搬动右边许多格子，所以最坏时间是 `O(n^2)`。

**现在只需要记住：** 删除后别急着移动 `i`，因为新元素已经补到了这里。

### 方案二：覆盖多余重复项

**这一小步要解决什么？** 方案一每次都搬一大段，太费力。能不能先不搬？可以。

让 `read` 负责往右看原数组。让 `write` 指向“下一个应该写答案的位置”。第三个 `1` 不保留时，`read` 往前走，`write` 留在空位。之后读到 `2`，直接把 `2` 写进这个空位。

在 `[1,1,1,2,2,3]` 中，跳过第三个 `1` 后，不用立刻移动 `2,2,3`。第一个可保留的 `2` 自己会覆盖这个位置。

**5 秒想一想：** 跳过第三个 `1` 时，哪个指针不动？

**直接看答案：** `write` 不动。它守着等待下一次保留值填入的空位。

:::insight
`read` 负责检查，`write` 负责把合格值压进有效前缀；不用真的删除任何格子。
:::

:::viz approach="official-overwrite"
:::

每个元素只检查一次，所以时间是 `O(n)`，额外空间是 `O(1)`。

**现在只需要记住：** 跳过一个数时让 `read` 走、让 `write` 等；下一个合格数会填空位。

## 社区高赞解法

### 方案一：把有效前缀当作栈

**这一小步要解决什么？** 方案二用 `count` 记次数。社区方案换了一个观察：有效前缀里已经有两个相同数时，第三个一定不能再放。

把有效前缀想成一叠已经保留好的卡片（栈）。`stackSize` 是卡片数量。前两个 `1` 已经是 `[1,1]`。栈顶下面那张卡片也是 `1`。现在又来一个 `1`，放进去就会有三个 `1`，所以拒绝它。

这里的 `nums[stackSize - 2]` 就是“栈顶下方那张卡片”。它不是神秘公式，只是在找倒数第二张。

**5 秒想一想：** 当前栈是 `[1,1]`，下一个数是 `2`。它能进入吗？

**直接看答案：** 能。倒数第二张是 `1`，和 `2` 不同；放入后不会出现三个 `2`。

:::insight
“每个值最多两个”可以换成一句判断：当前值不能等于有效前缀的倒数第二个值。
:::

:::viz approach="community-stack-write-two-back"
:::

时间是 `O(n)`，额外空间是 `O(1)`。

**现在只需要记住：** 想保留当前数前，先和倒数第二个已保留数比较。

:::pitfall
`k` 后面的格子不属于答案。看到数组末尾的旧值，不代表算法出错。
:::

## 复杂度对比总结

- 官方方案一：删除多余重复项 — `O(n^2)` 时间，`O(1)` 额外空间。
- 官方方案二：覆盖多余重复项 — `O(n)` 时间，`O(1)` 额外空间。
- 社区方案：有效前缀作栈 — `O(n)` 时间，`O(1)` 额外空间。
