import graphs from "../assets/topics/topic-graphs.jpg";
import trees from "../assets/topics/topic-trees.jpg";
import binarySearch from "../assets/topics/topic-binary-search.jpg";
import dp from "../assets/topics/topic-dp.jpg";
import linkedList from "../assets/topics/topic-linked-list.jpg";
import heap from "../assets/topics/topic-heap.jpg";
import backtracking from "../assets/topics/topic-backtracking.jpg";
import arrays from "../assets/topics/topic-arrays.jpg";
import strings from "../assets/topics/topic-strings.jpg";
import stack from "../assets/topics/topic-stack.jpg";
import twoPointers from "../assets/topics/topic-two-pointers.jpg";

// Homepage topic cards. `tag` is the problem tag a card filters by (backend TAG_ENUM);
// `color` tints the title to match the picture.
export const TOPICS = [
  { slug: "graphs", title: "Graphs", tag: "graphs", image: graphs, alt: "Mint nodes connected into a graph", color: "text-success-fg" },
  { slug: "trees", title: "Trees", tag: "trees", image: trees, alt: "Golden nodes branching into a binary tree", color: "text-warning-fg" },
  { slug: "binary-search", title: "Binary Search", tag: "searching", image: binarySearch, alt: "Ordered coral blocks with the middle one selected", color: "text-danger-fg" },
  { slug: "dynamic-programming", title: "Dynamic Programming", tag: "dynamic programming", image: dp, alt: "A grid of mint cells with a glowing diagonal path", color: "text-success-fg" },
  { slug: "linked-list", title: "Linked List", tag: "linked list", image: linkedList, alt: "Amber capsules linked by arrows", color: "text-warning-fg" },
  { slug: "heap", title: "Heap", tag: "heaps", image: heap, alt: "Coral spheres arranged as a heap", color: "text-danger-fg" },
  { slug: "backtracking", title: "Backtracking", tag: "backtracking", image: backtracking, alt: "Branching paths with one highlighted route", color: "text-success-fg" },
  { slug: "arrays", title: "Arrays", tag: "arrays", image: arrays, alt: "A row of pale blue blocks with one lifted", color: "text-primary-glow" },
  { slug: "strings", title: "Strings", tag: "strings", image: strings, alt: "Amber beads threaded on a wave", color: "text-warning-fg" },
  { slug: "stack", title: "Stack", tag: "stack", image: stack, alt: "Mint slabs stacked with the top one lifted", color: "text-success-fg" },
  { slug: "two-pointers", title: "Two Pointers", tag: "two pointers", image: twoPointers, alt: "Grey blocks with coral markers at both ends", color: "text-danger-fg" },
];
