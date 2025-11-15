<script setup lang="ts">
interface Props {
  message?: string
}

withDefaults(defineProps<Props>(), {
  message: 'Загрузка...'
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
    <!-- Animated Logo/Spinner -->
    <div class="relative">
      <!-- Outer ring -->
      <div 
        class="h-20 w-20 rounded-full border-4 border-primary/20"
      ></div>
      
      <!-- Spinning ring -->
      <div 
        class="absolute inset-0 h-20 w-20 animate-spin rounded-full border-4 border-transparent border-t-primary border-r-primary"
      ></div>
      
      <!-- Inner pulse -->
      <div 
        class="absolute inset-0 m-auto h-12 w-12 animate-pulse rounded-full bg-primary/10"
      ></div>
    </div>
    
    <!-- Loading text -->
    <div class="mt-8 text-center">
      <p class="text-lg font-medium text-foreground/80">
        {{ message }}
      </p>
      
      <!-- Animated dots -->
      <div class="mt-2 flex justify-center gap-1">
        <span 
          class="h-2 w-2 animate-bounce rounded-full bg-primary"
          style="animation-delay: 0ms"
        ></span>
        <span 
          class="h-2 w-2 animate-bounce rounded-full bg-primary"
          style="animation-delay: 150ms"
        ></span>
        <span 
          class="h-2 w-2 animate-bounce rounded-full bg-primary"
          style="animation-delay: 300ms"
        ></span>
      </div>
    </div>
  </div>
</template>

