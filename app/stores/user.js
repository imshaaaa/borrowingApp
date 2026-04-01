import { defineStore } from 'pinia'

export const useUserStore = defineStore('userStore', {
  state: () => ({
    user: {
      id: null,
      contact: null,
      course: null,
      department: null,
      email: null,
      firstname: null,
      middlename: null,
      lastname: null,
      status: null,
      user_type: null,
      username: null,
      year_level: null
    }
  }),
  actions: {
    setUserData(data) {
      
      const { admin_id, employee_id, student_id, contact_number, course, department, email, firstname, middlename, lastname, status, user_type, username, year_level } = data

      this.user = {
        id: admin_id || employee_id || student_id || null,
        contact: contact_number,
        course: course || null,
        department: department,
        email: email,
        firstname: firstname,
        middlename: middlename,
        lastname: lastname,
        status: status,
        user_type: user_type,
        username: username,
        year_level: year_level || null
      }
    }
  }
})