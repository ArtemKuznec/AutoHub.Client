import { useState, useEffect, type FC, type FormEvent } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../Services/authService";
import type { LoginFormErrors, LocationFromState } from "../../types/auth";
import { isValidEmail } from "../../utils/validation";
import "./LoginPage.css";

const LoginPage: FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, setAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as LocationFromState)?.from?.pathname;
      navigate(from && from !== "/login" ? from : "/main", { replace: true });
    }
  }, [isAuthenticated, location.state, navigate]);

  const validate = (): boolean => {
    const newErrors: LoginFormErrors = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = "Введите email.";
    } else if (!isValidEmail(trimmedEmail)) {
      newErrors.email = "Введите корректный email.";
    }

    if (!password) {
      newErrors.password = "Введите пароль.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    try {
      await authService.login({ email: email.trim(), password });
      setAuthenticated(true);
      const from = (location.state as LocationFromState)?.from?.pathname;
      navigate(from && from !== "/login" ? from : "/main", { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Ошибка входа.");
    }
  };

  return (
    <div className="auth-page">
      <main className="auth-main">
        <h1 className="auth-title">Вход</h1>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">
              Email <span className="required">*</span>
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              className={`auth-input ${errors.email ? "auth-input--error" : ""}`}
              placeholder="example@mail.ru"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="auth-error">{errors.email}</p>}
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">
              Пароль <span className="required">*</span>
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              className={`auth-input ${errors.password ? "auth-input--error" : ""}`}
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="auth-error">{errors.password}</p>}
          </div>
          {submitError && <p className="auth-error auth-error--block">{submitError}</p>}
          <button type="submit" className="auth-submit">
            Войти
          </button>
          <p className="auth-footer">
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
        </form>
      </main>
    </div>
  );
};

export default LoginPage;
