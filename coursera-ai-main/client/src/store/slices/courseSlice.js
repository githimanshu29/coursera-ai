import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  courses: [],
  enrolledCourses: [],
  currentCourse: null,
  isCreateCourseOpen: false,
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setCourses: (state, action) => {
      state.courses = action.payload;
    },
    setEnrolledCourses: (state, action) => {
      state.enrolledCourses = action.payload;
    },
    setCurrentCourse: (state, action) => {
      state.currentCourse = action.payload;
    },
    removeCourse: (state, action) => {
      state.courses = state.courses.filter(
        (c) => c.cid !== action.payload
      );
    },
    removeEnrolledCourse: (state, action) => {
      state.enrolledCourses = state.enrolledCourses.filter(
        (e) => e.course.cid !== action.payload
      );
    },

    openCreateCourse: (state) => {
  state.isCreateCourseOpen = true;
},
closeCreateCourse: (state) => {
  state.isCreateCourseOpen = false;
},

  },
});

export const {
  setCourses,
  setEnrolledCourses,
  setCurrentCourse,
  removeCourse,
  removeEnrolledCourse,
    openCreateCourse,   
  closeCreateCourse,
} = courseSlice.actions;

export default courseSlice.reducer;