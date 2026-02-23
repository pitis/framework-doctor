<script setup lang="ts">
defineProps<{ label: string }>();

const handleClick = () => {
  console.log('clicked');
};
</script>

<template>
  <button type="button" @click="handleClick">{{ label }}</button>
</template>
