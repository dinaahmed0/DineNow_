import { Link } from 'react-router-dom';
import { APP_ROUTES } from '../../constants/routes';
import error from '../../assets/404error.png';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl p-6 text-center">
      <img
        src={error}
        alt="Page not found"
        className="max-full w-[min(100%,600px)] h-auto mx-auto"
      />
      <p>
        <Link to={APP_ROUTES.home} className="inline-block text-[#6B8A62] text-xl font-semibold hover:text-[#5A7352] transition-colors duration-200 ">Return to Home?</Link>
      </p>
    </section>
  );
}

