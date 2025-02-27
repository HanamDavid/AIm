import { useNavigate } from 'react-router-dom';
import '../styles/NotFound.css';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <h1 className="golden-heading">Bad Aim...</h1>
      <p className="subtext">
        Seems like you are lost
        <br />
        Lets go back to make money
      </p>
      <button
        className="elegant-button"
        onClick={() => navigate('/')}
      >
        Return to Refinement
      </button>
    </div>
  );
}

export default NotFound;
