import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import LoadingIndicator from "./LoadingIndicator";
import "../styles/Form.css";

function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const name = method === "login" ? "Login" : "Register";

  const handleSubmit = async (e) => {
    console.log(
      "[Login-Form] handleSubmit START - method value BEFORE anything:",
      method,
      "typeof method:",
      typeof method,
    ); // Log method VERY EARLY
    e.preventDefault();
    setUsernameError("");
    setPasswordError("");
    let isValid = true;
    console.log(
      "[Login-Form] handleSubmit - AFTER isValid init - method value:",
      method,
      "typeof method:",
      typeof method,
    ); // Log method after isValid init
    //This makes sure the user submits Data
    if (!username) {
      setUsernameError("Username is missing");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is missing");
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    setLoading(true);

    console.log(
      "[Login-Form] handleSubmit - BEFORE API call - method value:",
      method,
      "typeof method:",
      typeof method,
    ); // Log method just before API call

    try {
      const res = await api.post(route, { username, password });
      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        localStorage.setItem("username", res.data.username);
        console.log(
          "Antes de redirigir, token en localStorage:",
          localStorage.getItem("access_token"),
        );

        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        if (error.response.data.username) {
          setUsernameError(error.response.data.username[0]);
        }
        if (error.response.data.password) {
          setPasswordError(error.response.data.password[0]);
        } else {
          alert("Error en " + name + ": " + error.message);
        }
      } else {
        alert("Error desconocido: " + error.message);
      }
    } finally {
      setLoading(false);
    }

    console.log(
      "[Login-Form] handleSubmit END - method value at VERY END:",
      method,
      "typeof method:",
      typeof method,
    ); // Log method at the very end of handleSubmit
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h1>
        {" "}
        <span className="AimHub">AimHub </span> {name}{" "}
      </h1>
      <input
        className="form-input"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      {usernameError && <p className="error-message">{usernameError}</p>} {}
      <input
        className="form-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />
      {passwordError && <p className="error-message">{passwordError}</p>} {}
      {loading && <LoadingIndicator />}
      <button className="form-button" type="submit" disabled={loading}>
        Submit
      </button>
      <br />
      <button
        className="RegisterButton"
        onClick={() => navigate(method === "login" ? "/register" : "/login")}
      >
        {method === "login"
          ? "Create an Account"
          : "Already have an account? Login"}
      </button>
    </form>
  );
}

export default Form;
