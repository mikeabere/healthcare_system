import { useState } from "react";
import axios from "axios";
import styled from "styled-components";

const Container = styled.div`
  min-height: 100vh;
  background: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
`;

const Card = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 420px;
  width: 100%;
`;

const Title = styled.h2`
  color: #2563eb;
  font-size: 1.75rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  margin-bottom: 1rem;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }
`;

const Button = styled.button`
  background: #2563eb;
  color: #fff;
  padding: 0.75rem;
  font-weight: 600;
  border: none;
  width: 100%;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #1d4ed8;
  }

  &:disabled {
    background: #a5b4fc;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  margin-bottom: 1rem;
  color: ${(props) => (props.error ? "red" : "green")};
  font-size: 0.95rem;
  text-align: center;
`;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post("/api/auth/forgot-password", { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Title>Forgot Password</Title>

        {message && <Message>{message}</Message>}
        {error && <Message error>{error}</Message>}

        <form onSubmit={handleForgotPassword}>
          <Label>Email Address</Label>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </Card>
    </Container>
  );
};

export default ForgotPassword;
