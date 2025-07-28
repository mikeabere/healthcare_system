
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {
  HomeLayout,
  Register,
  Login,
  DashboardLayout,
  Error,
  Landing,
  ForgotPassword,
  ResetPassword
} from "./pages";

import { action as registerAction } from "./pages/Register";
import { action as loginAction } from "./pages/Login";
//import { action as forgotPasswordAction } from "./pages/ForgotPassword";


const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "/register",
        element: <Register />,
        action: registerAction,
      },
      {
        path: "/login",
        element: <Login />,
        action: loginAction,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
        //action: forgotPasswordAction,
      },
      {
        path: "/reset-password/:token",
        element: <ResetPassword />,
      },
      {
        path: "/dashboard",
        element: <DashboardLayout />,
      },
    ],
  },
]);

function App() {
 

  return (
    <>
     <div>
      <RouterProvider router={router}/>
     </div>
    </>
  )
}

export default App
