<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'
import { Loader } from '@/components/ui/loader'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const status = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('')

onMounted(async () => {
  const code = route.query.code as string
  const state = route.query.state as string
  const error = route.query.error as string

  // Проверяем наличие ошибки от Asana
  if (error) {
    status.value = 'error'
    errorMessage.value = `Ошибка авторизации: ${error}`
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 3000)
    return
  }

  // Проверяем наличие code
  if (!code) {
    status.value = 'error'
    errorMessage.value = 'Код авторизации не получен'
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 3000)
    return
  }

  // Проверяем state для защиты от CSRF
  if (!authStore.verifyState(state)) {
    status.value = 'error'
    errorMessage.value = 'Неверный параметр безопасности. Возможная атака.'
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 3000)
    return
  }

  try {
    // Обмениваем code на access token
    const success = await authStore.exchangeCodeForToken(code)

    if (success) {
      status.value = 'success'
      
      // Получаем сохраненный путь для редиректа или используем dashboard
      const redirectPath = sessionStorage.getItem('redirect_after_login') || '/dashboard'
      sessionStorage.removeItem('redirect_after_login')

      setTimeout(() => {
        router.push(redirectPath)
      }, 1000)
    } else {
      status.value = 'error'
      errorMessage.value = authStore.error || 'Не удалось получить токен доступа'
      setTimeout(() => {
        router.push({ name: 'login' })
      }, 3000)
    }
  } catch (err) {
    status.value = 'error'
    errorMessage.value = err instanceof Error ? err.message : 'Произошла неизвестная ошибка'
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 3000)
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#0A0E27] p-4">
    <div class="w-full max-w-md text-center">
      <!-- Loading State -->
      <div v-if="status === 'loading'" class="space-y-6">
        <div class="flex justify-center">
          <Loader class="w-16 h-16 text-[#5B52FF]" />
        </div>
        <div class="space-y-2">
          <h2 class="text-2xl font-bold text-white">Авторизация...</h2>
          <p class="text-gray-400">Пожалуйста, подождите</p>
        </div>
      </div>

      <!-- Success State -->
      <div v-else-if="status === 'success'" class="space-y-6">
        <div class="flex justify-center">
          <div class="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="animate-bounce-in"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        <div class="space-y-2">
          <h2 class="text-2xl font-bold text-white">Успешно!</h2>
          <p class="text-gray-400">Авторизация прошла успешно. Перенаправляем...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="status === 'error'" class="space-y-6">
        <div class="flex justify-center">
          <div class="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
        </div>
        <div class="space-y-2">
          <h2 class="text-2xl font-bold text-white">Ошибка авторизации</h2>
          <p class="text-gray-400">{{ errorMessage }}</p>
          <p class="text-sm text-gray-500">Перенаправляем на страницу входа...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes bounce-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-bounce-in {
  animation: bounce-in 0.5s ease-out;
}
</style>

