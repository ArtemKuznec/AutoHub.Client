import { useState, type FC, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../Services/authService";
import type { RegisterFormErrors } from "../../types/auth";
import { isValidEmail } from "../../utils/validation";
import "./RegisterPage.css";

const RegisterPage: FC = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const navigate = useNavigate();

  const validate = (): boolean => {
    const newErrors: RegisterFormErrors = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = "Введите email.";
    } else if (!isValidEmail(trimmedEmail)) {
      newErrors.email = "Введите корректный email.";
    }

    const trimmedFullName = fullName.trim();
    if (!trimmedFullName) {
      newErrors.fullName = "Введите ФИО.";
    }

    if (!password) {
      newErrors.password = "Введите пароль.";
    } else if (password.length < 6) {
      newErrors.password = "Пароль должен быть не менее 6 символов.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    try {
      await authService.register({
        email: email.trim(),
        FIO: fullName.trim(),
        password,
      });
      navigate("/login", { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Ошибка регистрации.");
    }
  };

  return (
    <div className="auth-page">
      <main className="auth-main">
        <h1 className="auth-title">Регистрация</h1>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="register-email">
              Email <span className="required">*</span>
            </label>
            <input
              id="register-email"
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
            <label className="auth-label" htmlFor="register-fullName">
              ФИО <span className="required">*</span>
            </label>
            <input
              id="register-fullName"
              type="text"
              autoComplete="name"
              className={`auth-input ${errors.fullName ? "auth-input--error" : ""}`}
              placeholder="Иванов Иван Иванович"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            {errors.fullName && <p className="auth-error">{errors.fullName}</p>}
          </div>
          <div className="auth-field">
            <label className="auth-label" htmlFor="register-password">
              Пароль <span className="required">*</span>
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              className={`auth-input ${errors.password ? "auth-input--error" : ""}`}
              placeholder="Не менее 6 символов"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="auth-error">{errors.password}</p>}
          </div>
          {submitError && <p className="auth-error auth-error--block">{submitError}</p>}
          <button type="submit" className="auth-submit">
            Зарегистрироваться
          </button>
          <p className="auth-footer">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </form>
      </main>
    </div>
  );
};

export default RegisterPage;
