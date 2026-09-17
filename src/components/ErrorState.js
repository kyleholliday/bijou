import '../styles/ErrorState.scss';

const ErrorState = ({ message = 'Something went wrong. Please try again.' }) => (
  <div className="error-container">
    <p className="error-message">{message}</p>
  </div>
);

export default ErrorState;
