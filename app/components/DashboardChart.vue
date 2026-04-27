<script setup>
import { date } from 'yup'

const props = defineProps({
    showTitle: { type: Boolean, default: false },
    data: { type: Array, default: () => [] },
    selectType: { type: String, default: null }
})

let data = ref(props.data)
let xLabel = ref('Month')
let yLabel = ref('Borrowed')

let unreturnedData = props.data.filter(d => d.status === 'Unreturned')
let returnedData = props.data.filter(d => d.status === 'Returned')
let borrowedData = props.data

const finalData = computed(() => {

    if(props.selectType == 'pending') {
        yLabel.value = 'Daily Request'
        xLabel.value = 'Date'

        let groupedData = data.value.reduce((acc, item) => {
            let dateKey = item.borrow_date

            if(!acc[dateKey]) {
                acc[dateKey] = {
                    month: dateKey,
                    length: 0
                }
            }

            acc[dateKey].length++

            return acc
        }, {})

        return Object.values(groupedData).sort((a, b) => {
            return new Date(a.month) - new Date(b.month)
        })

    } else {
        const grouped = data.value.reduce((acc, item) => {
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
    }
})

const categories = {
    length: { name: 'Borrowed', color: '#2563eb' },
}

const xFormatter = (tick) => {
    return finalData.value[tick]?.month ?? ''
}

watch(() => props.selectType, (newValue) => {
    console.log('chart', finalData.value)

    if(props.data !== newValue) {
        if(newValue == 'returned') {
            data.value = returnedData
            yLabel.value = 'Returned'
            xLabel.value = 'Month'
            categories.length.name = 'Returned'
        }
        if(newValue == 'unreturned') {
            data.value = unreturnedData
            yLabel.value = 'Unreturned'
            xLabel.value = 'Month'
            categories.length.name = 'Unreturned'

        }
        if(newValue == 'borrowed') {
            data.value = borrowedData
            yLabel.value = 'Borrowed'
            xLabel.value = 'Month'
            categories.length.name = 'borrowed'

        }
        if(newValue == 'pending') {
            categories.length.name = 'daily request'

        }
    }
})
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6 rounded-lg px-6 py-2 shadow mt-6 bg-white">
    <LineChart
      :data="finalData"
      :height="300"
      :x-label="xLabel"
      :y-label="yLabel"
      :categories="categories"
      :x-formatter="xFormatter"
      :y-num-ticks="finalData.length"
      :x-num-ticks="finalData.length"
      :curve-type="CurveType.Basis"
      :hide-legend="true"
      :y-grid-line="true"
    />
  </div>
</template>