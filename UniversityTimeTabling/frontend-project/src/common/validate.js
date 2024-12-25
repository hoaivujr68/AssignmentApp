export function validatePassword(value) {
  const mediumRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,15}$/;
  const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
  return strongRegex.test(value);
}

export function validateUserName(value) {
  const usernameRegex = /^[a-zA-Z0-9]+$/;
  return usernameRegex.test(value);
}
export function validateAmount(value) {
  const usernameRegex = /^[0-9]+$/;
  return usernameRegex.test(value);
}
export function validateCode(value) {
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(value);
}

export const isValidPhone = (value) => {
  if (!value) return true
  const pattern = /^((\+84)|0)([0-9]{9})$/;

  return pattern.test(value);
};

export const isValidEmail = (value) => {
  if (!value) return true
  const pattern = /^[a-zA-Z0-9]+[_a-zA-Z0-9.-]*[a-zA-Z0-9]+@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;

  return pattern.test(value);
};
