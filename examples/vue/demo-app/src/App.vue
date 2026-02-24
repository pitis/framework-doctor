<script setup lang="ts">
import { ref } from 'vue';
import DoctorTestComponent from './components/DoctorTestComponent.vue';

const darkMode = ref(false);
const unusedState = ref(42);
const userRenderedContent = ref('<img src="invalid:" onerror="alert(1)">');
const dynamicJsUrl = ref('javascript:void(0)');

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value;
};
</script>

<template>
  <div class="container">
    <h1>Framework Doctor Vue Demo</h1>
    <p>A minimal Vue app with intentional issues for vue-doctor testing.</p>

    <div class="example">
      <button type="button" @click="toggleDarkMode">
        {{ darkMode ? '☀️ Light' : '🌙 Dark' }}
      </button>
    </div>

    <hr />
    <h2>vue-doctor test section (intentional issues)</h2>
    <div class="example">
      <span v-for="item in ['a', 'b', 'c']" :key="item">{{ item }}</span>

      <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />

      <div role="button" @click="darkMode = !darkMode">Toggle (div, no keyboard)</div>

      <a href="#"> </a>

      <p>Unused state value: {{ unusedState }}</p>

      <DoctorTestComponent label="Test" />

      <div v-html="userRenderedContent" />

      <a href="javascript:alert('XSS')">Click me (javascript: URL)</a>
      <a :href="dynamicJsUrl">Dynamic JS URL</a>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

hr {
  margin: 2rem 0;
  border: none;
  border-top: 1px solid #e0e0e0;
}
</style>
