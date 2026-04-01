<template>
  <IonPage>
    <IonContent>
      <NuxtLayout>
        <div>
          <div class="flex flex-col gap-4">
            <UCard variant="outline" class="shadow px-2 py-2">
              <div class="flex justify-between">
                <p class="text-sm font-medium">Total Borrowed Items</p>
                <UIcon name="i-lucide-box" class="text-blue-500" />
              </div>
              <p class="text-2xl font-bold mt-4 text-gray-800">43</p>
            </UCard>
            <UCard variant="outline" class="shadow px-2 py-2">
              <div class="flex justify-between">
                <p class="text-sm font-medium">Pending Requests</p>
                <UIcon name="i-lucide-workflow" class="text-blue-500" />
              </div>
              <p class="text-2xl font-bold mt-4 text-gray-800">43</p>
            </UCard>
            <UCard variant="outline" class="shadow px-2 py-2">
              <div class="flex justify-between">
                <p class="text-sm font-medium">Overdue Items</p>
                <UIcon name="i-lucide-clock" class="text-blue-500" />
              </div>
              <p class="text-2xl font-bold mt-4 text-gray-800">43</p>
            </UCard>
            <UCard variant="outline" class="shadow px-2 py-2">
              <div class="flex justify-between">
                <p class="text-sm font-medium">Returned Items</p>
                <UIcon name="i-lucide-archive" class="text-blue-500" />
              </div>
              <p class="text-2xl font-bold mt-4 text-gray-800">43</p>
            </UCard>
          </div>
        </div>
      </NuxtLayout>
    </IonContent>
  </IonPage>
</template>

<script setup>
  definePageMeta({
    layout: 'user'
  })
</script>