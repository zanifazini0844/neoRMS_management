import { useNavigate } from 'react-router-dom';

function Unauthorized() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] text-slate-900">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-8 shadow-xl space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-[#C3110C]">
          Access denied
        </h1>
        <p className="text-sm text-slate-500">
          You don&apos;t have permission to view this section.
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-[#C3110C] px-4 py-2 text-sm font-medium text-white hover:bg-[#a30e09] transition-colors"
        >
          Back to login
        </button>
      </div>
    </div>
  );
}

export default Unauthorized;

