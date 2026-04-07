import { defineStore } from 'pinia'

export const useStatisticsStore = defineStore('statsStore', {
  state: () => ({
    stats: {
        total: 0,
        pending: 0,
        overdue: 0,
        returned: 0,
    }
  }),

  actions: {
    setStats(data) {
        console.log('Setting stats with data:', data)
        this.stats.total = data.length
        this.stats.pending = data.filter(item => item.status === 'Pending').length
        this.stats.overdue = data.filter(item => item.status === 'Overdue').length
        this.stats.returned = data.filter(item => item.status === 'Return').length
        
        console.log('s', this.overdue)
    }
  }

})