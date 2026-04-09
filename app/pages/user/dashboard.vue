<template>
  <IonPage>
    <IonContent>
        <div class="min-h-full bg-gray-100 pt-24 px-6 mt-6">
          <div class="flex flex-col gap-4">
            <UCard variant="outline" class="shadow px-2 py-2">
              <div class="flex justify-between">
                <p class="text-sm font-medium">Total Borrowed Itemss</p>
                <UIcon name="i-lucide-box" class="text-blue-500" />
              </div>
              <UButton v-if="isGettingData" class="mt-4" variant="soft" color="neutral" loading></UButton>
              <p v-else class="text-2xl font-bold mt-4 text-gray-800">{{ statsStore.stats.total }}</p>
            </UCard>
            <UCard variant="outline" class="shadow px-2 py-2">
              <div class="flex justify-between">
                <p class="text-sm font-medium">Pending Requests</p>
                <UIcon name="i-lucide-workflow" class="text-blue-500" />
              </div>
              <UButton v-if="isGettingData" class="mt-4" variant="soft" color="neutral" loading></UButton>
              <p v-else class="text-2xl font-bold mt-4 text-gray-800">{{ statsStore.stats.pending }}</p>
            </UCard>
            <UCard variant="outline" class="shadow px-2 py-2">
              <div class="flex justify-between">
                <p class="text-sm font-medium">Overdue Items</p>
                <UIcon name="i-lucide-clock" class="text-blue-500" />
              </div>
              <UButton v-if="isGettingData" class="mt-4" variant="soft" color="neutral" loading></UButton>
              <p v-else class="text-2xl font-bold mt-4 text-gray-800">{{ statsStore.stats.overdue }}</p>
            </UCard>
            <UCard variant="outline" class="shadow px-2 py-2">
              <div class="flex justify-between">
                <p class="text-sm font-medium">Returned Items</p>
                <UIcon name="i-lucide-archive" class="text-blue-500" />
              </div>
              <UButton v-if="isGettingData" class="mt-4" variant="soft" color="neutral" loading></UButton>
              <p v-else class="text-2xl font-bold mt-4 text-gray-800">{{ statsStore.stats.returned }}</p>
            </UCard>
          </div>
        
        </div>
    </IonContent>
  </IonPage>
</template>

<script setup>
import { onMounted } from "vue"


  const supabase = useSupabaseClient()
  const userStore = useUserStore()
  const statsStore  = useStatisticsStore()
  const toast = useToast()
  const isGettingData = ref(true)

  const getStatsData = async () => {
    isGettingData.value = true
    try {
      let { data, error } = await supabase
      .from('tbl_borrowed_item')
      .select('*')
      .eq('borrower_id', userStore.user.id)
      .in('status', ['Pending', 'On Going', 'Overdue', 'Return'])

      if (error) throw error

      if(data) {
        statsStore.setStats(data)
        isGettingData.value = false
      }
    } catch (error) {
      toast.add({
        title: 'Server error',
        description: 'An error occured while getting data',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
      console.log(error)
      isGettingData.value = false
    }
    


  }


  definePageMeta({
    layout: 'user'
  })

  onMounted(() => {
    getStatsData()
  })

</script>