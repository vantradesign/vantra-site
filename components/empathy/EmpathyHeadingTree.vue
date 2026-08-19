<script setup lang="ts">
import type { HeadingNode } from '~/utils/empathy/structure-report'

defineProps<{ nodes: HeadingNode[] }>()
</script>

<template>
  <ul class="text-[0.875rem]" :class="$attrs.class">
    <li v-for="node in nodes" :key="node.index" class="py-1">
      <span class="inline-block w-8 font-mono text-[0.75rem] font-700 text-blue">h{{ node.level }}</span>
      {{ node.name || '(empty)' }}
      <EmpathyHeadingTree v-if="node.children.length > 0" :nodes="node.children" class="pl-5" />
    </li>
  </ul>
</template>
