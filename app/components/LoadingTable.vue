<template>
  <div class="relative mt-6">
    <div class="bg-white px-4 py-4 rounded-lg border border-gray-200">
      <div class="flex justify-between gap-2 animate-pulse">
        <div class="bg-gray-100 h-8 w-24 rounded-lg"></div>
        <div class="bg-gray-100 h-8 w-24 rounded-lg"></div>
        <div class="bg-gray-100 h-8 w-24 rounded-lg"></div>
        <div class="bg-gray-100 h-8 w-24 rounded-lg"></div>
      </div>
      <div class="flex-row gap-2 mt-2 animate-pulse">
        <div class="w-full bg-gray-100 h-8 rounded-lg mt-2"></div>
        <div class="w-full bg-gray-100 h-8 rounded-lg mt-2"></div>
        <div class="w-full bg-gray-100 h-8 rounded-lg mt-2"></div>
        <div class="w-full bg-gray-100 h-8 rounded-lg mt-2"></div>
        <div class="w-full bg-gray-100 h-8 rounded-lg mt-2"></div>
        <div class="w-full bg-gray-100 h-8 rounded-lg mt-2"></div>
        <div class="w-full bg-gray-100 h-8 rounded-lg mt-2"></div>
        <div class="w-full bg-gray-100 h-8 rounded-lg mt-2"></div>
        <div class="w-full bg-gray-100 h-8 rounded-lg mt-2"></div>
      </div>
    </div>
    <div class="absolute inset-0 flex justify-center items-center h-full bg-transparent text-gray-700">
      <span class="inline-block"><UIcon name="i-lucide-loader-circle" size="24" class="animate-spin mr-2 mt-1"/></span> <span class="inline-block">Loading data ...</span>
    </div>
  </div>
</template>