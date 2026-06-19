import { useState } from "react";
import { toast } from "react-toastify";

const StudentForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    visitAt: "",
    category: "",
    phone: "",
    whatsapp: "",
    courseVisitingFor: "",
    bachelorsCourse: "",
    reference: "",
    registerDoneBeforeVisit: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    setStep(2);
  };

  const handlePrev = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.warning("Please fill in required fields.");
      return;
    }
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Form submitted successfully! We will contact you soon.");
      setFormData({
        name: "",
        email: "",
        visitAt: "",
        category: "",
        phone: "",
        whatsapp: "",
        courseVisitingFor: "",
        bachelorsCourse: "",
        reference: "",
        registerDoneBeforeVisit: ""
      });
      setStep(1);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Registration</h2>
          <p className="text-sm text-gray-500">
            Please fill out the form below to show your interest. Step {step} of 2.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {step === 1 && (
            <>
              {/* 1. Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  required
                />
              </div>

              {/* 2. Email (Included to make exactly 10 fields) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              {/* 3. Visit At */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Visit At
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="visitAt"
                      value="Headquarter Office"
                      checked={formData.visitAt === "Headquarter Office"}
                      onChange={handleChange}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Headquarter Office
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="visitAt"
                      value="University Campus"
                      checked={formData.visitAt === "University Campus"}
                      onChange={handleChange}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    University Campus
                  </label>
                </div>
              </div>

              {/* 4. Category */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Category
                </label>
                <div className="flex gap-4 flex-wrap">
                  {["General", "OBC", "SC/ST", "Other"].map((cat) => (
                    <label key={cat} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={formData.category === cat}
                        onChange={handleChange}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              {/* 5. Phone Number */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  required
                />
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 rounded-lg transition"
                >
                  Next
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* 6. WhatsApp Number */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              {/* 7. Course Visiting For */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Course Visiting For
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="courseVisitingFor"
                      value="Under Graduation"
                      checked={formData.courseVisitingFor === "Under Graduation"}
                      onChange={handleChange}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Under Graduation
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="courseVisitingFor"
                      value="Post Graduation"
                      checked={formData.courseVisitingFor === "Post Graduation"}
                      onChange={handleChange}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Post Graduation
                  </label>
                </div>
              </div>

              {/* 8. Bachelors all course select type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Bachelors Course Selection
                </label>
                <select
                  name="bachelorsCourse"
                  value={formData.bachelorsCourse}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white"
                >
                  <option value="">Select a course</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="B.Sc">B.Sc</option>
                  <option value="B.Com">B.Com</option>
                  <option value="B.A">B.A</option>
                  <option value="BBA">BBA</option>
                  <option value="BCA">BCA</option>
                </select>
              </div>

              {/* 9. Reference */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Reference
                </label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  placeholder="How did you hear about us?"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              {/* 10. Register Done Before Visit */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Registration Done Before Visit?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="registerDoneBeforeVisit"
                      value="Yes"
                      checked={formData.registerDoneBeforeVisit === "Yes"}
                      onChange={handleChange}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="registerDoneBeforeVisit"
                      value="No"
                      checked={formData.registerDoneBeforeVisit === "No"}
                      onChange={handleChange}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    No
                  </label>
                </div>
              </div>

              <div className="mt-4 flex gap-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-1/3 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium text-sm py-2.5 rounded-lg transition"
                >
                  Previous
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium text-sm py-2.5 rounded-lg transition"
                >
                  {loading ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  ) : (
                    "Submit Registration"
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
