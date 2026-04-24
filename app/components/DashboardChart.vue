<script setup>
const props = defineProps({
    showTitle: { type: Boolean, default: false },
    data: { type: Array, default: () => [] }
})

const finalData = computed(() => {
    const grouped = props.data.reduce((acc, item) => {
        let dateObj = new Date(item.borrow_date)
        let monthName = dateObj.toLocaleString('default', { month: 'long' })
        let monthIndex = dateObj.getMonth() 
        let year = dateObj.getFullYear()
        let key = `${year}-${monthIndex}` 

        if (!acc[key]) {
            acc[key] = { 
                month: monthName, 
                year: year, 
                length: 0, 
                sortKey: dateObj.getTime() 
            }
        }
        acc[key].length++
        return acc
    }, {})

    return Object.values(grouped).sort((a, b) => a.sortKey - b.sortKey)
})

console.log('chart', finalData)

const categories = {
    length: { name: 'Borrowed', color: '#2563eb' }
}

const xFormatter = (tick) => {
    return finalData.value[tick]?.month ?? ''
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6 rounded-lg px-6 py-2 shadow mt-6 bg-white">
    <LineChart
      :data="finalData"
      :height="300"
      x-label="Month"
      y-label="Borrow"
      :categories="categories"
      :x-formatter="xFormatter"
      :y-num-ticks="finalData.length"
      :x-num-ticks="finalData.length"
      :curve-type="CurveType.Basis"
      :hide-legend="false"
      :y-grid-line="true"
    />
  </div>
</template>