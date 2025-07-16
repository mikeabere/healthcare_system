
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {
  HomeLayout,
  Register,
  Login,
  DashboardLayout,
  Error,
  Landing
} from "./pages";

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
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/dashboardlayout",
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
