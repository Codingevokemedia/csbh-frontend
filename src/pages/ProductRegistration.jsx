import { useState } from 'react';

export default function ProductRegistration() {
  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '', address: '',
    dateOfPurchase: '', amountOfPurchase: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 800);
  }

  if (submitted) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-sans text-2xl font-bold text-ink mb-2">Registration Complete</h1>
        <p className="font-sans text-sm text-steel">You will receive a confirmation email shortly.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto px-6 sm:px-10 py-14">
      <h1 className="font-sans text-2xl font-bold text-ink text-center mb-2">Register Your watch</h1>
      <p className="font-sans text-sm text-steel text-center mb-10">Please fill in the information below:</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {[
          { name: 'email',           placeholder: 'Email',              type: 'email' },
          { name: 'firstName',       placeholder: 'First name',         type: 'text'  },
          { name: 'lastName',        placeholder: 'Last name',          type: 'text'  },
          { name: 'address',         placeholder: 'Address',            type: 'text'  },
          { name: 'dateOfPurchase',  placeholder: 'Date Of Purchase',    type: 'text'  },
          { name: 'amountOfPurchase',placeholder: 'Amount Of Purchase',  type: 'text'  },
        ].map(field => (
          <input
            key={field.name}
            name={field.name}
            type={field.type}
            value={form[field.name]}
            onChange={handleChange}
            placeholder={field.placeholder}
            required
            className="w-full border border-cloud bg-white text-ink font-sans text-sm px-4 py-3.5 placeholder:text-mist focus:outline-none focus:border-steel"
          />
        ))}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 font-sans text-[13px] font-semibold tracking-widest uppercase border border-ink text-ink hover:bg-ink hover:text-white transition-all duration-300 disabled:opacity-60 active:scale-[0.97] mt-2"
        >
          {loading ? 'Registering...' : 'REGISTER'}
        </button>
      </form>
    </div>
  );
}
