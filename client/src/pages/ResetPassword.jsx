import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import customFetch from "../utils/customFetch";
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

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const { data } = customFetch.post(`/auth/reset-password/${token}`, {
        password,
      });
      setMessage(data.message);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired token."); //will look at this
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Title>Reset Password</Title>

        {message && <Message>{message}</Message>}
        {error && <Message error>{error}</Message>}

        <form onSubmit={handleResetPassword}>
          <Label>New Password</Label>
          <Input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Label>Confirm New Password</Label>
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </Card>
    </Container>
  );
};

export default ResetPassword;
