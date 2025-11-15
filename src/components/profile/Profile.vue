<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-vue-next";

const emit = defineEmits<{
    (e: 'toggleSidebar'): void
}>();
</script>

<template>


    <div class="p-4 border-t border-gray-800">
        <div class="flex items-center gap-3">
          <Avatar class="w-8 h-8">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">John Davis</p>
            <p class="text-xs text-gray-400 truncate">john@company.com</p>
          </div>
          <Button
            @click="emit('toggleSidebar')"
            variant="ghost"
            size="icon-sm"
            class="cursor-pointer text-gray-400 hover:text-black"
          >
            <Menu :size="16" />
          </Button>
        </div>
      </div>
</template>