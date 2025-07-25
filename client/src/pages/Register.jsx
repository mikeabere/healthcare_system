import React from 'react'
import { Logo, FormRow, SelectOptions } from "../components";
import Wrapper from "../assets/wrappers/RegisterAndLoginPage";
import {Link, redirect, Form} from 'react-router-dom';
import customFetch from "../utils/customFetch";
import { toast } from "react-toastify";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    await customFetch.post("/auth/register", data);
    toast.success("Registration successful");
    return redirect("/login");
  } catch (error) {
    toast.error(error?.response?.data?.msg);
    return error;
  }
};

function Register() {
  return (
    <Wrapper>
      <Form method="post" className="form">
        <Logo />
        <h4>Register</h4>
        <FormRow type="text" name="name" />

        <FormRow type="email" name="email" />

        <FormRow type="password" name="password" />
        <FormRow type="text" name="phone" labelText="phone" />
        <SelectOptions name="role" labelText="role" />

        <FormRow type="text" name="specialization" />
        <FormRow type="text" name="address" />
        <FormRow type="date" name="dateofbirth" />

        <button type="submit" className="btn btn-block">
          submit
        </button>
        <p>
          Already a member?
          <Link to="/login" className="member-btn">
            Login
          </Link>
        </p>
      </Form>
    </Wrapper>
  );
}

export default Register