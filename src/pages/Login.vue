<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PageLoader } from '@/components/ui/loader'
import { useAuthStore } from '@/store/auth.store'

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(false)
const isRedirecting = ref(false)

// Показываем прелоадер при загрузке из store или при редиректе
const showPageLoader = computed(() => authStore.isLoading || isRedirecting.value)

const handleAsanaAuth = () => {
    // Генерируем OAuth URL с правильными параметрами из env
    const oauthUrl = authStore.generateOAuthUrl()
    window.location.href = oauthUrl
}

// Быстрый вход через Personal Access Token (для разработки)
const handleQuickLogin = async () => {
    isLoading.value = true
    const success = await authStore.loginWithToken()

    if (success) {
        router.push({ name: 'dashboard' })
    }
    isLoading.value = false
}

// Проверяем, доступен ли PAT для быстрого входа
const hasPersonalToken = !!import.meta.env.VITE_ASANA_TOKEN || !!import.meta.env.ASANA_TOKEN
//const isDev = import.meta.env.DEV
//const isProd = import.meta.env.PROD

</script>

<template>
    <!-- Прелоадер при редиректе -->
    <PageLoader v-if="showPageLoader" message="Перенаправление..." />
    
    <div v-else class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <!-- Декоративные элементы с фиолетовым свечением -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px]" />
            <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-[#7C3AED]/10 rounded-full blur-[120px]" />
        </div>

        <div class="w-full max-w-md relative z-10 animate-fade-in">
            <!-- Логотип/Название приложения -->
            <div class="text-center mb-10">
                <div
                    class="inline-flex items-center justify-center w-20 h-20 rounded-[20px] bg-linear-to-br from-[#5B52FF] to-[#7C3AED] mb-5 shadow-[0_8px_32px_rgba(91,82,255,0.4)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"
                        stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                </div>
                <h1 class="text-4xl font-bold text-black mb-2">Hive</h1>
                <p class="text-gray-400">Управляйте своим временем эффективно</p>
            </div>

            <Card class="bg-[#151B3B] border-[#1E2548] shadow-2xl">
                <CardHeader class="space-y-1 text-center pb-6">
                    <CardTitle class="text-2xl font-bold text-white">
                        Добро пожаловать
                    </CardTitle>
                    <CardDescription class="text-gray-400">
                        Войдите через Asana для продолжения
                    </CardDescription>
                </CardHeader>

                <CardContent class="space-y-6 pt-2">
                    <!-- Кнопка авторизации через Asana OAuth -->
                    <Button v-if="!isLoading" type="button"
                        class="w-full h-14 text-base font-semibold cursor-pointer gap-3 bg-[#5B52FF] hover:bg-[#4B42EF] text-white shadow-lg shadow-[#5B52FF]/30 transition-all duration-200"
                        size="lg" :disabled="isLoading" @click="handleAsanaAuth">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                            fill="currentColor">
                            <path
                                d="M18.78 12.653c-1.587 0-2.822 1.236-2.822 2.822s1.235 2.822 2.822 2.822S21.6 17.061 21.6 15.475s-1.234-2.822-2.82-2.822zm-6.78-7.364c-1.587 0-2.822 1.236-2.822 2.822s1.235 2.822 2.822 2.822 2.822-1.236 2.822-2.822S13.587 5.29 12 5.29zM5.22 12.653c-1.587 0-2.822 1.236-2.822 2.822s1.235 2.822 2.822 2.822 2.822-1.236 2.822-2.822-1.235-2.822-2.822-2.822z" />
                        </svg>
                        Войти через Asana
                    </Button>

                    <!-- Быстрый вход для разработки -->
                    <div v-if="hasPersonalToken" class="space-y-3">
                        <div class="relative">
                            <Separator class="my-2" />
                           
                        </div>

                        <Button type="button" variant="outline"
                            class="w-full h-12 text-sm font-medium gap-2 border-[#252D51] hover:bg-[#5B52FF] hover:text-white text-black cursor-pointer"
                            :disabled="isLoading" @click="handleQuickLogin">
                            <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                <polyline points="10 17 15 12 10 7" />
                                <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                            <svg v-else class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="2" x2="12" y2="6" />
                                <line x1="12" y1="18" x2="12" y2="22" />
                                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                                <line x1="2" y1="12" x2="6" y2="12" />
                                <line x1="18" y1="12" x2="22" y2="12" />
                                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                            </svg>
                            {{ isLoading ? 'Вход...' : 'Быстрый вход (PAT)' }}
                        </Button>
                    </div>

                    <!-- Информация о разрешениях -->
                    <div class="rounded-xl bg-[#1A2142] border border-[#252D51] p-5 space-y-3">
                        <p class="text-sm font-semibold text-white">
                            Приложение запросит доступ к:
                        </p>
                        <ul class="text-sm text-gray-400 space-y-2.5">
                            <li class="flex items-center gap-3">
                                <div
                                    class="w-5 h-5 rounded-full bg-[#5B52FF]/20 flex items-center justify-center shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                        fill="none" stroke="#5B52FF" stroke-width="3" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                Чтение проектов
                            </li>
                            <li class="flex items-center gap-3">
                                <div
                                    class="w-5 h-5 rounded-full bg-[#5B52FF]/20 flex items-center justify-center shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                        fill="none" stroke="#5B52FF" stroke-width="3" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                Чтение и запись задач
                            </li>
                            <li class="flex items-center gap-3">
                                <div
                                    class="w-5 h-5 rounded-full bg-[#5B52FF]/20 flex items-center justify-center shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                        fill="none" stroke="#5B52FF" stroke-width="3" stroke-linecap="round"
                                        stroke-linejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                Удаление задач
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <!-- Дополнительная информация -->
            <p class="text-center text-sm text-gray-500 mt-8">
                Входя в систему, вы соглашаетесь с нашими
                <a href="#" class="text-[#5B52FF] hover:text-[#7C3AED] transition-colors">Условиями использования</a>
                и
                <a href="#" class="text-[#5B52FF] hover:text-[#7C3AED] transition-colors">Политикой
                    конфиденциальности</a>
            </p>
        </div>
    </div>
</template>

<style scoped>
@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fade-in 0.5s ease-out;
}
</style>
