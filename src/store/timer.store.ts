import { defineStore } from "pinia";
import { shallowRef } from "vue";

export const useTimerStore = defineStore("timer-store", () => {
  const isTimerDialogOpen = shallowRef<boolean>(false);
  const timerTaskName = shallowRef<string>("");
  const timerProject = shallowRef<string>("");
  const timerDescription = shallowRef<string>("");


  const toggleTimerDialog = () => {
    isTimerDialogOpen.value = !isTimerDialogOpen.value;
  };
  
  const startTimer = () => {
    console.log("Starting timer:", {
      task: timerTaskName.value,
      project: timerProject.value,
      description: timerDescription.value,
    });
   
  };

  return {
    isTimerDialogOpen,
    timerTaskName,
    timerProject,
    timerDescription,
    toggleTimerDialog,
    startTimer,
  };
});
