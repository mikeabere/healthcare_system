
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {
  HomeLayout,
  Register,
  Login,
  DashboardLayout,
} from "./pages";

const router = createBrowserRouter([

 {
  path: '/',
  element: <HomeLayout />,
 },
 {
  path: '/about',
  element: <Register/>   
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
