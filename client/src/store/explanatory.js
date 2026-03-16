 
import { configureStore } from "@reduxjs/toolkit";
//What it is: You are importing a powerful helper function from the official Redux Toolkit library.

// Why it matters: In the "old" days of Redux, setting up a store required multiple complex steps. configureStore automates those steps, like setting up the Redux DevTools and adding middleware (which handles things like asynchronous logic).

import authReducer from "./slices/authSlice.js";
import courseReducer from "./slices/courseSlice.js";

//if store is book, the slice is a one chapter,Name, Initial State, and multiple reducer functions.It automatically generates the Reducer and the Actions for you


/*
What is a Reducer? or a logic function
A Reducer is a plain JavaScript function that determines how the application's state changes in response to an action. It is the "Logic Center."

Think of a Reducer as a Decision Maker:

It takes the Current State (where we are now).

It takes an Action (what happened, e.g., "Add Item").

It returns a New State (where we are going).
The Golden Rule: Reducers never change the existing state directly. They create a copy of the state with the necessary changes.
*/

const store = configureStore({
  reducer: {
    auth: authReducer,
    course: courseReducer,
  },
});
export default store;

// const store: This creates the actual store object that you will later provide to your React app.

// reducer: { ... }: This is where you combine all your different pieces of state.

// The key (e.g., auth) is how you will access that data later using a hook like useSelector(state => state.auth).

// The value (e.g., authReducer) is the logic that dictates how that specific data changes






/*
  
So when do you use which?
Data            Where to store          Why  
user object        Redux          Needed everywhere —                              sidebar, dashboard, 
                               course creation 
isAuthenticatedReduxNeeded by ProtectedRoute, sidebar, navbaraccessTokenRedux + localStorageNeeded by axios interceptorcourses listReact Query (NOT Redux)Server data — needs caching, refetchingenrolled coursesReact Query (NOT Redux)Server data — changes oftencurrent courseReact QueryServer data

*/







/*
**Complete picture of our architecture:**
```
REDUX STORE
└── auth slice
    ├── user        ← who is logged in (set ONCE at login)
    ├── accessToken ← for axios interceptor
    └── isAuthenticated ← for ProtectedRoute

REACT QUERY CACHE
├── ["userCourses"]    ← courses list (refetched when needed)
├── ["enrolledCourses"] ← enrolled courses
└── ["course", id]     ← single course data

AXIOS INSTANCE
└── just a configured HTTP client
    ├── baseURL set
    ├── token auto-attached
    └── auto refresh on 401
*/