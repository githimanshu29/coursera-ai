import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  accessToken: localStorage.getItem("accessToken") || null,
  isAuthenticated: !!localStorage.getItem("accessToken"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    //reducers are the only functions allowed to change state
    setCredentials: (state, action) => {
        //setCredentials:purpose is to update the state when user logs in
      const { user, accessToken } = action.payload;
      
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      localStorage.setItem("accessToken", accessToken);
    },
    logout: (state) => {
        //logout:purpose is to clear the state when user logs out
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem("accessToken");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;



//how setcredential is going to be used
// import { useDispatch } from "react-redux";
// import { setCredentials } from "../store/slices/authSlice";

// const dispatch = useDispatch();


/*const userData = {
      user: { name: "John Doe", email:         "john@example.com" },
     accessToken: "abc-123-xyz"
    }; */


// dispatch(setCredentials({ user: userData, accessToken: token }));

//({user:userData, accessToken:token}) => becomes action.playlod in slice